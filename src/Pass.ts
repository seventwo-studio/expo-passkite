import JSZip from 'jszip';
import * as forge from 'node-forge';
import {
  PassData,
  PassImage,
  PassImageType,
  SigningCredentials,
  PassGenerationOptions,
  Personalization,
} from './types';

// Polyfill for Buffer in React Native
const BufferPolyfill = {
  from: (data: string | Uint8Array, encoding?: string): Uint8Array => {
    if (typeof data === 'string') {
      if (encoding === 'base64') {
        const binaryString = atob(data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      }
      // Default to utf-8
      const encoder = new TextEncoder();
      return encoder.encode(data);
    }
    return new Uint8Array(data);
  },
  toString: (data: Uint8Array, encoding?: string): string => {
    if (encoding === 'base64') {
      let binary = '';
      for (let i = 0; i < data.length; i++) {
        binary += String.fromCharCode(data[i]);
      }
      return btoa(binary);
    }
    // Default to utf-8
    const decoder = new TextDecoder();
    return decoder.decode(data);
  },
};

/**
 * Get the filename for an image based on type and scale
 */
function getImageFilename(type: PassImageType, scale?: 1 | 2 | 3): string {
  const baseName = type.toString();
  if (!scale || scale === 1) {
    return `${baseName}.png`;
  }
  return `${baseName}@${scale}x.png`;
}

/**
 * Serialize pass field content for JSON
 */
function serializePassData(data: PassData): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Copy all non-undefined values
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      if (key === 'relevantDates' && Array.isArray(value)) {
        // Convert RelevantDate objects to ISO strings
        result[key] = value.map((rd: { startDate?: Date; endDate?: Date }) => {
          const obj: Record<string, string> = {};
          if (rd.startDate) {
            obj.startDate = rd.startDate instanceof Date
              ? rd.startDate.toISOString()
              : rd.startDate;
          }
          if (rd.endDate) {
            obj.endDate = rd.endDate instanceof Date
              ? rd.endDate.toISOString()
              : rd.endDate;
          }
          return obj;
        });
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Recursively serialize nested objects
        const nested = serializePassData(value as PassData);
        if (Object.keys(nested).length > 0) {
          result[key] = nested;
        }
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Calculate SHA1 hash of data using node-forge
 */
function sha1Hash(data: Uint8Array): string {
  const md = forge.md.sha1.create();
  // Convert Uint8Array to binary string for forge
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  md.update(binary);
  return md.digest().toHex();
}

/**
 * Create PKCS#7 signature for the manifest
 */
function createSignature(
  manifestData: Uint8Array,
  credentials: SigningCredentials
): Uint8Array {
  // Parse certificates - convert Uint8Array to string if needed
  const wwdrCertStr = credentials.wwdrCertificate instanceof Uint8Array
    ? BufferPolyfill.toString(credentials.wwdrCertificate)
    : credentials.wwdrCertificate;
  const signerCertStr = credentials.signerCertificate instanceof Uint8Array
    ? BufferPolyfill.toString(credentials.signerCertificate)
    : credentials.signerCertificate;
  const keyPemStr = credentials.signerKey instanceof Uint8Array
    ? BufferPolyfill.toString(credentials.signerKey)
    : credentials.signerKey;

  const wwdrCert = forge.pki.certificateFromPem(wwdrCertStr);
  const signerCert = forge.pki.certificateFromPem(signerCertStr);

  let signerKey: forge.pki.PrivateKey;
  if (credentials.signerKeyPassphrase) {
    signerKey = forge.pki.decryptRsaPrivateKey(
      keyPemStr,
      credentials.signerKeyPassphrase
    );
  } else {
    signerKey = forge.pki.privateKeyFromPem(keyPemStr);
  }

  // Create PKCS#7 signed data
  const p7 = forge.pkcs7.createSignedData();
  // Convert Uint8Array to binary string
  let manifestBinary = '';
  for (let i = 0; i < manifestData.length; i++) {
    manifestBinary += String.fromCharCode(manifestData[i]);
  }
  p7.content = forge.util.createBuffer(manifestBinary);

  p7.addCertificate(signerCert);
  p7.addCertificate(wwdrCert);

  p7.addSigner({
    key: signerKey,
    certificate: signerCert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      {
        type: forge.pki.oids.contentType,
        value: forge.pki.oids.data,
      },
      {
        type: forge.pki.oids.messageDigest,
      },
      {
        type: forge.pki.oids.signingTime,
        value: new Date().toISOString(),
      },
    ],
  });

  p7.sign({ detached: true });

  // Convert to DER format
  const asn1 = p7.toAsn1();
  const der = forge.asn1.toDer(asn1);
  const derBytes = der.getBytes();

  // Convert binary string to Uint8Array
  const result = new Uint8Array(derBytes.length);
  for (let i = 0; i < derBytes.length; i++) {
    result[i] = derBytes.charCodeAt(i);
  }
  return result;
}

/**
 * Pass class for generating .pkpass files
 */
export class Pass {
  private passData: PassData;
  private images: PassImage[];
  private personalization?: Personalization;
  private credentials?: SigningCredentials;

  constructor(
    passData: PassData,
    images: PassImage[] = [],
    personalization?: Personalization
  ) {
    this.passData = passData;
    this.images = images;
    this.personalization = personalization;
  }

  /**
   * Set signing credentials
   */
  setSigningCredentials(credentials: SigningCredentials): this {
    this.credentials = credentials;
    return this;
  }

  /**
   * Generate the .pkpass file as a Uint8Array
   */
  async generate(options: PassGenerationOptions = {}): Promise<Uint8Array> {
    const zip = new JSZip();
    const manifest: Record<string, string> = {};

    // Add pass.json
    const passJson = JSON.stringify(serializePassData(this.passData), null, 2);
    const passJsonBuffer = BufferPolyfill.from(passJson, 'utf-8');
    zip.file('pass.json', passJsonBuffer);
    manifest['pass.json'] = sha1Hash(passJsonBuffer);

    // Add images
    for (const image of this.images) {
      const filename = getImageFilename(image.type, image.scale);
      const imageData = image.data instanceof Uint8Array
        ? image.data
        : BufferPolyfill.from(image.data as unknown as string);
      zip.file(filename, imageData);
      manifest[filename] = sha1Hash(imageData);
    }

    // Add personalization.json if present
    if (this.personalization) {
      const personalizationJson = JSON.stringify(this.personalization, null, 2);
      const personalizationBuffer = BufferPolyfill.from(personalizationJson, 'utf-8');
      zip.file('personalization.json', personalizationBuffer);
      manifest['personalization.json'] = sha1Hash(personalizationBuffer);
    }

    // Add manifest.json
    const manifestJson = JSON.stringify(manifest, null, 2);
    const manifestBuffer = BufferPolyfill.from(manifestJson, 'utf-8');
    zip.file('manifest.json', manifestBuffer);

    // Add signature if credentials provided and not skipped
    if (this.credentials && !options.skipSignature) {
      const signature = createSignature(manifestBuffer, this.credentials);
      zip.file('signature', signature);
    }

    // Generate the zip file
    const zipBuffer = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    return zipBuffer;
  }

  /**
   * Generate the .pkpass file as a base64 string
   */
  async generateBase64(options: PassGenerationOptions = {}): Promise<string> {
    const buffer = await this.generate(options);
    return BufferPolyfill.toString(buffer, 'base64');
  }
}

/**
 * Create a new Pass instance from builder output
 */
export function createPass(
  passData: PassData,
  images: PassImage[] = [],
  personalization?: Personalization
): Pass {
  return new Pass(passData, images, personalization);
}
