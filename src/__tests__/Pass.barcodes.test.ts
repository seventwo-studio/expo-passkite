import { createPass } from '../Pass';
import { PassData, BarcodeFormat, Barcode } from '../types';
import JSZip from 'jszip';

describe('Pass Barcode Edge Cases', () => {
  const minimalPassData: PassData = {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.example.test',
    serialNumber: 'TEST-001',
    teamIdentifier: 'ABCD1234',
    organizationName: 'Test Organization',
    description: 'Test Pass',
  };

  async function getPassJson(passData: PassData): Promise<Record<string, unknown>> {
    const pass = createPass(passData);
    const buffer = await pass.generate({ skipSignature: true });
    const zip = await JSZip.loadAsync(buffer);
    const passJsonFile = zip.file('pass.json');
    const passJsonContent = await passJsonFile!.async('string');
    return JSON.parse(passJsonContent);
  }

  describe('All Barcode Formats', () => {
    it('should handle QR barcode format', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'QR-CODE-DATA',
            messageEncoding: 'iso-8859-1',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect(parsed.barcodes).toHaveLength(1);
      expect((parsed.barcodes as Barcode[])[0].format).toBe('PKBarcodeFormatQR');
    });

    it('should handle PDF417 barcode format', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.PDF417,
            message: 'PDF417-DATA-STRING',
            messageEncoding: 'iso-8859-1',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect(parsed.barcodes).toHaveLength(1);
      expect((parsed.barcodes as Barcode[])[0].format).toBe('PKBarcodeFormatPDF417');
    });

    it('should handle Aztec barcode format', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.Aztec,
            message: 'AZTEC-CODE-DATA',
            messageEncoding: 'iso-8859-1',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect(parsed.barcodes).toHaveLength(1);
      expect((parsed.barcodes as Barcode[])[0].format).toBe('PKBarcodeFormatAztec');
    });

    it('should handle Code128 barcode format', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.Code128,
            message: 'CODE128-DATA',
            messageEncoding: 'iso-8859-1',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect(parsed.barcodes).toHaveLength(1);
      expect((parsed.barcodes as Barcode[])[0].format).toBe('PKBarcodeFormatCode128');
    });

    it('should handle all barcode formats simultaneously', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          { format: BarcodeFormat.QR, message: 'QR-DATA' },
          { format: BarcodeFormat.PDF417, message: 'PDF417-DATA' },
          { format: BarcodeFormat.Aztec, message: 'AZTEC-DATA' },
          { format: BarcodeFormat.Code128, message: 'CODE128-DATA' },
        ],
      };

      const parsed = await getPassJson(passData);
      expect(parsed.barcodes).toHaveLength(4);
      expect((parsed.barcodes as Barcode[])[0].format).toBe('PKBarcodeFormatQR');
      expect((parsed.barcodes as Barcode[])[1].format).toBe('PKBarcodeFormatPDF417');
      expect((parsed.barcodes as Barcode[])[2].format).toBe('PKBarcodeFormatAztec');
      expect((parsed.barcodes as Barcode[])[3].format).toBe('PKBarcodeFormatCode128');
    });
  });

  describe('Empty Message Strings', () => {
    it('should handle empty message string', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: '',
            messageEncoding: 'iso-8859-1',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect(parsed.barcodes).toHaveLength(1);
      expect((parsed.barcodes as Barcode[])[0].message).toBe('');
    });

    it('should handle whitespace-only message string', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: '   ',
            messageEncoding: 'iso-8859-1',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toBe('   ');
    });

    it('should handle message with only newlines', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: '\n\n\n',
            messageEncoding: 'iso-8859-1',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toBe('\n\n\n');
    });

    it('should handle message with tabs', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: '\t\t\t',
            messageEncoding: 'iso-8859-1',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toBe('\t\t\t');
    });
  });

  describe('Very Long Barcode Messages', () => {
    it('should handle very long message (1000 characters)', async () => {
      const longMessage = 'A'.repeat(1000);
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: longMessage,
            messageEncoding: 'iso-8859-1',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toBe(longMessage);
      expect((parsed.barcodes as Barcode[])[0].message.length).toBe(1000);
    });

    it('should handle very long message (10000 characters)', async () => {
      const longMessage = 'B'.repeat(10000);
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.PDF417,
            message: longMessage,
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message.length).toBe(10000);
    });

    it('should handle extremely long message (100000 characters)', async () => {
      const longMessage = 'C'.repeat(100000);
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.Aztec,
            message: longMessage,
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message.length).toBe(100000);
    });

    it('should handle long message with mixed content', async () => {
      const longMessage = 'ABC123!@#'.repeat(1111);
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: longMessage,
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toBe(longMessage);
    });
  });

  describe('Special Characters in Messages', () => {
    it('should handle unicode characters', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'Hello \u00e9\u00e8\u00ea\u00eb \u4e2d\u6587 \ud83d\ude00',
            messageEncoding: 'utf-8',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toContain('\u00e9');
      expect((parsed.barcodes as Barcode[])[0].message).toContain('\u4e2d\u6587');
    });

    it('should handle emoji characters', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: '\ud83d\udc4d\ud83c\udf89\ud83d\ude80\ud83c\udf1f\ud83d\udca1',
            messageEncoding: 'utf-8',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toBe('\ud83d\udc4d\ud83c\udf89\ud83d\ude80\ud83c\udf1f\ud83d\udca1');
    });

    it('should handle special URL characters', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'https://example.com/path?param=value&other=123#anchor',
            messageEncoding: 'iso-8859-1',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toBe(
        'https://example.com/path?param=value&other=123#anchor'
      );
    });

    it('should handle JSON-like content in message', async () => {
      const jsonMessage = '{"id":123,"name":"Test","active":true}';
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: jsonMessage,
            messageEncoding: 'utf-8',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toBe(jsonMessage);
    });

    it('should handle escape sequences', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'Line1\\nLine2\\tTabbed\\"Quoted\\"',
            messageEncoding: 'iso-8859-1',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toContain('\\n');
      expect((parsed.barcodes as Barcode[])[0].message).toContain('\\t');
    });

    it('should handle actual newlines and control characters', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'Line1\nLine2\rLine3\r\nLine4',
            messageEncoding: 'utf-8',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toBe('Line1\nLine2\rLine3\r\nLine4');
    });

    it('should handle null character in message', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'Before\u0000After',
            messageEncoding: 'utf-8',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toBe('Before\u0000After');
    });

    it('should handle RTL and bidirectional text', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: '\u0639\u0631\u0628\u064a English \u05e2\u05d1\u05e8\u05d9\u05ea',
            messageEncoding: 'utf-8',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toContain('\u0639\u0631\u0628\u064a');
      expect((parsed.barcodes as Barcode[])[0].message).toContain('\u05e2\u05d1\u05e8\u05d9\u05ea');
    });

    it('should handle mathematical symbols and operators', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: '\u221e \u00b1 \u2260 \u2264 \u2265 \u03c0 \u03a3 \u222b',
            messageEncoding: 'utf-8',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toContain('\u221e');
      expect((parsed.barcodes as Barcode[])[0].message).toContain('\u03c0');
    });

    it('should handle currency symbols', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: '$ \u20ac \u00a3 \u00a5 \u20b9 \u20bf',
            messageEncoding: 'utf-8',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toBe('$ \u20ac \u00a3 \u00a5 \u20b9 \u20bf');
    });
  });

  describe('Missing messageEncoding', () => {
    it('should handle barcode without messageEncoding', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'TEST-MESSAGE',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect(parsed.barcodes).toHaveLength(1);
      expect((parsed.barcodes as Barcode[])[0].messageEncoding).toBeUndefined();
    });

    it('should handle multiple barcodes with mixed messageEncoding presence', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          { format: BarcodeFormat.QR, message: 'MSG1', messageEncoding: 'iso-8859-1' },
          { format: BarcodeFormat.PDF417, message: 'MSG2' },
          { format: BarcodeFormat.Aztec, message: 'MSG3', messageEncoding: 'utf-8' },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].messageEncoding).toBe('iso-8859-1');
      expect((parsed.barcodes as Barcode[])[1].messageEncoding).toBeUndefined();
      expect((parsed.barcodes as Barcode[])[2].messageEncoding).toBe('utf-8');
    });

    it('should handle empty string messageEncoding', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'TEST',
            messageEncoding: '',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      // Empty string should still be serialized
      expect((parsed.barcodes as Barcode[])[0].messageEncoding).toBe('');
    });
  });

  describe('Invalid/Unusual altText Values', () => {
    it('should handle empty altText', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'DATA',
            altText: '',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].altText).toBe('');
    });

    it('should handle very long altText', async () => {
      const longAltText = 'ALT'.repeat(500);
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'DATA',
            altText: longAltText,
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].altText).toBe(longAltText);
    });

    it('should handle altText with special characters', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'DATA',
            altText: '\u4e2d\u6587 Text \ud83d\udc4d <script>alert()</script>',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].altText).toContain('\u4e2d\u6587');
      expect((parsed.barcodes as Barcode[])[0].altText).toContain('<script>');
    });

    it('should handle altText with only whitespace', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'DATA',
            altText: '   \t\n   ',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].altText).toBe('   \t\n   ');
    });

    it('should handle altText with numeric-like content', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'DATA',
            altText: '1234567890',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].altText).toBe('1234567890');
      expect(typeof (parsed.barcodes as Barcode[])[0].altText).toBe('string');
    });

    it('should handle missing altText (undefined)', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'DATA',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].altText).toBeUndefined();
    });
  });

  describe('Multiple Barcodes with Same Format', () => {
    it('should handle multiple QR barcodes', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          { format: BarcodeFormat.QR, message: 'QR1', altText: 'First QR' },
          { format: BarcodeFormat.QR, message: 'QR2', altText: 'Second QR' },
          { format: BarcodeFormat.QR, message: 'QR3', altText: 'Third QR' },
        ],
      };

      const parsed = await getPassJson(passData);
      expect(parsed.barcodes).toHaveLength(3);
      expect((parsed.barcodes as Barcode[])[0].message).toBe('QR1');
      expect((parsed.barcodes as Barcode[])[1].message).toBe('QR2');
      expect((parsed.barcodes as Barcode[])[2].message).toBe('QR3');
    });

    it('should handle multiple identical barcodes', async () => {
      const barcode: Barcode = {
        format: BarcodeFormat.PDF417,
        message: 'SAME-MESSAGE',
        messageEncoding: 'iso-8859-1',
        altText: 'Same Alt',
      };
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [barcode, barcode, barcode],
      };

      const parsed = await getPassJson(passData);
      expect(parsed.barcodes).toHaveLength(3);
      for (const bc of parsed.barcodes as Barcode[]) {
        expect(bc.message).toBe('SAME-MESSAGE');
        expect(bc.altText).toBe('Same Alt');
      }
    });

    it('should handle 10 barcodes', async () => {
      const barcodes: Barcode[] = Array.from({ length: 10 }, (_, i) => ({
        format: BarcodeFormat.QR,
        message: `MESSAGE-${i}`,
        altText: `Alt ${i}`,
      }));
      const passData: PassData = {
        ...minimalPassData,
        barcodes,
      };

      const parsed = await getPassJson(passData);
      expect(parsed.barcodes).toHaveLength(10);
      for (let i = 0; i < 10; i++) {
        expect((parsed.barcodes as Barcode[])[i].message).toBe(`MESSAGE-${i}`);
      }
    });

    it('should preserve barcode order', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          { format: BarcodeFormat.QR, message: 'FIRST' },
          { format: BarcodeFormat.PDF417, message: 'SECOND' },
          { format: BarcodeFormat.Aztec, message: 'THIRD' },
          { format: BarcodeFormat.Code128, message: 'FOURTH' },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toBe('FIRST');
      expect((parsed.barcodes as Barcode[])[1].message).toBe('SECOND');
      expect((parsed.barcodes as Barcode[])[2].message).toBe('THIRD');
      expect((parsed.barcodes as Barcode[])[3].message).toBe('FOURTH');
    });
  });

  describe('Legacy Single Barcode Field vs Barcodes Array', () => {
    it('should handle legacy barcode field', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcode: {
          format: BarcodeFormat.QR,
          message: 'LEGACY-BARCODE',
          messageEncoding: 'iso-8859-1',
        },
      };

      const parsed = await getPassJson(passData);
      expect(parsed.barcode).toBeDefined();
      expect((parsed.barcode as Barcode).message).toBe('LEGACY-BARCODE');
    });

    it('should handle both barcode and barcodes present', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcode: {
          format: BarcodeFormat.QR,
          message: 'LEGACY',
          messageEncoding: 'iso-8859-1',
        },
        barcodes: [
          {
            format: BarcodeFormat.PDF417,
            message: 'MODERN',
            messageEncoding: 'iso-8859-1',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect(parsed.barcode).toBeDefined();
      expect((parsed.barcode as Barcode).message).toBe('LEGACY');
      expect(parsed.barcodes).toHaveLength(1);
      expect((parsed.barcodes as Barcode[])[0].message).toBe('MODERN');
    });

    it('should handle legacy barcode with all properties', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcode: {
          format: BarcodeFormat.Aztec,
          message: 'FULL-LEGACY',
          messageEncoding: 'utf-8',
          altText: 'Legacy Alt Text',
        },
      };

      const parsed = await getPassJson(passData);
      const barcode = parsed.barcode as Barcode;
      expect(barcode.format).toBe('PKBarcodeFormatAztec');
      expect(barcode.message).toBe('FULL-LEGACY');
      expect(barcode.messageEncoding).toBe('utf-8');
      expect(barcode.altText).toBe('Legacy Alt Text');
    });

    it('should handle empty barcodes array', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [],
      };

      const parsed = await getPassJson(passData);
      expect(parsed.barcodes).toHaveLength(0);
    });

    it('should handle pass with no barcode or barcodes', async () => {
      const passData: PassData = {
        ...minimalPassData,
      };

      const parsed = await getPassJson(passData);
      expect(parsed.barcode).toBeUndefined();
      expect(parsed.barcodes).toBeUndefined();
    });

    it('should handle legacy barcode with Code128', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcode: {
          format: BarcodeFormat.Code128,
          message: 'CODE128-LEGACY-12345',
        },
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcode as Barcode).format).toBe('PKBarcodeFormatCode128');
    });
  });

  describe('Edge Case Combinations', () => {
    it('should handle barcode with all optional fields missing', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'MINIMAL',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      const barcode = (parsed.barcodes as Barcode[])[0];
      expect(barcode.format).toBe('PKBarcodeFormatQR');
      expect(barcode.message).toBe('MINIMAL');
      expect(barcode.messageEncoding).toBeUndefined();
      expect(barcode.altText).toBeUndefined();
    });

    it('should handle barcode with all fields populated', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.PDF417,
            message: 'COMPLETE-MESSAGE',
            messageEncoding: 'iso-8859-1',
            altText: 'Complete Alt Text',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      const barcode = (parsed.barcodes as Barcode[])[0];
      expect(barcode.format).toBe('PKBarcodeFormatPDF417');
      expect(barcode.message).toBe('COMPLETE-MESSAGE');
      expect(barcode.messageEncoding).toBe('iso-8859-1');
      expect(barcode.altText).toBe('Complete Alt Text');
    });

    it('should handle URL-encoded data in barcode message', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'https://example.com/api?data=%7B%22id%22%3A123%7D',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toBe(
        'https://example.com/api?data=%7B%22id%22%3A123%7D'
      );
    });

    it('should handle base64-like data in barcode message', async () => {
      const base64Data = 'SGVsbG8gV29ybGQhIFRoaXMgaXMgYmFzZTY0IGVuY29kZWQgZGF0YQ==';
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: base64Data,
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toBe(base64Data);
    });

    it('should handle XML-like content in barcode message', async () => {
      const xmlMessage = '<ticket><id>123</id><type>VIP</type></ticket>';
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: xmlMessage,
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toBe(xmlMessage);
    });

    it('should handle barcode message with leading/trailing whitespace', async () => {
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: '  PADDED MESSAGE  ',
          },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].message).toBe('  PADDED MESSAGE  ');
    });

    it('should handle different encodings for same message', async () => {
      const message = 'TEST MESSAGE';
      const passData: PassData = {
        ...minimalPassData,
        barcodes: [
          { format: BarcodeFormat.QR, message, messageEncoding: 'iso-8859-1' },
          { format: BarcodeFormat.QR, message, messageEncoding: 'utf-8' },
          { format: BarcodeFormat.QR, message, messageEncoding: 'utf-16' },
        ],
      };

      const parsed = await getPassJson(passData);
      expect((parsed.barcodes as Barcode[])[0].messageEncoding).toBe('iso-8859-1');
      expect((parsed.barcodes as Barcode[])[1].messageEncoding).toBe('utf-8');
      expect((parsed.barcodes as Barcode[])[2].messageEncoding).toBe('utf-16');
    });
  });
});
