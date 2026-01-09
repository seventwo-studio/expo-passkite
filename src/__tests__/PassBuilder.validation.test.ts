import { createPassBuilder, PassBuilder } from '../PassBuilder';
import {
  PassType,
  BarcodeFormat,
  TransitType,
  PassImageType,
  TextAlignment,
  DateStyle,
  NumberStyle,
  DataDetectorType,
} from '../types';

describe('PassBuilder Validation Edge Cases', () => {
  // Helper function to create a builder with required fields
  const createValidBuilder = () => {
    return createPassBuilder()
      .setIdentifiers({
        passTypeIdentifier: 'pass.com.example.test',
        serialNumber: 'TEST-001',
        teamIdentifier: 'ABCD1234',
      })
      .setOrganization({
        organizationName: 'Test Corp',
        description: 'Test Pass',
      });
  };

  describe('Empty String Values for Required Fields', () => {
    it('should handle empty passTypeIdentifier', () => {
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: '',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Corp',
          description: 'Test Pass',
        });
      expect(() => builder.build()).toThrow('passTypeIdentifier is required');
    });

    it('should handle empty serialNumber', () => {
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: '',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Corp',
          description: 'Test Pass',
        });
      expect(() => builder.build()).toThrow('serialNumber is required');
    });

    it('should handle empty teamIdentifier', () => {
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: '',
        })
        .setOrganization({
          organizationName: 'Test Corp',
          description: 'Test Pass',
        });
      expect(() => builder.build()).toThrow('teamIdentifier is required');
    });

    it('should handle empty organizationName', () => {
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: '',
          description: 'Test Pass',
        });
      expect(() => builder.build()).toThrow('organizationName is required');
    });

    it('should handle empty description', () => {
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Corp',
          description: '',
        });
      expect(() => builder.build()).toThrow('description is required');
    });

    it('should handle empty barcode message', () => {
      const builder = createValidBuilder();
      builder.addBarcode({
        format: BarcodeFormat.QR,
        message: '',
      });

      const { passData } = builder.build();
      expect(passData.barcodes?.[0].message).toBe('');
    });

    it('should handle empty field key', () => {
      const builder = createValidBuilder();
      builder.addHeaderField({
        key: '',
        value: 'Test Value',
      });

      const { passData } = builder.build();
      expect(passData.generic?.headerFields?.[0].key).toBe('');
    });

    it('should handle empty field value string', () => {
      const builder = createValidBuilder();
      builder.addPrimaryField({
        key: 'test',
        value: '',
      });

      const { passData } = builder.build();
      expect(passData.generic?.primaryFields?.[0].value).toBe('');
    });

    it('should handle empty grouping identifier', () => {
      const builder = createValidBuilder();
      builder.setGroupingIdentifier('');

      const { passData } = builder.build();
      expect(passData.groupingIdentifier).toBe('');
    });

    it('should handle empty web service URL', () => {
      const builder = createValidBuilder();
      builder.setWebService({
        webServiceURL: '',
        authenticationToken: 'token',
      });

      const { passData } = builder.build();
      expect(passData.webServiceURL).toBe('');
    });

    it('should handle empty authentication token', () => {
      const builder = createValidBuilder();
      builder.setWebService({
        webServiceURL: 'https://example.com',
        authenticationToken: '',
      });

      const { passData } = builder.build();
      expect(passData.authenticationToken).toBe('');
    });

    it('should handle empty NFC message', () => {
      const builder = createValidBuilder();
      builder.setNFC({
        message: '',
      });

      const { passData } = builder.build();
      expect(passData.nfc?.message).toBe('');
    });
  });

  describe('Missing Required Fields in Different Combinations', () => {
    it('should throw when only passTypeIdentifier is set', () => {
      const builder = createPassBuilder();
      // Using a type assertion here to bypass TypeScript checks for testing incomplete state
      (builder as PassBuilder & { data: { passTypeIdentifier: string } })['data'] = {
        passTypeIdentifier: 'pass.com.test',
      } as never;
      expect(() => builder.build()).toThrow();
    });

    it('should throw when identifiers set but no organization', () => {
      const builder = createPassBuilder().setIdentifiers({
        passTypeIdentifier: 'pass.com.example.test',
        serialNumber: 'TEST-001',
        teamIdentifier: 'ABCD1234',
      });
      expect(() => builder.build()).toThrow('organizationName is required');
    });

    it('should throw when organization set but no identifiers', () => {
      const builder = createPassBuilder().setOrganization({
        organizationName: 'Test Corp',
        description: 'Test Pass',
      });
      expect(() => builder.build()).toThrow('passTypeIdentifier is required');
    });

    it('should throw when partial identifiers set - missing serialNumber', () => {
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.test',
          serialNumber: '',
          teamIdentifier: 'TEAM',
        })
        .setOrganization({ organizationName: 'Org', description: 'Desc' });
      expect(() => builder.build()).toThrow('serialNumber is required');
    });

    it('should throw when partial identifiers set - missing teamIdentifier', () => {
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.test',
          serialNumber: 'S001',
          teamIdentifier: '',
        })
        .setOrganization({ organizationName: 'Org', description: 'Desc' });
      expect(() => builder.build()).toThrow('teamIdentifier is required');
    });

    it('should throw when partial organization set - missing description', () => {
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.test',
          serialNumber: 'S001',
          teamIdentifier: 'TEAM',
        })
        .setOrganization({ organizationName: 'Org', description: '' });
      expect(() => builder.build()).toThrow('description is required');
    });

    it('should build successfully with only required fields', () => {
      const builder = createValidBuilder();
      const { passData } = builder.build();
      expect(passData.passTypeIdentifier).toBe('pass.com.example.test');
      expect(passData.serialNumber).toBe('TEST-001');
      expect(passData.teamIdentifier).toBe('ABCD1234');
      expect(passData.organizationName).toBe('Test Corp');
      expect(passData.description).toBe('Test Pass');
    });
  });

  describe('Very Long Strings (Boundary Testing)', () => {
    const generateLongString = (length: number): string => {
      return 'a'.repeat(length);
    };

    it('should handle very long passTypeIdentifier (1000 chars)', () => {
      const longId = `pass.com.example.${generateLongString(1000)}`;
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: longId,
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Corp',
          description: 'Test Pass',
        });

      const { passData } = builder.build();
      expect(passData.passTypeIdentifier).toBe(longId);
      expect(passData.passTypeIdentifier.length).toBe(1017); // "pass.com.example." (17) + 1000 = 1017
    });

    it('should handle very long serialNumber (10000 chars)', () => {
      const longSerial = generateLongString(10000);
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: longSerial,
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Corp',
          description: 'Test Pass',
        });

      const { passData } = builder.build();
      expect(passData.serialNumber.length).toBe(10000);
    });

    it('should handle very long organizationName (5000 chars)', () => {
      const longName = generateLongString(5000);
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: longName,
          description: 'Test Pass',
        });

      const { passData } = builder.build();
      expect(passData.organizationName.length).toBe(5000);
    });

    it('should handle very long description (50000 chars)', () => {
      const longDesc = generateLongString(50000);
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Corp',
          description: longDesc,
        });

      const { passData } = builder.build();
      expect(passData.description.length).toBe(50000);
    });

    it('should handle very long barcode message (100000 chars)', () => {
      const longMessage = generateLongString(100000);
      const builder = createValidBuilder();
      builder.addBarcode({
        format: BarcodeFormat.QR,
        message: longMessage,
      });

      const { passData } = builder.build();
      expect(passData.barcodes?.[0].message.length).toBe(100000);
    });

    it('should handle very long field value (100000 chars)', () => {
      const longValue = generateLongString(100000);
      const builder = createValidBuilder();
      builder.addBackField({
        key: 'terms',
        value: longValue,
      });

      const { passData } = builder.build();
      expect(passData.generic?.backFields?.[0].value).toBe(longValue);
    });

    it('should handle very long logoText (1000 chars)', () => {
      const longLogo = generateLongString(1000);
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Corp',
          description: 'Test Pass',
          logoText: longLogo,
        });

      const { passData } = builder.build();
      expect(passData.logoText?.length).toBe(1000);
    });

    it('should handle very long relevantText in location (10000 chars)', () => {
      const longText = generateLongString(10000);
      const builder = createValidBuilder();
      builder.addLocation({
        latitude: 37.7749,
        longitude: -122.4194,
        relevantText: longText,
      });

      const { passData } = builder.build();
      expect(passData.locations?.[0].relevantText?.length).toBe(10000);
    });

    it('should handle very long beacon proximityUUID (1000 chars)', () => {
      const longUUID = generateLongString(1000);
      const builder = createValidBuilder();
      builder.addBeacon({
        proximityUUID: longUUID,
      });

      const { passData } = builder.build();
      expect(passData.beacons?.[0].proximityUUID.length).toBe(1000);
    });

    it('should handle very long NFC message (100000 chars)', () => {
      const longMessage = generateLongString(100000);
      const builder = createValidBuilder();
      builder.setNFC({
        message: longMessage,
      });

      const { passData } = builder.build();
      expect(passData.nfc?.message.length).toBe(100000);
    });
  });

  describe('Special Characters in Fields (Unicode, Emojis, HTML Entities)', () => {
    describe('Unicode Characters', () => {
      it('should handle Chinese characters in organizationName', () => {
        const builder = createPassBuilder()
          .setIdentifiers({
            passTypeIdentifier: 'pass.com.example.test',
            serialNumber: 'TEST-001',
            teamIdentifier: 'ABCD1234',
          })
          .setOrganization({
            organizationName: '测试公司',
            description: 'Test Pass',
          });

        const { passData } = builder.build();
        expect(passData.organizationName).toBe('测试公司');
      });

      it('should handle Japanese characters in description', () => {
        const builder = createPassBuilder()
          .setIdentifiers({
            passTypeIdentifier: 'pass.com.example.test',
            serialNumber: 'TEST-001',
            teamIdentifier: 'ABCD1234',
          })
          .setOrganization({
            organizationName: 'Test Corp',
            description: 'テストパス - これは日本語です',
          });

        const { passData } = builder.build();
        expect(passData.description).toBe('テストパス - これは日本語です');
      });

      it('should handle Arabic characters in field values', () => {
        const builder = createValidBuilder();
        builder.addPrimaryField({
          key: 'name',
          label: 'الاسم',
          value: 'محمد أحمد',
        });

        const { passData } = builder.build();
        expect(passData.generic?.primaryFields?.[0].label).toBe('الاسم');
        expect(passData.generic?.primaryFields?.[0].value).toBe('محمد أحمد');
      });

      it('should handle Hebrew characters', () => {
        const builder = createValidBuilder();
        builder.addHeaderField({
          key: 'greeting',
          value: 'שלום עולם',
        });

        const { passData } = builder.build();
        expect(passData.generic?.headerFields?.[0].value).toBe('שלום עולם');
      });

      it('should handle Cyrillic characters', () => {
        const builder = createValidBuilder();
        builder.addSecondaryField({
          key: 'location',
          value: 'Москва, Россия',
        });

        const { passData } = builder.build();
        expect(passData.generic?.secondaryFields?.[0].value).toBe('Москва, Россия');
      });

      it('should handle Thai characters', () => {
        const builder = createValidBuilder();
        builder.addAuxiliaryField({
          key: 'greeting',
          value: 'สวัสดีครับ',
        });

        const { passData } = builder.build();
        expect(passData.generic?.auxiliaryFields?.[0].value).toBe('สวัสดีครับ');
      });

      it('should handle mixed unicode in barcode altText', () => {
        const builder = createValidBuilder();
        builder.addBarcode({
          format: BarcodeFormat.QR,
          message: 'test-123',
          altText: '日本語 中文 한국어 العربية',
        });

        const { passData } = builder.build();
        expect(passData.barcodes?.[0].altText).toBe('日本語 中文 한국어 العربية');
      });
    });

    describe('Emojis', () => {
      it('should handle emojis in organizationName', () => {
        const builder = createPassBuilder()
          .setIdentifiers({
            passTypeIdentifier: 'pass.com.example.test',
            serialNumber: 'TEST-001',
            teamIdentifier: 'ABCD1234',
          })
          .setOrganization({
            organizationName: 'Coffee Shop ☕',
            description: 'Test Pass',
          });

        const { passData } = builder.build();
        expect(passData.organizationName).toBe('Coffee Shop ☕');
      });

      it('should handle emojis in description', () => {
        const builder = createPassBuilder()
          .setIdentifiers({
            passTypeIdentifier: 'pass.com.example.test',
            serialNumber: 'TEST-001',
            teamIdentifier: 'ABCD1234',
          })
          .setOrganization({
            organizationName: 'Test Corp',
            description: 'Your VIP Pass 🎉🎊🎁',
          });

        const { passData } = builder.build();
        expect(passData.description).toBe('Your VIP Pass 🎉🎊🎁');
      });

      it('should handle emojis in field values', () => {
        const builder = createValidBuilder();
        builder.addPrimaryField({
          key: 'status',
          value: '⭐⭐⭐⭐⭐ Gold Member',
        });

        const { passData } = builder.build();
        expect(passData.generic?.primaryFields?.[0].value).toBe('⭐⭐⭐⭐⭐ Gold Member');
      });

      it('should handle complex emojis (multi-codepoint)', () => {
        const builder = createValidBuilder();
        builder.addHeaderField({
          key: 'emoji',
          value: '👨‍👩‍👧‍👦 Family Pass 🏳️‍🌈',
        });

        const { passData } = builder.build();
        expect(passData.generic?.headerFields?.[0].value).toBe('👨‍👩‍👧‍👦 Family Pass 🏳️‍🌈');
      });

      it('should handle emojis in location relevantText', () => {
        const builder = createValidBuilder();
        builder.addLocation({
          latitude: 37.7749,
          longitude: -122.4194,
          relevantText: '🏪 Welcome to our store! 🛒',
        });

        const { passData } = builder.build();
        expect(passData.locations?.[0].relevantText).toBe('🏪 Welcome to our store! 🛒');
      });

      it('should handle emojis in logoText', () => {
        const builder = createPassBuilder()
          .setIdentifiers({
            passTypeIdentifier: 'pass.com.example.test',
            serialNumber: 'TEST-001',
            teamIdentifier: 'ABCD1234',
          })
          .setOrganization({
            organizationName: 'Test Corp',
            description: 'Test Pass',
            logoText: '🎫 PASS',
          });

        const { passData } = builder.build();
        expect(passData.logoText).toBe('🎫 PASS');
      });
    });

    describe('HTML Entities and Special Characters', () => {
      it('should handle HTML entities in field values', () => {
        const builder = createValidBuilder();
        builder.addBackField({
          key: 'terms',
          value: '&lt;Terms&gt; &amp; Conditions &copy; 2024',
        });

        const { passData } = builder.build();
        expect(passData.generic?.backFields?.[0].value).toBe(
          '&lt;Terms&gt; &amp; Conditions &copy; 2024'
        );
      });

      it('should handle raw HTML tags (not escaped)', () => {
        const builder = createValidBuilder();
        builder.addBackField({
          key: 'info',
          value: '<b>Bold</b> and <i>italic</i>',
        });

        const { passData } = builder.build();
        expect(passData.generic?.backFields?.[0].value).toBe('<b>Bold</b> and <i>italic</i>');
      });

      it('should handle newline characters', () => {
        const builder = createValidBuilder();
        builder.addBackField({
          key: 'multiline',
          value: 'Line 1\nLine 2\nLine 3',
        });

        const { passData } = builder.build();
        expect(passData.generic?.backFields?.[0].value).toBe('Line 1\nLine 2\nLine 3');
      });

      it('should handle tab characters', () => {
        const builder = createValidBuilder();
        builder.addBackField({
          key: 'tabbed',
          value: 'Column1\tColumn2\tColumn3',
        });

        const { passData } = builder.build();
        expect(passData.generic?.backFields?.[0].value).toBe('Column1\tColumn2\tColumn3');
      });

      it('should handle carriage return characters', () => {
        const builder = createValidBuilder();
        builder.addBackField({
          key: 'crlf',
          value: 'Line 1\r\nLine 2\r\nLine 3',
        });

        const { passData } = builder.build();
        expect(passData.generic?.backFields?.[0].value).toBe('Line 1\r\nLine 2\r\nLine 3');
      });

      it('should handle null character in string', () => {
        const builder = createValidBuilder();
        builder.addBackField({
          key: 'null',
          value: 'Before\0After',
        });

        const { passData } = builder.build();
        expect(passData.generic?.backFields?.[0].value).toBe('Before\0After');
      });

      it('should handle backslash characters', () => {
        const builder = createValidBuilder();
        builder.addBackField({
          key: 'path',
          value: 'C:\\Users\\Test\\Documents',
        });

        const { passData } = builder.build();
        expect(passData.generic?.backFields?.[0].value).toBe('C:\\Users\\Test\\Documents');
      });

      it('should handle quote characters', () => {
        const builder = createValidBuilder();
        builder.addBackField({
          key: 'quotes',
          value: 'He said "Hello" and \'Goodbye\'',
        });

        const { passData } = builder.build();
        expect(passData.generic?.backFields?.[0].value).toBe('He said "Hello" and \'Goodbye\'');
      });

      it('should handle special URL characters in webServiceURL', () => {
        const builder = createValidBuilder();
        builder.setWebService({
          webServiceURL: 'https://example.com/path?param=value&other=test#fragment',
          authenticationToken: 'token',
        });

        const { passData } = builder.build();
        expect(passData.webServiceURL).toBe(
          'https://example.com/path?param=value&other=test#fragment'
        );
      });

      it('should handle percent-encoded characters in URLs', () => {
        const builder = createValidBuilder();
        builder.setWebService({
          webServiceURL: 'https://example.com/path%20with%20spaces',
          authenticationToken: 'token%20with%20spaces',
        });

        const { passData } = builder.build();
        expect(passData.webServiceURL).toBe('https://example.com/path%20with%20spaces');
      });
    });
  });

  describe('Whitespace-Only Values', () => {
    it('should handle space-only passTypeIdentifier', () => {
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: '   ',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Corp',
          description: 'Test Pass',
        });
      // Current implementation checks for falsy values, spaces are truthy
      const { passData } = builder.build();
      expect(passData.passTypeIdentifier).toBe('   ');
    });

    it('should handle tab-only serialNumber', () => {
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: '\t\t\t',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Corp',
          description: 'Test Pass',
        });

      const { passData } = builder.build();
      expect(passData.serialNumber).toBe('\t\t\t');
    });

    it('should handle newline-only organizationName', () => {
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: '\n\n\n',
          description: 'Test Pass',
        });

      const { passData } = builder.build();
      expect(passData.organizationName).toBe('\n\n\n');
    });

    it('should handle mixed whitespace description', () => {
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Corp',
          description: ' \t\n\r ',
        });

      const { passData } = builder.build();
      expect(passData.description).toBe(' \t\n\r ');
    });

    it('should handle whitespace-only field key', () => {
      const builder = createValidBuilder();
      builder.addHeaderField({
        key: '   ',
        value: 'Test Value',
      });

      const { passData } = builder.build();
      expect(passData.generic?.headerFields?.[0].key).toBe('   ');
    });

    it('should handle whitespace-only field value', () => {
      const builder = createValidBuilder();
      builder.addPrimaryField({
        key: 'test',
        value: '     ',
      });

      const { passData } = builder.build();
      expect(passData.generic?.primaryFields?.[0].value).toBe('     ');
    });

    it('should handle whitespace-only field label', () => {
      const builder = createValidBuilder();
      builder.addSecondaryField({
        key: 'test',
        label: '\t\t',
        value: 'Value',
      });

      const { passData } = builder.build();
      expect(passData.generic?.secondaryFields?.[0].label).toBe('\t\t');
    });

    it('should handle whitespace-only barcode message', () => {
      const builder = createValidBuilder();
      builder.addBarcode({
        format: BarcodeFormat.QR,
        message: '   ',
      });

      const { passData } = builder.build();
      expect(passData.barcodes?.[0].message).toBe('   ');
    });

    it('should handle whitespace-only groupingIdentifier', () => {
      const builder = createValidBuilder();
      builder.setGroupingIdentifier('   ');

      const { passData } = builder.build();
      expect(passData.groupingIdentifier).toBe('   ');
    });

    it('should handle whitespace-only relevantText in location', () => {
      const builder = createValidBuilder();
      builder.addLocation({
        latitude: 0,
        longitude: 0,
        relevantText: '   ',
      });

      const { passData } = builder.build();
      expect(passData.locations?.[0].relevantText).toBe('   ');
    });
  });

  describe('Field Content Edge Cases', () => {
    it('should handle numeric value 0 in field', () => {
      const builder = createValidBuilder();
      builder.addHeaderField({
        key: 'count',
        label: 'COUNT',
        value: 0,
      });

      const { passData } = builder.build();
      expect(passData.generic?.headerFields?.[0].value).toBe(0);
    });

    it('should handle negative numeric value in field', () => {
      const builder = createValidBuilder();
      builder.addHeaderField({
        key: 'balance',
        label: 'BALANCE',
        value: -100.50,
      });

      const { passData } = builder.build();
      expect(passData.generic?.headerFields?.[0].value).toBe(-100.50);
    });

    it('should handle very large numeric value in field', () => {
      const builder = createValidBuilder();
      builder.addHeaderField({
        key: 'big',
        value: Number.MAX_SAFE_INTEGER,
      });

      const { passData } = builder.build();
      expect(passData.generic?.headerFields?.[0].value).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle very small numeric value in field', () => {
      const builder = createValidBuilder();
      builder.addHeaderField({
        key: 'small',
        value: Number.MIN_SAFE_INTEGER,
      });

      const { passData } = builder.build();
      expect(passData.generic?.headerFields?.[0].value).toBe(Number.MIN_SAFE_INTEGER);
    });

    it('should handle floating point precision edge case', () => {
      const builder = createValidBuilder();
      builder.addHeaderField({
        key: 'float',
        value: 0.1 + 0.2,
      });

      const { passData } = builder.build();
      // JavaScript floating point: 0.1 + 0.2 = 0.30000000000000004
      expect(passData.generic?.headerFields?.[0].value).toBeCloseTo(0.3);
    });

    it('should handle Date object in field value', () => {
      const builder = createValidBuilder();
      const testDate = new Date('2024-12-25T10:00:00Z');
      builder.addPrimaryField({
        key: 'date',
        value: testDate,
      });

      const { passData } = builder.build();
      expect(passData.generic?.primaryFields?.[0].value).toEqual(testDate);
    });

    it('should handle field with all optional properties', () => {
      const builder = createValidBuilder();
      builder.addPrimaryField({
        key: 'full',
        value: '100',
        label: 'AMOUNT',
        changeMessage: 'Amount changed to %@',
        textAlignment: TextAlignment.Center,
        attributedValue: '<b>100</b>',
        dateStyle: DateStyle.Short,
        timeStyle: DateStyle.Short,
        isRelative: true,
        ignoresTimeZone: true,
        numberStyle: NumberStyle.Decimal,
        currencyCode: 'USD',
        dataDetectorTypes: [DataDetectorType.Link, DataDetectorType.PhoneNumber],
      });

      const { passData } = builder.build();
      const field = passData.generic?.primaryFields?.[0];
      expect(field?.textAlignment).toBe(TextAlignment.Center);
      expect(field?.attributedValue).toBe('<b>100</b>');
      expect(field?.dataDetectorTypes).toContain(DataDetectorType.Link);
    });
  });

  describe('Location Edge Cases', () => {
    it('should handle latitude at boundary (90)', () => {
      const builder = createValidBuilder();
      builder.addLocation({
        latitude: 90,
        longitude: 0,
      });

      const { passData } = builder.build();
      expect(passData.locations?.[0].latitude).toBe(90);
    });

    it('should handle latitude at boundary (-90)', () => {
      const builder = createValidBuilder();
      builder.addLocation({
        latitude: -90,
        longitude: 0,
      });

      const { passData } = builder.build();
      expect(passData.locations?.[0].latitude).toBe(-90);
    });

    it('should handle longitude at boundary (180)', () => {
      const builder = createValidBuilder();
      builder.addLocation({
        latitude: 0,
        longitude: 180,
      });

      const { passData } = builder.build();
      expect(passData.locations?.[0].longitude).toBe(180);
    });

    it('should handle longitude at boundary (-180)', () => {
      const builder = createValidBuilder();
      builder.addLocation({
        latitude: 0,
        longitude: -180,
      });

      const { passData } = builder.build();
      expect(passData.locations?.[0].longitude).toBe(-180);
    });

    it('should handle latitude at origin (0)', () => {
      const builder = createValidBuilder();
      builder.addLocation({
        latitude: 0,
        longitude: 45,
      });

      const { passData } = builder.build();
      expect(passData.locations?.[0].latitude).toBe(0);
    });

    it('should handle negative altitude', () => {
      const builder = createValidBuilder();
      builder.addLocation({
        latitude: 31.5,
        longitude: 35.5,
        altitude: -430, // Dead Sea
      });

      const { passData } = builder.build();
      expect(passData.locations?.[0].altitude).toBe(-430);
    });

    it('should handle very high altitude', () => {
      const builder = createValidBuilder();
      builder.addLocation({
        latitude: 27.9881,
        longitude: 86.925,
        altitude: 8848, // Mount Everest
      });

      const { passData } = builder.build();
      expect(passData.locations?.[0].altitude).toBe(8848);
    });

    it('should handle many locations (100)', () => {
      const builder = createValidBuilder();
      for (let i = 0; i < 100; i++) {
        builder.addLocation({
          latitude: i - 50,
          longitude: i * 3.6 - 180,
        });
      }

      const { passData } = builder.build();
      expect(passData.locations).toHaveLength(100);
    });
  });

  describe('Beacon Edge Cases', () => {
    it('should handle beacon with major at max value', () => {
      const builder = createValidBuilder();
      builder.addBeacon({
        proximityUUID: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
        major: 65535,
      });

      const { passData } = builder.build();
      expect(passData.beacons?.[0].major).toBe(65535);
    });

    it('should handle beacon with minor at max value', () => {
      const builder = createValidBuilder();
      builder.addBeacon({
        proximityUUID: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
        minor: 65535,
      });

      const { passData } = builder.build();
      expect(passData.beacons?.[0].minor).toBe(65535);
    });

    it('should handle beacon with major and minor at 0', () => {
      const builder = createValidBuilder();
      builder.addBeacon({
        proximityUUID: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
        major: 0,
        minor: 0,
      });

      const { passData } = builder.build();
      expect(passData.beacons?.[0].major).toBe(0);
      expect(passData.beacons?.[0].minor).toBe(0);
    });

    it('should handle lowercase UUID', () => {
      const builder = createValidBuilder();
      builder.addBeacon({
        proximityUUID: 'e2c56db5-dffb-48d2-b060-d0f5a71096e0',
      });

      const { passData } = builder.build();
      expect(passData.beacons?.[0].proximityUUID).toBe('e2c56db5-dffb-48d2-b060-d0f5a71096e0');
    });

    it('should handle many beacons (50)', () => {
      const builder = createValidBuilder();
      for (let i = 0; i < 50; i++) {
        builder.addBeacon({
          proximityUUID: `E2C56DB5-DFFB-48D2-B060-D0F5A7109${i.toString().padStart(3, '0')}`,
          major: i,
          minor: i * 100,
        });
      }

      const { passData } = builder.build();
      expect(passData.beacons).toHaveLength(50);
    });
  });

  describe('Date Edge Cases', () => {
    it('should handle minimum date', () => {
      const builder = createValidBuilder();
      const minDate = new Date(-8640000000000000);
      builder.setRelevantDate(minDate);

      const { passData } = builder.build();
      expect(passData.relevantDate).toBeDefined();
    });

    it('should handle maximum date', () => {
      const builder = createValidBuilder();
      const maxDate = new Date(8640000000000000);
      builder.setRelevantDate(maxDate);

      const { passData } = builder.build();
      expect(passData.relevantDate).toBeDefined();
    });

    it('should handle epoch date', () => {
      const builder = createValidBuilder();
      const epochDate = new Date(0);
      builder.setRelevantDate(epochDate);

      const { passData } = builder.build();
      expect(passData.relevantDate).toBe('1970-01-01T00:00:00.000Z');
    });

    it('should handle ISO string date format', () => {
      const builder = createValidBuilder();
      builder.setRelevantDate('2024-12-25T10:00:00.000Z');

      const { passData } = builder.build();
      expect(passData.relevantDate).toBe('2024-12-25T10:00:00.000Z');
    });

    it('should handle date-only string', () => {
      const builder = createValidBuilder();
      builder.setRelevantDate('2024-12-25');

      const { passData } = builder.build();
      expect(passData.relevantDate).toBe('2024-12-25');
    });

    it('should handle expiration date in the past', () => {
      const builder = createValidBuilder();
      builder.setExpirationDate(new Date('2020-01-01'));

      const { passData } = builder.build();
      expect(passData.expirationDate).toBeDefined();
    });

    it('should handle relevant dates array', () => {
      const builder = createValidBuilder();
      builder.setRelevantDates([
        { startDate: new Date('2024-12-24'), endDate: new Date('2024-12-25') },
        { startDate: new Date('2024-12-31') },
      ]);

      const { passData } = builder.build();
      expect(passData.relevantDates).toHaveLength(2);
    });
  });

  describe('Barcode Edge Cases', () => {
    it('should handle all barcode formats', () => {
      const builder = createValidBuilder();
      builder
        .addBarcode({ format: BarcodeFormat.QR, message: 'qr' })
        .addBarcode({ format: BarcodeFormat.PDF417, message: 'pdf417' })
        .addBarcode({ format: BarcodeFormat.Aztec, message: 'aztec' })
        .addBarcode({ format: BarcodeFormat.Code128, message: 'code128' });

      const { passData } = builder.build();
      expect(passData.barcodes).toHaveLength(4);
      expect(passData.barcodes?.[0].format).toBe(BarcodeFormat.QR);
      expect(passData.barcodes?.[1].format).toBe(BarcodeFormat.PDF417);
      expect(passData.barcodes?.[2].format).toBe(BarcodeFormat.Aztec);
      expect(passData.barcodes?.[3].format).toBe(BarcodeFormat.Code128);
    });

    it('should handle barcode with special characters in message', () => {
      const builder = createValidBuilder();
      builder.addBarcode({
        format: BarcodeFormat.QR,
        message: 'https://example.com/pass?id=123&token=abc%20xyz',
      });

      const { passData } = builder.build();
      expect(passData.barcodes?.[0].message).toBe(
        'https://example.com/pass?id=123&token=abc%20xyz'
      );
    });

    it('should handle barcode with binary-like data', () => {
      const builder = createValidBuilder();
      const binaryString = String.fromCharCode(0, 1, 2, 255, 254, 253);
      builder.addBarcode({
        format: BarcodeFormat.PDF417,
        message: binaryString,
      });

      const { passData } = builder.build();
      expect(passData.barcodes?.[0].message).toBe(binaryString);
    });

    it('should set default messageEncoding', () => {
      const builder = createValidBuilder();
      builder.addBarcode({
        format: BarcodeFormat.QR,
        message: 'test',
      });

      const { passData } = builder.build();
      expect(passData.barcodes?.[0].messageEncoding).toBe('iso-8859-1');
    });

    it('should allow custom messageEncoding', () => {
      const builder = createValidBuilder();
      builder.addBarcode({
        format: BarcodeFormat.QR,
        message: 'test',
        messageEncoding: 'utf-8',
      });

      const { passData } = builder.build();
      expect(passData.barcodes?.[0].messageEncoding).toBe('utf-8');
    });

    it('should handle QR code convenience method', () => {
      const builder = createValidBuilder();
      builder.addQRCode('https://example.com', 'Scan me');

      const { passData } = builder.build();
      expect(passData.barcodes?.[0].format).toBe(BarcodeFormat.QR);
      expect(passData.barcodes?.[0].message).toBe('https://example.com');
      expect(passData.barcodes?.[0].altText).toBe('Scan me');
    });
  });

  describe('Image Edge Cases', () => {
    it('should handle image with Buffer data', () => {
      const builder = createValidBuilder();
      const buffer = Buffer.from([137, 80, 78, 71]);
      builder.addImage({
        type: PassImageType.Icon,
        data: buffer,
      });

      const { images } = builder.build();
      expect(images).toHaveLength(1);
      expect(images[0].data).toEqual(buffer);
    });

    it('should handle image with Uint8Array data', () => {
      const builder = createValidBuilder();
      const uint8 = new Uint8Array([137, 80, 78, 71]);
      builder.addImage({
        type: PassImageType.Icon,
        data: uint8,
      });

      const { images } = builder.build();
      expect(images).toHaveLength(1);
      expect(images[0].data).toEqual(uint8);
    });

    it('should handle all image types', () => {
      const builder = createValidBuilder();
      const data = new Uint8Array([1]);
      builder
        .addImage({ type: PassImageType.Background, data })
        .addImage({ type: PassImageType.Footer, data })
        .addImage({ type: PassImageType.Icon, data })
        .addImage({ type: PassImageType.Logo, data })
        .addImage({ type: PassImageType.Strip, data })
        .addImage({ type: PassImageType.Thumbnail, data })
        .addImage({ type: PassImageType.PersonalizationLogo, data });

      const { images } = builder.build();
      expect(images).toHaveLength(7);
    });

    it('should handle all scale values', () => {
      const builder = createValidBuilder();
      const data = new Uint8Array([1]);
      builder
        .addImage({ type: PassImageType.Icon, data, scale: 1 })
        .addImage({ type: PassImageType.Icon, data, scale: 2 })
        .addImage({ type: PassImageType.Icon, data, scale: 3 });

      const { images } = builder.build();
      expect(images).toHaveLength(3);
      expect(images[0].scale).toBe(1);
      expect(images[1].scale).toBe(2);
      expect(images[2].scale).toBe(3);
    });

    it('should handle empty image data', () => {
      const builder = createValidBuilder();
      builder.addImage({
        type: PassImageType.Icon,
        data: new Uint8Array([]),
      });

      const { images } = builder.build();
      expect(images).toHaveLength(1);
      expect(images[0].data.length).toBe(0);
    });

    it('should handle large image data (1MB)', () => {
      const builder = createValidBuilder();
      const largeData = new Uint8Array(1024 * 1024); // 1MB
      builder.addImage({
        type: PassImageType.Strip,
        data: largeData,
      });

      const { images } = builder.build();
      expect(images[0].data.length).toBe(1024 * 1024);
    });
  });

  describe('Personalization Edge Cases', () => {
    it('should handle personalization with all field types', () => {
      const builder = createValidBuilder();
      builder.setPersonalization({
        requiredPersonalizationFields: [
          { type: 'name', description: 'Your full name' },
          { type: 'postalCode', description: 'Your postal code' },
          { type: 'emailAddress', description: 'Your email' },
          { type: 'phoneNumber', description: 'Your phone' },
        ],
        description: 'Personalize your pass',
        termsAndConditions: 'Terms apply',
      });

      const { personalization } = builder.build();
      expect(personalization?.requiredPersonalizationFields).toHaveLength(4);
    });

    it('should handle personalization with empty required fields array', () => {
      const builder = createValidBuilder();
      builder.setPersonalization({
        requiredPersonalizationFields: [],
      });

      const { personalization } = builder.build();
      expect(personalization?.requiredPersonalizationFields).toHaveLength(0);
    });

    it('should handle personalization with very long description', () => {
      const builder = createValidBuilder();
      const longDesc = 'a'.repeat(10000);
      builder.setPersonalization({
        requiredPersonalizationFields: [{ type: 'name', description: 'Name' }],
        description: longDesc,
      });

      const { personalization } = builder.build();
      expect(personalization?.description?.length).toBe(10000);
    });

    it('should handle personalization with special characters in terms', () => {
      const builder = createValidBuilder();
      builder.setPersonalization({
        requiredPersonalizationFields: [{ type: 'name', description: 'Name' }],
        termsAndConditions: 'Terms & Conditions © 2024\nSection 1: "Agreement"',
      });

      const { personalization } = builder.build();
      expect(personalization?.termsAndConditions).toContain('&');
      expect(personalization?.termsAndConditions).toContain('©');
      expect(personalization?.termsAndConditions).toContain('\n');
    });
  });

  describe('NFC Edge Cases', () => {
    it('should handle NFC with requiresAuthentication true', () => {
      const builder = createValidBuilder();
      builder.setNFC({
        message: 'nfc-data',
        requiresAuthentication: true,
      });

      const { passData } = builder.build();
      expect(passData.nfc?.requiresAuthentication).toBe(true);
    });

    it('should handle NFC with requiresAuthentication false', () => {
      const builder = createValidBuilder();
      builder.setNFC({
        message: 'nfc-data',
        requiresAuthentication: false,
      });

      const { passData } = builder.build();
      expect(passData.nfc?.requiresAuthentication).toBe(false);
    });

    it('should handle NFC with encryption public key', () => {
      const builder = createValidBuilder();
      builder.setNFC({
        message: 'encrypted-payload',
        encryptionPublicKey: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...',
      });

      const { passData } = builder.build();
      expect(passData.nfc?.encryptionPublicKey).toBeDefined();
    });
  });

  describe('Semantic Tags Edge Cases', () => {
    it('should handle balance with decimal amount', () => {
      const builder = createValidBuilder();
      builder.setSemanticTags({
        balance: { amount: '99.99', currencyCode: 'USD' },
      });

      const { passData } = builder.build();
      expect(passData.semantics?.balance?.amount).toBe('99.99');
      expect(passData.semantics?.balance?.currencyCode).toBe('USD');
    });

    it('should handle balance with negative amount', () => {
      const builder = createValidBuilder();
      builder.setSemanticTags({
        balance: { amount: '-50.00', currencyCode: 'EUR' },
      });

      const { passData } = builder.build();
      expect(passData.semantics?.balance?.amount).toBe('-50.00');
    });

    it('should handle flight number as number', () => {
      const builder = createValidBuilder();
      builder.setSemanticTags({
        flightNumber: 1234,
        airlineCode: 'AA',
      });

      const { passData } = builder.build();
      expect(passData.semantics?.flightNumber).toBe(1234);
    });

    it('should handle seats array', () => {
      const builder = createValidBuilder();
      builder.setSemanticTags({
        seats: [
          {
            seatNumber: '12A',
            seatRow: '12',
            seatSection: 'Business',
            seatType: 'Window',
          },
          {
            seatNumber: '12B',
            seatRow: '12',
            seatSection: 'Business',
            seatType: 'Middle',
          },
        ],
      });

      const { passData } = builder.build();
      expect(passData.semantics?.seats).toHaveLength(2);
    });

    it('should handle wifi access array', () => {
      const builder = createValidBuilder();
      builder.setSemanticTags({
        wifiAccess: [
          { ssid: 'GuestWiFi', password: 'welcome123' },
          { ssid: 'PremiumWiFi', password: 'vip456' },
        ],
      });

      const { passData } = builder.build();
      expect(passData.semantics?.wifiAccess).toHaveLength(2);
    });

    it('should handle performer names array', () => {
      const builder = createValidBuilder();
      builder.setSemanticTags({
        performerNames: ['Artist 1', 'Artist 2', 'Artist 3'],
      });

      const { passData } = builder.build();
      expect(passData.semantics?.performerNames).toHaveLength(3);
    });

    it('should handle empty semantic tags object', () => {
      const builder = createValidBuilder();
      builder.setSemanticTags({});

      const { passData } = builder.build();
      expect(passData.semantics).toEqual({});
    });
  });

  describe('User Info Edge Cases', () => {
    it('should handle complex nested user info', () => {
      const builder = createValidBuilder();
      builder.setUserInfo({
        string: 'value',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        nested: {
          deep: {
            value: 'nested',
          },
        },
      });

      const { passData } = builder.build();
      expect(passData.userInfo?.string).toBe('value');
      expect(passData.userInfo?.number).toBe(42);
      expect(passData.userInfo?.boolean).toBe(true);
      expect(passData.userInfo?.null).toBeNull();
      expect(passData.userInfo?.array).toEqual([1, 2, 3]);
      expect((passData.userInfo?.nested as Record<string, unknown>)?.deep).toEqual({
        value: 'nested',
      });
    });

    it('should handle empty user info object', () => {
      const builder = createValidBuilder();
      builder.setUserInfo({});

      const { passData } = builder.build();
      expect(passData.userInfo).toEqual({});
    });

    it('should handle user info with special keys', () => {
      const builder = createValidBuilder();
      builder.setUserInfo({
        'key-with-dash': 'value1',
        key_with_underscore: 'value2',
        'key.with.dots': 'value3',
        '123numeric': 'value4',
      });

      const { passData } = builder.build();
      expect(passData.userInfo?.['key-with-dash']).toBe('value1');
      expect(passData.userInfo?.key_with_underscore).toBe('value2');
    });
  });

  describe('Max Distance Edge Cases', () => {
    it('should handle maxDistance of 0', () => {
      const builder = createValidBuilder();
      builder.setMaxDistance(0);

      const { passData } = builder.build();
      expect(passData.maxDistance).toBe(0);
    });

    it('should handle very large maxDistance', () => {
      const builder = createValidBuilder();
      builder.setMaxDistance(1000000); // 1000km

      const { passData } = builder.build();
      expect(passData.maxDistance).toBe(1000000);
    });

    it('should handle floating point maxDistance', () => {
      const builder = createValidBuilder();
      builder.setMaxDistance(100.5);

      const { passData } = builder.build();
      expect(passData.maxDistance).toBe(100.5);
    });
  });

  describe('Associated Apps Edge Cases', () => {
    it('should handle empty store identifiers array', () => {
      const builder = createValidBuilder();
      builder.setAssociatedApps({
        storeIdentifiers: [],
      });

      const { passData } = builder.build();
      expect(passData.associatedStoreIdentifiers).toEqual([]);
    });

    it('should handle multiple store identifiers', () => {
      const builder = createValidBuilder();
      builder.setAssociatedApps({
        storeIdentifiers: [123456789, 987654321, 111111111],
      });

      const { passData } = builder.build();
      expect(passData.associatedStoreIdentifiers).toHaveLength(3);
    });

    it('should handle app launch URL with custom scheme', () => {
      const builder = createValidBuilder();
      builder.setAssociatedApps({
        appLaunchURL: 'myapp://deep/link/path?param=value',
      });

      const { passData } = builder.build();
      expect(passData.appLaunchURL).toBe('myapp://deep/link/path?param=value');
    });
  });

  describe('Pass Type Specific Edge Cases', () => {
    it('should handle BoardingPass without transitType', () => {
      const builder = createValidBuilder();
      builder.setPassType(PassType.BoardingPass);

      const { passData } = builder.build();
      expect(passData.boardingPass).toBeDefined();
      expect(passData.boardingPass?.transitType).toBeUndefined();
    });

    it('should handle all transit types', () => {
      const transitTypes = [
        TransitType.Air,
        TransitType.Boat,
        TransitType.Bus,
        TransitType.Train,
        TransitType.Generic,
      ];

      for (const transitType of transitTypes) {
        const builder = createValidBuilder();
        builder.setPassType(PassType.BoardingPass, transitType);

        const { passData } = builder.build();
        expect(passData.boardingPass?.transitType).toBe(transitType);
      }
    });

    it('should handle multiple field types across all pass regions', () => {
      const builder = createValidBuilder();
      builder
        .setPassType(PassType.Generic)
        .addHeaderField({ key: 'h1', value: 'Header 1' })
        .addHeaderField({ key: 'h2', value: 'Header 2' })
        .addPrimaryField({ key: 'p1', value: 'Primary 1' })
        .addPrimaryField({ key: 'p2', value: 'Primary 2' })
        .addSecondaryField({ key: 's1', value: 'Secondary 1' })
        .addSecondaryField({ key: 's2', value: 'Secondary 2' })
        .addAuxiliaryField({ key: 'a1', value: 'Auxiliary 1' })
        .addAuxiliaryField({ key: 'a2', value: 'Auxiliary 2' })
        .addBackField({ key: 'b1', value: 'Back 1' })
        .addBackField({ key: 'b2', value: 'Back 2' });

      const { passData } = builder.build();
      expect(passData.generic?.headerFields).toHaveLength(2);
      expect(passData.generic?.primaryFields).toHaveLength(2);
      expect(passData.generic?.secondaryFields).toHaveLength(2);
      expect(passData.generic?.auxiliaryFields).toHaveLength(2);
      expect(passData.generic?.backFields).toHaveLength(2);
    });
  });
});
