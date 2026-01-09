import { Pass, createPass } from '../Pass';
import { PassData, PassImage, PassImageType, BarcodeFormat, TransitType } from '../types';
import JSZip from 'jszip';

describe('Pass', () => {
  const minimalPassData: PassData = {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.example.test',
    serialNumber: 'TEST-001',
    teamIdentifier: 'ABCD1234',
    organizationName: 'Test Organization',
    description: 'Test Pass',
  };

  describe('createPass', () => {
    it('should create a new Pass instance', () => {
      const pass = createPass(minimalPassData);
      expect(pass).toBeInstanceOf(Pass);
    });

    it('should create Pass with images', () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([1, 2, 3]) },
      ];
      const pass = createPass(minimalPassData, images);
      expect(pass).toBeInstanceOf(Pass);
    });
  });

  describe('Pass constructor', () => {
    it('should accept pass data only', () => {
      const pass = new Pass(minimalPassData);
      expect(pass).toBeDefined();
    });

    it('should accept pass data with images', () => {
      const images: PassImage[] = [];
      const pass = new Pass(minimalPassData, images);
      expect(pass).toBeDefined();
    });

    it('should accept pass data with images and personalization', () => {
      const images: PassImage[] = [];
      const personalization = {
        requiredPersonalizationFields: [{ type: 'name' as const, description: 'Your name' }],
        description: 'Personalize your pass',
      };
      const pass = new Pass(minimalPassData, images, personalization);
      expect(pass).toBeDefined();
    });
  });

  describe('generate', () => {
    it('should generate a valid zip file without signature', async () => {
      const pass = createPass(minimalPassData);
      const buffer = await pass.generate({ skipSignature: true });

      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should include pass.json in the zip', async () => {
      const pass = createPass(minimalPassData);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const passJson = zip.file('pass.json');
      expect(passJson).not.toBeNull();
    });

    it('should include manifest.json in the zip', async () => {
      const pass = createPass(minimalPassData);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const manifest = zip.file('manifest.json');
      expect(manifest).not.toBeNull();
    });

    it('should not include signature when skipSignature is true', async () => {
      const pass = createPass(minimalPassData);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const signature = zip.file('signature');
      expect(signature).toBeNull();
    });

    it('should serialize pass data correctly', async () => {
      const passData: PassData = {
        ...minimalPassData,
        backgroundColor: 'rgb(255, 0, 0)',
        foregroundColor: 'rgb(255, 255, 255)',
        storeCard: {
          headerFields: [{ key: 'points', label: 'POINTS', value: '1000' }],
          primaryFields: [{ key: 'name', value: 'John Doe' }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const passJsonFile = zip.file('pass.json');
      const passJsonContent = await passJsonFile!.async('string');
      const parsed = JSON.parse(passJsonContent);

      expect(parsed.backgroundColor).toBe('rgb(255, 0, 0)');
      expect(parsed.storeCard.headerFields[0].key).toBe('points');
    });

    it('should include images in the zip', async () => {
      const iconData = new Uint8Array([137, 80, 78, 71]); // PNG magic bytes
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: iconData },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const icon = zip.file('icon.png');
      expect(icon).not.toBeNull();
    });

    it('should handle retina images correctly', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, scale: 1, data: new Uint8Array([1]) },
        { type: PassImageType.Icon, scale: 2, data: new Uint8Array([2]) },
        { type: PassImageType.Icon, scale: 3, data: new Uint8Array([3]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('icon.png')).not.toBeNull();
      expect(zip.file('icon@2x.png')).not.toBeNull();
      expect(zip.file('icon@3x.png')).not.toBeNull();
    });

    it('should include all image types', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([1]) },
        { type: PassImageType.Logo, data: new Uint8Array([2]) },
        { type: PassImageType.Strip, data: new Uint8Array([3]) },
        { type: PassImageType.Background, data: new Uint8Array([4]) },
        { type: PassImageType.Footer, data: new Uint8Array([5]) },
        { type: PassImageType.Thumbnail, data: new Uint8Array([6]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('icon.png')).not.toBeNull();
      expect(zip.file('logo.png')).not.toBeNull();
      expect(zip.file('strip.png')).not.toBeNull();
      expect(zip.file('background.png')).not.toBeNull();
      expect(zip.file('footer.png')).not.toBeNull();
      expect(zip.file('thumbnail.png')).not.toBeNull();
    });

    it('should include personalization.json when personalization is provided', async () => {
      const personalization = {
        requiredPersonalizationFields: [{ type: 'name' as const, description: 'Your name' }],
        description: 'Personalize your pass',
      };

      const pass = createPass(minimalPassData, [], personalization);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const personalizationFile = zip.file('personalization.json');
      expect(personalizationFile).not.toBeNull();

      const content = await personalizationFile!.async('string');
      const parsed = JSON.parse(content);
      expect(parsed.requiredPersonalizationFields).toHaveLength(1);
      expect(parsed.requiredPersonalizationFields[0].type).toBe('name');
    });

    it('should generate valid SHA1 hashes in manifest', async () => {
      const pass = createPass(minimalPassData);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const manifestFile = zip.file('manifest.json');
      const manifestContent = await manifestFile!.async('string');
      const manifest = JSON.parse(manifestContent);

      // Manifest should have pass.json entry
      expect(manifest['pass.json']).toBeDefined();
      // SHA1 hash is 40 hex characters
      expect(manifest['pass.json']).toMatch(/^[a-f0-9]{40}$/);
    });

    it('should handle barcodes correctly', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'https://example.com/pass/123',
            messageEncoding: 'iso-8859-1',
            altText: 'Scan me',
          },
        ],
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const passJsonFile = zip.file('pass.json');
      const passJsonContent = await passJsonFile!.async('string');
      const parsed = JSON.parse(passJsonContent);

      expect(parsed.barcodes).toHaveLength(1);
      expect(parsed.barcodes[0].format).toBe(BarcodeFormat.QR);
      expect(parsed.barcodes[0].message).toBe('https://example.com/pass/123');
    });

    it('should handle Date objects in relevantDate', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-12-25T10:00:00.000Z',
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const passJsonFile = zip.file('pass.json');
      const passJsonContent = await passJsonFile!.async('string');
      const parsed = JSON.parse(passJsonContent);

      expect(parsed.relevantDate).toBe('2024-12-25T10:00:00.000Z');
    });
  });

  describe('generateBase64', () => {
    it('should generate a valid base64 string', async () => {
      const pass = createPass(minimalPassData);
      const base64 = await pass.generateBase64({ skipSignature: true });

      expect(typeof base64).toBe('string');
      expect(base64.length).toBeGreaterThan(0);
    });

    it('should be decodable back to valid zip', async () => {
      const pass = createPass(minimalPassData);
      const base64 = await pass.generateBase64({ skipSignature: true });

      // Decode base64 to binary
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Verify it's a valid zip
      const zip = await JSZip.loadAsync(bytes);
      expect(zip.file('pass.json')).not.toBeNull();
    });
  });

  describe('setSigningCredentials', () => {
    it('should return the Pass instance for chaining', () => {
      const pass = createPass(minimalPassData);
      const result = pass.setSigningCredentials({
        wwdrCertificate: 'cert',
        signerCertificate: 'signer',
        signerKey: 'key',
      });
      expect(result).toBe(pass);
    });
  });

  describe('complex pass generation', () => {
    it('should generate a complete store card pass', async () => {
      const passData: PassData = {
        formatVersion: 1,
        passTypeIdentifier: 'pass.com.example.storecard',
        serialNumber: 'SC-001',
        teamIdentifier: 'TEAM123',
        organizationName: 'Example Store',
        description: 'Loyalty Card',
        logoText: 'EXAMPLE',
        backgroundColor: 'rgb(60, 65, 76)',
        foregroundColor: 'rgb(255, 255, 255)',
        labelColor: 'rgb(198, 202, 211)',
        storeCard: {
          headerFields: [
            { key: 'points', label: 'POINTS', value: '1,250' },
          ],
          primaryFields: [
            { key: 'name', label: 'MEMBER', value: 'John Appleseed' },
          ],
          secondaryFields: [
            { key: 'memberSince', label: 'MEMBER SINCE', value: '2024' },
            { key: 'level', label: 'LEVEL', value: 'Gold' },
          ],
          auxiliaryFields: [
            { key: 'balance', label: 'BALANCE', value: '$50.00' },
          ],
          backFields: [
            { key: 'terms', label: 'Terms', value: 'Terms and conditions apply.' },
          ],
        },
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'https://example.com/member/12345',
            messageEncoding: 'iso-8859-1',
          },
        ],
        locations: [
          { latitude: 37.7749, longitude: -122.4194, relevantText: 'Store Location' },
        ],
      };

      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([1, 2, 3]) },
        { type: PassImageType.Logo, data: new Uint8Array([4, 5, 6]) },
      ];

      const pass = createPass(passData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);

      // Verify all expected files
      expect(zip.file('pass.json')).not.toBeNull();
      expect(zip.file('manifest.json')).not.toBeNull();
      expect(zip.file('icon.png')).not.toBeNull();
      expect(zip.file('logo.png')).not.toBeNull();

      // Verify pass.json content
      const passJsonContent = await zip.file('pass.json')!.async('string');
      const parsed = JSON.parse(passJsonContent);

      expect(parsed.formatVersion).toBe(1);
      expect(parsed.storeCard).toBeDefined();
      expect(parsed.storeCard.headerFields).toHaveLength(1);
      expect(parsed.storeCard.primaryFields).toHaveLength(1);
      expect(parsed.storeCard.secondaryFields).toHaveLength(2);
      expect(parsed.barcodes).toHaveLength(1);
      expect(parsed.locations).toHaveLength(1);
    });

    it('should generate a boarding pass', async () => {
      const passData: PassData = {
        formatVersion: 1,
        passTypeIdentifier: 'pass.com.example.boarding',
        serialNumber: 'BP-001',
        teamIdentifier: 'TEAM123',
        organizationName: 'Example Airlines',
        description: 'Boarding Pass',
        boardingPass: {
          transitType: TransitType.Air,
          headerFields: [
            { key: 'gate', label: 'GATE', value: 'A12' },
          ],
          primaryFields: [
            { key: 'origin', label: 'SFO', value: 'San Francisco' },
            { key: 'destination', label: 'JFK', value: 'New York' },
          ],
          secondaryFields: [
            { key: 'passenger', label: 'PASSENGER', value: 'John Doe' },
          ],
          auxiliaryFields: [
            { key: 'flight', label: 'FLIGHT', value: 'EX123' },
            { key: 'seat', label: 'SEAT', value: '12A' },
          ],
        },
        barcodes: [
          {
            format: BarcodeFormat.PDF417,
            message: 'M1DOE/JOHN         EABC123 SFOJFKEX 1234 123Y012A0001 100',
          },
        ],
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const passJsonContent = await zip.file('pass.json')!.async('string');
      const parsed = JSON.parse(passJsonContent);

      expect(parsed.boardingPass).toBeDefined();
      expect(parsed.boardingPass.transitType).toBe('PKTransitTypeAir');
      expect(parsed.barcodes[0].format).toBe(BarcodeFormat.PDF417);
    });

    it('should generate an event ticket', async () => {
      const passData: PassData = {
        formatVersion: 1,
        passTypeIdentifier: 'pass.com.example.event',
        serialNumber: 'ET-001',
        teamIdentifier: 'TEAM123',
        organizationName: 'Example Events',
        description: 'Concert Ticket',
        eventTicket: {
          primaryFields: [
            { key: 'event', label: 'EVENT', value: 'Summer Concert' },
          ],
          secondaryFields: [
            { key: 'date', label: 'DATE', value: 'July 15, 2024' },
            { key: 'venue', label: 'VENUE', value: 'City Arena' },
          ],
          auxiliaryFields: [
            { key: 'section', label: 'SECTION', value: 'A' },
            { key: 'row', label: 'ROW', value: '5' },
            { key: 'seat', label: 'SEAT', value: '12' },
          ],
        },
        semantics: {
          eventName: 'Summer Concert',
          venueName: 'City Arena',
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const passJsonContent = await zip.file('pass.json')!.async('string');
      const parsed = JSON.parse(passJsonContent);

      expect(parsed.eventTicket).toBeDefined();
      expect(parsed.semantics.eventName).toBe('Summer Concert');
    });
  });
});
