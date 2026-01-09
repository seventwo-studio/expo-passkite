import { Pass, createPass } from '../Pass';
import { PassData, PassImage, PassImageType, SigningCredentials } from '../types';
import JSZip from 'jszip';
import * as forge from 'node-forge';

describe('Pass Manifest Generation', () => {
  const minimalPassData: PassData = {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.example.test',
    serialNumber: 'TEST-001',
    teamIdentifier: 'ABCD1234',
    organizationName: 'Test Organization',
    description: 'Test Pass',
  };

  /**
   * Helper function to calculate SHA1 hash (mirrors implementation in Pass.ts)
   */
  function calculateSha1(data: Uint8Array): string {
    const md = forge.md.sha1.create();
    let binary = '';
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i]);
    }
    md.update(binary);
    return md.digest().toHex();
  }

  /**
   * Helper to extract manifest from generated pass
   */
  async function getManifest(
    pass: Pass,
    options = { skipSignature: true }
  ): Promise<Record<string, string>> {
    const buffer = await pass.generate(options);
    const zip = await JSZip.loadAsync(buffer);
    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) {
      throw new Error('manifest.json not found in pass');
    }
    const content = await manifestFile.async('string');
    return JSON.parse(content);
  }

  describe('SHA1 hash correctness', () => {
    it('should generate correct SHA1 hash for simple text content', async () => {
      const pass = createPass(minimalPassData);
      const buffer = await pass.generate({ skipSignature: true });
      const zip = await JSZip.loadAsync(buffer);

      const passJsonFile = zip.file('pass.json');
      const passJsonContent = await passJsonFile!.async('uint8array');
      const expectedHash = calculateSha1(passJsonContent);

      const manifest = await getManifest(pass);
      expect(manifest['pass.json']).toBe(expectedHash);
    });

    it('should generate correct SHA1 for binary image data', async () => {
      // PNG magic bytes followed by some data
      const imageData = new Uint8Array([
        137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82,
      ]);
      const images: PassImage[] = [{ type: PassImageType.Icon, data: imageData }];

      const pass = createPass(minimalPassData, images);
      const manifest = await getManifest(pass);

      const expectedHash = calculateSha1(imageData);
      expect(manifest['icon.png']).toBe(expectedHash);
    });

    it('should generate 40-character lowercase hex SHA1 hashes', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([1, 2, 3]) },
        { type: PassImageType.Logo, data: new Uint8Array([4, 5, 6]) },
      ];

      const pass = createPass(minimalPassData, images);
      const manifest = await getManifest(pass);

      for (const hash of Object.values(manifest)) {
        expect(hash).toMatch(/^[a-f0-9]{40}$/);
      }
    });

    it('should produce known SHA1 hash for known input', () => {
      // Known test vector: SHA1 of empty string is da39a3ee5e6b4b0d3255bfef95601890afd80709
      const emptyData = new Uint8Array(0);
      const hash = calculateSha1(emptyData);
      expect(hash).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
    });

    it('should produce known SHA1 hash for "abc"', () => {
      // Known test vector: SHA1 of "abc" is a9993e364706816aba3e25717850c26c9cd0d89d
      const encoder = new TextEncoder();
      const data = encoder.encode('abc');
      const hash = calculateSha1(data);
      expect(hash).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
    });
  });

  describe('Manifest includes all files', () => {
    it('should include pass.json in manifest', async () => {
      const pass = createPass(minimalPassData);
      const manifest = await getManifest(pass);

      expect(manifest['pass.json']).toBeDefined();
    });

    it('should include all image files in manifest', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([1]) },
        { type: PassImageType.Logo, data: new Uint8Array([2]) },
        { type: PassImageType.Strip, data: new Uint8Array([3]) },
        { type: PassImageType.Background, data: new Uint8Array([4]) },
        { type: PassImageType.Footer, data: new Uint8Array([5]) },
        { type: PassImageType.Thumbnail, data: new Uint8Array([6]) },
      ];

      const pass = createPass(minimalPassData, images);
      const manifest = await getManifest(pass);

      expect(manifest['icon.png']).toBeDefined();
      expect(manifest['logo.png']).toBeDefined();
      expect(manifest['strip.png']).toBeDefined();
      expect(manifest['background.png']).toBeDefined();
      expect(manifest['footer.png']).toBeDefined();
      expect(manifest['thumbnail.png']).toBeDefined();
    });

    it('should include retina image variants in manifest', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, scale: 1, data: new Uint8Array([1]) },
        { type: PassImageType.Icon, scale: 2, data: new Uint8Array([2]) },
        { type: PassImageType.Icon, scale: 3, data: new Uint8Array([3]) },
      ];

      const pass = createPass(minimalPassData, images);
      const manifest = await getManifest(pass);

      expect(manifest['icon.png']).toBeDefined();
      expect(manifest['icon@2x.png']).toBeDefined();
      expect(manifest['icon@3x.png']).toBeDefined();
    });

    it('should include personalization.json in manifest when provided', async () => {
      const personalization = {
        requiredPersonalizationFields: [{ type: 'name' as const, description: 'Name' }],
      };

      const pass = createPass(minimalPassData, [], personalization);
      const manifest = await getManifest(pass);

      expect(manifest['personalization.json']).toBeDefined();
    });

    it('should not include personalization.json in manifest when not provided', async () => {
      const pass = createPass(minimalPassData);
      const manifest = await getManifest(pass);

      expect(manifest['personalization.json']).toBeUndefined();
    });

    it('should not include manifest.json itself in manifest', async () => {
      const pass = createPass(minimalPassData);
      const manifest = await getManifest(pass);

      expect(manifest['manifest.json']).toBeUndefined();
    });
  });

  describe('Manifest excludes signature file', () => {
    it('should not include signature in manifest when skipSignature is true', async () => {
      const pass = createPass(minimalPassData);
      const buffer = await pass.generate({ skipSignature: true });
      const zip = await JSZip.loadAsync(buffer);

      // Verify signature file is not present
      expect(zip.file('signature')).toBeNull();

      // Verify signature is not in manifest
      const manifest = await getManifest(pass);
      expect(manifest['signature']).toBeUndefined();
    });

    it('should not include signature hash in manifest even when credentials are set', async () => {
      // Note: We can't actually test with valid credentials without real certs,
      // but we can verify the manifest doesn't include signature when skipped
      const pass = createPass(minimalPassData);
      const manifest = await getManifest(pass, { skipSignature: true });

      expect(manifest['signature']).toBeUndefined();
    });
  });

  describe('Manifest hash consistency', () => {
    it('should produce identical hashes for identical content', async () => {
      const passData: PassData = {
        ...minimalPassData,
        description: 'Consistent Test',
      };

      const pass1 = createPass(passData);
      const pass2 = createPass(passData);

      const manifest1 = await getManifest(pass1);
      const manifest2 = await getManifest(pass2);

      expect(manifest1['pass.json']).toBe(manifest2['pass.json']);
    });

    it('should produce identical hashes for identical image data', async () => {
      const imageData = new Uint8Array([1, 2, 3, 4, 5]);
      const images1: PassImage[] = [{ type: PassImageType.Icon, data: imageData }];
      const images2: PassImage[] = [{ type: PassImageType.Icon, data: new Uint8Array([1, 2, 3, 4, 5]) }];

      const pass1 = createPass(minimalPassData, images1);
      const pass2 = createPass(minimalPassData, images2);

      const manifest1 = await getManifest(pass1);
      const manifest2 = await getManifest(pass2);

      expect(manifest1['icon.png']).toBe(manifest2['icon.png']);
    });

    it('should produce different hashes for different content', async () => {
      const pass1 = createPass({ ...minimalPassData, description: 'Description A' });
      const pass2 = createPass({ ...minimalPassData, description: 'Description B' });

      const manifest1 = await getManifest(pass1);
      const manifest2 = await getManifest(pass2);

      expect(manifest1['pass.json']).not.toBe(manifest2['pass.json']);
    });

    it('should produce different hashes for different image data', async () => {
      const images1: PassImage[] = [{ type: PassImageType.Icon, data: new Uint8Array([1, 2, 3]) }];
      const images2: PassImage[] = [{ type: PassImageType.Icon, data: new Uint8Array([4, 5, 6]) }];

      const pass1 = createPass(minimalPassData, images1);
      const pass2 = createPass(minimalPassData, images2);

      const manifest1 = await getManifest(pass1);
      const manifest2 = await getManifest(pass2);

      expect(manifest1['icon.png']).not.toBe(manifest2['icon.png']);
    });

    it('should regenerate identical hashes across multiple generate calls', async () => {
      const pass = createPass(minimalPassData);

      const manifest1 = await getManifest(pass);
      const manifest2 = await getManifest(pass);
      const manifest3 = await getManifest(pass);

      expect(manifest1['pass.json']).toBe(manifest2['pass.json']);
      expect(manifest2['pass.json']).toBe(manifest3['pass.json']);
    });
  });

  describe('Different file sizes affecting manifest', () => {
    it('should handle small file (1 byte)', async () => {
      const images: PassImage[] = [{ type: PassImageType.Icon, data: new Uint8Array([0]) }];

      const pass = createPass(minimalPassData, images);
      const manifest = await getManifest(pass);

      expect(manifest['icon.png']).toMatch(/^[a-f0-9]{40}$/);
    });

    it('should handle medium file (1KB)', async () => {
      const imageData = new Uint8Array(1024);
      for (let i = 0; i < 1024; i++) {
        imageData[i] = i % 256;
      }

      const images: PassImage[] = [{ type: PassImageType.Icon, data: imageData }];
      const pass = createPass(minimalPassData, images);
      const manifest = await getManifest(pass);

      expect(manifest['icon.png']).toMatch(/^[a-f0-9]{40}$/);
    });

    it('should handle large file (100KB)', async () => {
      const imageData = new Uint8Array(100 * 1024);
      for (let i = 0; i < imageData.length; i++) {
        imageData[i] = Math.floor(Math.random() * 256);
      }

      const images: PassImage[] = [{ type: PassImageType.Icon, data: imageData }];
      const pass = createPass(minimalPassData, images);
      const manifest = await getManifest(pass);

      expect(manifest['icon.png']).toMatch(/^[a-f0-9]{40}$/);
    });

    it('should handle very large file (1MB)', async () => {
      const imageData = new Uint8Array(1024 * 1024);
      for (let i = 0; i < imageData.length; i++) {
        imageData[i] = i % 256;
      }

      const images: PassImage[] = [{ type: PassImageType.Icon, data: imageData }];
      const pass = createPass(minimalPassData, images);
      const manifest = await getManifest(pass);

      expect(manifest['icon.png']).toMatch(/^[a-f0-9]{40}$/);

      // Verify the hash is correct
      const expectedHash = calculateSha1(imageData);
      expect(manifest['icon.png']).toBe(expectedHash);
    });

    it('should correctly hash files of different sizes with different content', async () => {
      const smallImage = new Uint8Array([1, 2, 3]);
      const mediumImage = new Uint8Array(1000);
      mediumImage.fill(42);
      const largeImage = new Uint8Array(10000);
      largeImage.fill(255);

      const images: PassImage[] = [
        { type: PassImageType.Icon, data: smallImage },
        { type: PassImageType.Logo, data: mediumImage },
        { type: PassImageType.Strip, data: largeImage },
      ];

      const pass = createPass(minimalPassData, images);
      const manifest = await getManifest(pass);

      expect(manifest['icon.png']).toBe(calculateSha1(smallImage));
      expect(manifest['logo.png']).toBe(calculateSha1(mediumImage));
      expect(manifest['strip.png']).toBe(calculateSha1(largeImage));
    });
  });

  describe('Empty files in manifest', () => {
    it('should correctly hash empty image data', async () => {
      const emptyData = new Uint8Array(0);
      const images: PassImage[] = [{ type: PassImageType.Icon, data: emptyData }];

      const pass = createPass(minimalPassData, images);
      const manifest = await getManifest(pass);

      // SHA1 of empty data
      const emptyHash = 'da39a3ee5e6b4b0d3255bfef95601890afd80709';
      expect(manifest['icon.png']).toBe(emptyHash);
    });

    it('should include empty files in manifest', async () => {
      const emptyData = new Uint8Array(0);
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: emptyData },
        { type: PassImageType.Logo, data: new Uint8Array([1, 2, 3]) },
      ];

      const pass = createPass(minimalPassData, images);
      const manifest = await getManifest(pass);

      expect(manifest['icon.png']).toBeDefined();
      expect(manifest['logo.png']).toBeDefined();
      expect(manifest['icon.png']).not.toBe(manifest['logo.png']);
    });

    it('should store empty files in zip', async () => {
      const emptyData = new Uint8Array(0);
      const images: PassImage[] = [{ type: PassImageType.Icon, data: emptyData }];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });
      const zip = await JSZip.loadAsync(buffer);

      const iconFile = zip.file('icon.png');
      expect(iconFile).not.toBeNull();

      const content = await iconFile!.async('uint8array');
      expect(content.length).toBe(0);
    });
  });

  describe('File ordering in manifest', () => {
    it('should include files regardless of addition order', async () => {
      // Create passes with images in different orders
      const imageA: PassImage = { type: PassImageType.Icon, data: new Uint8Array([1]) };
      const imageB: PassImage = { type: PassImageType.Logo, data: new Uint8Array([2]) };
      const imageC: PassImage = { type: PassImageType.Strip, data: new Uint8Array([3]) };

      const pass1 = createPass(minimalPassData, [imageA, imageB, imageC]);
      const pass2 = createPass(minimalPassData, [imageC, imageB, imageA]);

      const manifest1 = await getManifest(pass1);
      const manifest2 = await getManifest(pass2);

      // Both manifests should have the same keys
      expect(Object.keys(manifest1).sort()).toEqual(Object.keys(manifest2).sort());

      // Hashes should match for same files
      expect(manifest1['icon.png']).toBe(manifest2['icon.png']);
      expect(manifest1['logo.png']).toBe(manifest2['logo.png']);
      expect(manifest1['strip.png']).toBe(manifest2['strip.png']);
    });

    it('should have consistent manifest structure', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([1]) },
        { type: PassImageType.Logo, data: new Uint8Array([2]) },
      ];

      const pass = createPass(minimalPassData, images);
      const manifest = await getManifest(pass);

      // Manifest should be a plain object with string keys and string values
      expect(typeof manifest).toBe('object');
      for (const [key, value] of Object.entries(manifest)) {
        expect(typeof key).toBe('string');
        expect(typeof value).toBe('string');
      }
    });

    it('should serialize manifest as valid JSON', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([1]) },
        { type: PassImageType.Logo, data: new Uint8Array([2]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });
      const zip = await JSZip.loadAsync(buffer);

      const manifestContent = await zip.file('manifest.json')!.async('string');

      // Should not throw
      expect(() => JSON.parse(manifestContent)).not.toThrow();

      // Should be pretty-printed with 2-space indentation (based on Pass.ts implementation)
      expect(manifestContent).toContain('  ');
    });
  });

  describe('setSigningCredentials with different credential formats', () => {
    it('should accept string credentials', () => {
      const pass = createPass(minimalPassData);
      const credentials: SigningCredentials = {
        wwdrCertificate: '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----',
        signerCertificate: '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----',
        signerKey: '-----BEGIN RSA PRIVATE KEY-----\ntest\n-----END RSA PRIVATE KEY-----',
      };

      // Should not throw
      expect(() => pass.setSigningCredentials(credentials)).not.toThrow();
    });

    it('should accept Buffer credentials', () => {
      const pass = createPass(minimalPassData);
      const credentials: SigningCredentials = {
        wwdrCertificate: Buffer.from('-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----'),
        signerCertificate: Buffer.from('-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----'),
        signerKey: Buffer.from('-----BEGIN RSA PRIVATE KEY-----\ntest\n-----END RSA PRIVATE KEY-----'),
      };

      // Should not throw
      expect(() => pass.setSigningCredentials(credentials)).not.toThrow();
    });

    it('should accept credentials with passphrase', () => {
      const pass = createPass(minimalPassData);
      const credentials: SigningCredentials = {
        wwdrCertificate: '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----',
        signerCertificate: '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----',
        signerKey: '-----BEGIN ENCRYPTED PRIVATE KEY-----\ntest\n-----END ENCRYPTED PRIVATE KEY-----',
        signerKeyPassphrase: 'secret123',
      };

      // Should not throw when setting credentials
      expect(() => pass.setSigningCredentials(credentials)).not.toThrow();
    });

    it('should return pass instance for method chaining', () => {
      const pass = createPass(minimalPassData);
      const credentials: SigningCredentials = {
        wwdrCertificate: 'cert',
        signerCertificate: 'signer',
        signerKey: 'key',
      };

      const result = pass.setSigningCredentials(credentials);
      expect(result).toBe(pass);
    });

    it('should allow multiple setSigningCredentials calls (overwrites)', () => {
      const pass = createPass(minimalPassData);
      const credentials1: SigningCredentials = {
        wwdrCertificate: 'cert1',
        signerCertificate: 'signer1',
        signerKey: 'key1',
      };
      const credentials2: SigningCredentials = {
        wwdrCertificate: 'cert2',
        signerCertificate: 'signer2',
        signerKey: 'key2',
      };

      // Should not throw
      expect(() => {
        pass.setSigningCredentials(credentials1);
        pass.setSigningCredentials(credentials2);
      }).not.toThrow();
    });

    it('should accept empty passphrase', () => {
      const pass = createPass(minimalPassData);
      const credentials: SigningCredentials = {
        wwdrCertificate: 'cert',
        signerCertificate: 'signer',
        signerKey: 'key',
        signerKeyPassphrase: '',
      };

      expect(() => pass.setSigningCredentials(credentials)).not.toThrow();
    });
  });

  describe('Signing with invalid/malformed certificates', () => {
    it('should fail gracefully with empty certificate', async () => {
      const pass = createPass(minimalPassData);
      pass.setSigningCredentials({
        wwdrCertificate: '',
        signerCertificate: '',
        signerKey: '',
      });

      await expect(pass.generate({ skipSignature: false })).rejects.toThrow();
    });

    it('should fail gracefully with invalid PEM format', async () => {
      const pass = createPass(minimalPassData);
      pass.setSigningCredentials({
        wwdrCertificate: 'not a valid certificate',
        signerCertificate: 'also not valid',
        signerKey: 'invalid key',
      });

      await expect(pass.generate({ skipSignature: false })).rejects.toThrow();
    });

    it('should fail gracefully with truncated certificate', async () => {
      const pass = createPass(minimalPassData);
      pass.setSigningCredentials({
        wwdrCertificate: '-----BEGIN CERTIFICATE-----\ntruncated',
        signerCertificate: '-----BEGIN CERTIFICATE-----\ntruncated',
        signerKey: '-----BEGIN RSA PRIVATE KEY-----\ntruncated',
      });

      await expect(pass.generate({ skipSignature: false })).rejects.toThrow();
    });

    it('should fail gracefully with wrong passphrase for encrypted key', async () => {
      const pass = createPass(minimalPassData);
      // Note: This tests the error handling, not actual encrypted key parsing
      // A real encrypted key would be needed for full test coverage
      pass.setSigningCredentials({
        wwdrCertificate: '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----',
        signerCertificate: '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----',
        signerKey: '-----BEGIN ENCRYPTED PRIVATE KEY-----\ntest\n-----END ENCRYPTED PRIVATE KEY-----',
        signerKeyPassphrase: 'wrongpassword',
      });

      await expect(pass.generate({ skipSignature: false })).rejects.toThrow();
    });

    it('should fail gracefully with mismatched certificate types', async () => {
      const pass = createPass(minimalPassData);
      // Using private key where certificate is expected
      pass.setSigningCredentials({
        wwdrCertificate: '-----BEGIN RSA PRIVATE KEY-----\ntest\n-----END RSA PRIVATE KEY-----',
        signerCertificate: '-----BEGIN RSA PRIVATE KEY-----\ntest\n-----END RSA PRIVATE KEY-----',
        signerKey: '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----',
      });

      await expect(pass.generate({ skipSignature: false })).rejects.toThrow();
    });

    it('should still generate pass without signature when skipSignature is true with invalid credentials', async () => {
      const pass = createPass(minimalPassData);
      pass.setSigningCredentials({
        wwdrCertificate: 'invalid',
        signerCertificate: 'invalid',
        signerKey: 'invalid',
      });

      // Should succeed because signature is skipped
      const buffer = await pass.generate({ skipSignature: true });
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should fail gracefully with null-like values in credentials', async () => {
      const pass = createPass(minimalPassData);
      pass.setSigningCredentials({
        wwdrCertificate: 'null',
        signerCertificate: 'undefined',
        signerKey: 'false',
      });

      await expect(pass.generate({ skipSignature: false })).rejects.toThrow();
    });
  });

  describe('Base64 encoding correctness', () => {
    it('should produce valid base64 string', async () => {
      const pass = createPass(minimalPassData);
      const base64 = await pass.generateBase64({ skipSignature: true });

      // Valid base64 should only contain these characters
      expect(base64).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it('should have correct base64 padding', async () => {
      const pass = createPass(minimalPassData);
      const base64 = await pass.generateBase64({ skipSignature: true });

      // Base64 length should be divisible by 4
      expect(base64.length % 4).toBe(0);
    });

    it('should decode to same content as generate()', async () => {
      const pass = createPass(minimalPassData);
      const buffer = await pass.generate({ skipSignature: true });
      const base64 = await pass.generateBase64({ skipSignature: true });

      // Decode base64
      const binaryString = atob(base64);
      const decoded = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        decoded[i] = binaryString.charCodeAt(i);
      }

      expect(decoded).toEqual(buffer);
    });

    it('should produce consistent base64 for same pass', async () => {
      const pass = createPass(minimalPassData);

      const base64_1 = await pass.generateBase64({ skipSignature: true });
      const base64_2 = await pass.generateBase64({ skipSignature: true });

      expect(base64_1).toBe(base64_2);
    });

    it('should handle large pass data in base64', async () => {
      // Create pass with large image to test base64 encoding
      const largeImage = new Uint8Array(50 * 1024); // 50KB
      for (let i = 0; i < largeImage.length; i++) {
        largeImage[i] = i % 256;
      }

      const images: PassImage[] = [{ type: PassImageType.Background, data: largeImage }];
      const pass = createPass(minimalPassData, images);
      const base64 = await pass.generateBase64({ skipSignature: true });

      // Should be valid base64
      expect(base64).toMatch(/^[A-Za-z0-9+/=]+$/);
      expect(base64.length % 4).toBe(0);

      // Decode and verify it's a valid zip
      const binaryString = atob(base64);
      const decoded = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        decoded[i] = binaryString.charCodeAt(i);
      }

      const zip = await JSZip.loadAsync(decoded);
      expect(zip.file('background.png')).not.toBeNull();
    });

    it('should correctly encode binary data including null bytes', async () => {
      // Image data with null bytes and high bytes
      const imageData = new Uint8Array([0, 127, 128, 255, 0, 0, 255, 255]);
      const images: PassImage[] = [{ type: PassImageType.Icon, data: imageData }];

      const pass = createPass(minimalPassData, images);
      const base64 = await pass.generateBase64({ skipSignature: true });

      // Decode and verify
      const binaryString = atob(base64);
      const decoded = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        decoded[i] = binaryString.charCodeAt(i);
      }

      const zip = await JSZip.loadAsync(decoded);
      const iconContent = await zip.file('icon.png')!.async('uint8array');

      expect(iconContent).toEqual(imageData);
    });

    it('should handle empty pass in base64', async () => {
      const pass = createPass(minimalPassData);
      const base64 = await pass.generateBase64({ skipSignature: true });

      expect(typeof base64).toBe('string');
      expect(base64.length).toBeGreaterThan(0);

      // Should still be decodable
      const binaryString = atob(base64);
      expect(binaryString.length).toBeGreaterThan(0);
    });

    it('should encode special characters in pass data correctly', async () => {
      const passData: PassData = {
        ...minimalPassData,
        description: 'Test with special chars: \u00e9\u00e0\u00fc\u4e2d\u6587\ud83d\ude00',
        organizationName: 'Caf\u00e9 & Restaurant',
      };

      const pass = createPass(passData);
      const base64 = await pass.generateBase64({ skipSignature: true });

      // Decode and verify pass.json content
      const binaryString = atob(base64);
      const decoded = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        decoded[i] = binaryString.charCodeAt(i);
      }

      const zip = await JSZip.loadAsync(decoded);
      const passJsonContent = await zip.file('pass.json')!.async('string');
      const parsed = JSON.parse(passJsonContent);

      expect(parsed.description).toBe('Test with special chars: \u00e9\u00e0\u00fc\u4e2d\u6587\ud83d\ude00');
      expect(parsed.organizationName).toBe('Caf\u00e9 & Restaurant');
    });
  });

  describe('Edge cases in manifest generation', () => {
    it('should handle pass with many images', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, scale: 1, data: new Uint8Array([1]) },
        { type: PassImageType.Icon, scale: 2, data: new Uint8Array([2]) },
        { type: PassImageType.Icon, scale: 3, data: new Uint8Array([3]) },
        { type: PassImageType.Logo, scale: 1, data: new Uint8Array([4]) },
        { type: PassImageType.Logo, scale: 2, data: new Uint8Array([5]) },
        { type: PassImageType.Logo, scale: 3, data: new Uint8Array([6]) },
        { type: PassImageType.Strip, scale: 1, data: new Uint8Array([7]) },
        { type: PassImageType.Strip, scale: 2, data: new Uint8Array([8]) },
        { type: PassImageType.Strip, scale: 3, data: new Uint8Array([9]) },
        { type: PassImageType.Background, scale: 1, data: new Uint8Array([10]) },
        { type: PassImageType.Background, scale: 2, data: new Uint8Array([11]) },
        { type: PassImageType.Footer, scale: 1, data: new Uint8Array([12]) },
        { type: PassImageType.Footer, scale: 2, data: new Uint8Array([13]) },
        { type: PassImageType.Thumbnail, scale: 1, data: new Uint8Array([14]) },
        { type: PassImageType.Thumbnail, scale: 2, data: new Uint8Array([15]) },
      ];

      const pass = createPass(minimalPassData, images);
      const manifest = await getManifest(pass);

      // Should have pass.json + all 15 images = 16 entries
      expect(Object.keys(manifest).length).toBe(16);
    });

    it('should handle pass with complex nested data', async () => {
      const passData: PassData = {
        ...minimalPassData,
        storeCard: {
          headerFields: [
            { key: 'header1', value: 'value1', label: 'Header 1' },
            { key: 'header2', value: 100, label: 'Header 2' },
          ],
          primaryFields: [{ key: 'primary', value: 'Primary Value' }],
          secondaryFields: [
            { key: 'sec1', value: 'Sec 1' },
            { key: 'sec2', value: 'Sec 2' },
          ],
          auxiliaryFields: [{ key: 'aux', value: 'Aux' }],
          backFields: [
            { key: 'back1', value: 'Back 1' },
            { key: 'back2', value: 'Back 2' },
            { key: 'back3', value: 'Back 3' },
          ],
        },
        locations: [
          { latitude: 37.7749, longitude: -122.4194 },
          { latitude: 40.7128, longitude: -74.006 },
        ],
        barcodes: [
          { format: 'PKBarcodeFormatQR' as any, message: 'test1' },
          { format: 'PKBarcodeFormatPDF417' as any, message: 'test2' },
        ],
      };

      const pass = createPass(passData);
      const manifest = await getManifest(pass);

      expect(manifest['pass.json']).toBeDefined();
      expect(manifest['pass.json']).toMatch(/^[a-f0-9]{40}$/);
    });

    it('should handle pass data with maximum string lengths', async () => {
      const longString = 'x'.repeat(10000);
      const passData: PassData = {
        ...minimalPassData,
        description: longString,
        logoText: longString,
      };

      const pass = createPass(passData);
      const manifest = await getManifest(pass);

      expect(manifest['pass.json']).toBeDefined();
    });

    it('should handle pass with all optional fields', async () => {
      const passData: PassData = {
        formatVersion: 1,
        passTypeIdentifier: 'pass.com.example.full',
        serialNumber: 'FULL-001',
        teamIdentifier: 'TEAM12345',
        organizationName: 'Full Test Org',
        description: 'Full Test Pass',
        foregroundColor: 'rgb(0, 0, 0)',
        backgroundColor: 'rgb(255, 255, 255)',
        labelColor: 'rgb(128, 128, 128)',
        logoText: 'FULL TEST',
        webServiceURL: 'https://example.com/passes',
        authenticationToken: 'token12345',
        relevantDate: '2024-01-01T00:00:00Z',
        maxDistance: 1000,
        expirationDate: '2025-01-01T00:00:00Z',
        voided: false,
        groupingIdentifier: 'group123',
        sharingProhibited: false,
        locations: [{ latitude: 0, longitude: 0 }],
        beacons: [{ proximityUUID: '12345678-1234-1234-1234-123456789012' }],
        barcodes: [{ format: 'PKBarcodeFormatQR' as any, message: 'test' }],
        generic: {
          primaryFields: [{ key: 'test', value: 'test' }],
        },
      };

      const pass = createPass(passData);
      const manifest = await getManifest(pass);

      expect(manifest['pass.json']).toBeDefined();
    });
  });
});
