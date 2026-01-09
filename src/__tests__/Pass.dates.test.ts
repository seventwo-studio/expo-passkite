import { Pass, createPass } from '../Pass';
import { PassBuilder, createPassBuilder } from '../PassBuilder';
import { PassData, RelevantDate } from '../types';
import JSZip from 'jszip';

describe('Pass Date Handling', () => {
  const minimalPassData: PassData = {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.example.test',
    serialNumber: 'TEST-001',
    teamIdentifier: 'ABCD1234',
    organizationName: 'Test Organization',
    description: 'Test Pass',
  };

  const getPassJson = async (pass: Pass): Promise<Record<string, unknown>> => {
    const buffer = await pass.generate({ skipSignature: true });
    const zip = await JSZip.loadAsync(buffer);
    const passJsonFile = zip.file('pass.json');
    const passJsonContent = await passJsonFile!.async('string');
    return JSON.parse(passJsonContent);
  };

  describe('relevantDate with Date objects vs ISO strings', () => {
    it('should accept ISO string format directly', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-12-25T10:00:00.000Z',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-12-25T10:00:00.000Z');
    });

    it('should accept ISO string without milliseconds', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-12-25T10:00:00Z',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-12-25T10:00:00Z');
    });

    it('should accept ISO string with timezone offset', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-12-25T10:00:00+05:30',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-12-25T10:00:00+05:30');
    });

    it('should accept ISO string with negative timezone offset', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-12-25T10:00:00-08:00',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-12-25T10:00:00-08:00');
    });

    it('should convert Date object to ISO string via PassBuilder', () => {
      const date = new Date('2024-12-25T10:00:00.000Z');
      const builder = createPassBuilder();

      builder
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Organization',
          description: 'Test Pass',
        })
        .setRelevantDate(date);

      const { passData } = builder.build();
      expect(passData.relevantDate).toBe('2024-12-25T10:00:00.000Z');
    });

    it('should accept string directly via PassBuilder', () => {
      const builder = createPassBuilder();

      builder
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Organization',
          description: 'Test Pass',
        })
        .setRelevantDate('2024-12-25T10:00:00.000Z');

      const { passData } = builder.build();
      expect(passData.relevantDate).toBe('2024-12-25T10:00:00.000Z');
    });
  });

  describe('expirationDate edge cases', () => {
    it('should accept ISO string for expiration date', async () => {
      const passData: PassData = {
        ...minimalPassData,
        expirationDate: '2025-12-31T23:59:59.999Z',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.expirationDate).toBe('2025-12-31T23:59:59.999Z');
    });

    it('should convert Date object to ISO string via PassBuilder', () => {
      const date = new Date('2025-12-31T23:59:59.999Z');
      const builder = createPassBuilder();

      builder
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Organization',
          description: 'Test Pass',
        })
        .setExpirationDate(date);

      const { passData } = builder.build();
      expect(passData.expirationDate).toBe('2025-12-31T23:59:59.999Z');
    });

    it('should accept string directly via PassBuilder', () => {
      const builder = createPassBuilder();

      builder
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Organization',
          description: 'Test Pass',
        })
        .setExpirationDate('2025-12-31T23:59:59.999Z');

      const { passData } = builder.build();
      expect(passData.expirationDate).toBe('2025-12-31T23:59:59.999Z');
    });

    it('should handle end of day expiration', async () => {
      const passData: PassData = {
        ...minimalPassData,
        expirationDate: '2024-06-30T23:59:59.999Z',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.expirationDate).toBe('2024-06-30T23:59:59.999Z');
    });

    it('should handle start of day expiration', async () => {
      const passData: PassData = {
        ...minimalPassData,
        expirationDate: '2024-06-30T00:00:00.000Z',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.expirationDate).toBe('2024-06-30T00:00:00.000Z');
    });
  });

  describe('timezone handling', () => {
    it('should preserve UTC timezone indicator', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-07-04T18:00:00.000Z',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-07-04T18:00:00.000Z');
    });

    it('should preserve positive timezone offset', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-07-04T18:00:00+09:00',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-07-04T18:00:00+09:00');
    });

    it('should preserve negative timezone offset', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-07-04T18:00:00-05:00',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-07-04T18:00:00-05:00');
    });

    it('should preserve half-hour timezone offset', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-07-04T18:00:00+05:30',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-07-04T18:00:00+05:30');
    });

    it('should preserve quarter-hour timezone offset', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-07-04T18:00:00+05:45',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-07-04T18:00:00+05:45');
    });

    it('should convert Date object from different timezone context to UTC', () => {
      // When creating a Date object, JavaScript internally stores it as UTC
      const date = new Date('2024-07-04T12:00:00-05:00'); // 5PM UTC
      const builder = createPassBuilder();

      builder
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Organization',
          description: 'Test Pass',
        })
        .setRelevantDate(date);

      const { passData } = builder.build();
      // Date.toISOString() always outputs UTC
      expect(passData.relevantDate).toBe('2024-07-04T17:00:00.000Z');
    });
  });

  describe('past dates', () => {
    it('should accept past date for relevantDate', async () => {
      const pastDate = '2020-01-01T00:00:00.000Z';
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: pastDate,
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe(pastDate);
    });

    it('should accept far past date (year 2000)', async () => {
      const farPastDate = '2000-01-01T00:00:00.000Z';
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: farPastDate,
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe(farPastDate);
    });

    it('should accept past expiration date', async () => {
      const pastDate = '2020-06-15T12:00:00.000Z';
      const passData: PassData = {
        ...minimalPassData,
        expirationDate: pastDate,
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.expirationDate).toBe(pastDate);
    });
  });

  describe('future dates', () => {
    it('should accept future date for relevantDate', async () => {
      const futureDate = '2030-12-25T10:00:00.000Z';
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: futureDate,
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe(futureDate);
    });

    it('should accept far future date (year 2099)', async () => {
      const farFutureDate = '2099-12-31T23:59:59.999Z';
      const passData: PassData = {
        ...minimalPassData,
        expirationDate: farFutureDate,
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.expirationDate).toBe(farFutureDate);
    });

    it('should accept future expiration date', async () => {
      const futureDate = '2030-12-31T23:59:59.999Z';
      const passData: PassData = {
        ...minimalPassData,
        expirationDate: futureDate,
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.expirationDate).toBe(futureDate);
    });
  });

  describe('current/near dates', () => {
    it('should handle date very close to current time', async () => {
      const now = new Date();
      const nearDate = now.toISOString();
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: nearDate,
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe(nearDate);
    });

    it('should handle date 1 second in the future', async () => {
      const oneSecondLater = new Date(Date.now() + 1000);
      const builder = createPassBuilder();

      builder
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Organization',
          description: 'Test Pass',
        })
        .setRelevantDate(oneSecondLater);

      const { passData } = builder.build();
      expect(passData.relevantDate).toBe(oneSecondLater.toISOString());
    });

    it('should handle date 1 second in the past', async () => {
      const oneSecondAgo = new Date(Date.now() - 1000);
      const builder = createPassBuilder();

      builder
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Organization',
          description: 'Test Pass',
        })
        .setRelevantDate(oneSecondAgo);

      const { passData } = builder.build();
      expect(passData.relevantDate).toBe(oneSecondAgo.toISOString());
    });
  });

  describe('invalid date strings', () => {
    it('should pass through invalid date string as-is (no validation)', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: 'not-a-valid-date',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      // The library does not validate date strings, passes them through
      expect(parsed.relevantDate).toBe('not-a-valid-date');
    });

    it('should pass through empty string as-is', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('');
    });

    it('should pass through partial date string as-is', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-12-25',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-12-25');
    });

    it('should pass through date without time as-is', async () => {
      const passData: PassData = {
        ...minimalPassData,
        expirationDate: '2024-12-31',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.expirationDate).toBe('2024-12-31');
    });

    it('should pass through malformed timezone as-is', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-12-25T10:00:00+99:99',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-12-25T10:00:00+99:99');
    });
  });

  describe('relevantDates array (iOS 17+)', () => {
    describe('basic functionality', () => {
      it('should accept relevantDates with startDate only', async () => {
        const startDate = new Date('2024-07-04T10:00:00.000Z');
        const passData: PassData = {
          ...minimalPassData,
          relevantDates: [{ startDate }],
        };

        const pass = createPass(passData);
        const parsed = await getPassJson(pass);

        expect(parsed.relevantDates).toEqual([
          { startDate: '2024-07-04T10:00:00.000Z' },
        ]);
      });

      it('should accept relevantDates with endDate only', async () => {
        const endDate = new Date('2024-07-04T18:00:00.000Z');
        const passData: PassData = {
          ...minimalPassData,
          relevantDates: [{ endDate }],
        };

        const pass = createPass(passData);
        const parsed = await getPassJson(pass);

        expect(parsed.relevantDates).toEqual([
          { endDate: '2024-07-04T18:00:00.000Z' },
        ]);
      });

      it('should accept relevantDates with both startDate and endDate', async () => {
        const startDate = new Date('2024-07-04T10:00:00.000Z');
        const endDate = new Date('2024-07-04T18:00:00.000Z');
        const passData: PassData = {
          ...minimalPassData,
          relevantDates: [{ startDate, endDate }],
        };

        const pass = createPass(passData);
        const parsed = await getPassJson(pass);

        expect(parsed.relevantDates).toEqual([
          {
            startDate: '2024-07-04T10:00:00.000Z',
            endDate: '2024-07-04T18:00:00.000Z',
          },
        ]);
      });
    });

    describe('multiple date ranges', () => {
      it('should accept multiple relevantDates entries', async () => {
        const relevantDates: RelevantDate[] = [
          {
            startDate: new Date('2024-07-04T10:00:00.000Z'),
            endDate: new Date('2024-07-04T18:00:00.000Z'),
          },
          {
            startDate: new Date('2024-07-05T10:00:00.000Z'),
            endDate: new Date('2024-07-05T18:00:00.000Z'),
          },
          {
            startDate: new Date('2024-07-06T10:00:00.000Z'),
            endDate: new Date('2024-07-06T18:00:00.000Z'),
          },
        ];

        const passData: PassData = {
          ...minimalPassData,
          relevantDates,
        };

        const pass = createPass(passData);
        const parsed = await getPassJson(pass);

        expect(parsed.relevantDates).toHaveLength(3);
        expect(parsed.relevantDates).toEqual([
          {
            startDate: '2024-07-04T10:00:00.000Z',
            endDate: '2024-07-04T18:00:00.000Z',
          },
          {
            startDate: '2024-07-05T10:00:00.000Z',
            endDate: '2024-07-05T18:00:00.000Z',
          },
          {
            startDate: '2024-07-06T10:00:00.000Z',
            endDate: '2024-07-06T18:00:00.000Z',
          },
        ]);
      });

      it('should handle mixed date range configurations', async () => {
        const relevantDates: RelevantDate[] = [
          { startDate: new Date('2024-07-04T10:00:00.000Z') }, // start only
          { endDate: new Date('2024-07-05T18:00:00.000Z') }, // end only
          {
            startDate: new Date('2024-07-06T10:00:00.000Z'),
            endDate: new Date('2024-07-06T18:00:00.000Z'),
          }, // both
        ];

        const passData: PassData = {
          ...minimalPassData,
          relevantDates,
        };

        const pass = createPass(passData);
        const parsed = await getPassJson(pass);

        expect(parsed.relevantDates).toEqual([
          { startDate: '2024-07-04T10:00:00.000Z' },
          { endDate: '2024-07-05T18:00:00.000Z' },
          {
            startDate: '2024-07-06T10:00:00.000Z',
            endDate: '2024-07-06T18:00:00.000Z',
          },
        ]);
      });
    });

    describe('edge cases', () => {
      it('should handle empty relevantDates array', async () => {
        const passData: PassData = {
          ...minimalPassData,
          relevantDates: [],
        };

        const pass = createPass(passData);
        const parsed = await getPassJson(pass);

        expect(parsed.relevantDates).toEqual([]);
      });

      it('should handle relevantDates with empty object', async () => {
        const passData: PassData = {
          ...minimalPassData,
          relevantDates: [{}],
        };

        const pass = createPass(passData);
        const parsed = await getPassJson(pass);

        expect(parsed.relevantDates).toEqual([{}]);
      });

      it('should handle startDate equal to endDate', async () => {
        const sameDate = new Date('2024-07-04T12:00:00.000Z');
        const passData: PassData = {
          ...minimalPassData,
          relevantDates: [{ startDate: sameDate, endDate: sameDate }],
        };

        const pass = createPass(passData);
        const parsed = await getPassJson(pass);

        expect(parsed.relevantDates).toEqual([
          {
            startDate: '2024-07-04T12:00:00.000Z',
            endDate: '2024-07-04T12:00:00.000Z',
          },
        ]);
      });

      it('should handle startDate after endDate (no validation)', async () => {
        // Library does not validate that startDate is before endDate
        const startDate = new Date('2024-07-05T10:00:00.000Z');
        const endDate = new Date('2024-07-04T18:00:00.000Z');
        const passData: PassData = {
          ...minimalPassData,
          relevantDates: [{ startDate, endDate }],
        };

        const pass = createPass(passData);
        const parsed = await getPassJson(pass);

        expect(parsed.relevantDates).toEqual([
          {
            startDate: '2024-07-05T10:00:00.000Z',
            endDate: '2024-07-04T18:00:00.000Z',
          },
        ]);
      });
    });

    describe('PassBuilder integration', () => {
      it('should set relevantDates via PassBuilder', () => {
        const relevantDates: RelevantDate[] = [
          {
            startDate: new Date('2024-07-04T10:00:00.000Z'),
            endDate: new Date('2024-07-04T18:00:00.000Z'),
          },
        ];

        const builder = createPassBuilder();
        builder
          .setIdentifiers({
            passTypeIdentifier: 'pass.com.example.test',
            serialNumber: 'TEST-001',
            teamIdentifier: 'ABCD1234',
          })
          .setOrganization({
            organizationName: 'Test Organization',
            description: 'Test Pass',
          })
          .setRelevantDates(relevantDates);

        const { passData } = builder.build();
        expect(passData.relevantDates).toEqual(relevantDates);
      });
    });

    describe('coexistence with relevantDate', () => {
      it('should allow both relevantDate and relevantDates', async () => {
        const passData: PassData = {
          ...minimalPassData,
          relevantDate: '2024-07-04T08:00:00.000Z',
          relevantDates: [
            {
              startDate: new Date('2024-07-04T10:00:00.000Z'),
              endDate: new Date('2024-07-04T18:00:00.000Z'),
            },
          ],
        };

        const pass = createPass(passData);
        const parsed = await getPassJson(pass);

        expect(parsed.relevantDate).toBe('2024-07-04T08:00:00.000Z');
        expect(parsed.relevantDates).toEqual([
          {
            startDate: '2024-07-04T10:00:00.000Z',
            endDate: '2024-07-04T18:00:00.000Z',
          },
        ]);
      });
    });
  });

  describe('date formatting in generated pass.json', () => {
    it('should maintain ISO 8601 format with milliseconds', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-07-04T12:34:56.789Z',
        expirationDate: '2024-12-31T23:59:59.999Z',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-07-04T12:34:56.789Z');
      expect(parsed.expirationDate).toBe('2024-12-31T23:59:59.999Z');
    });

    it('should produce valid JSON with dates', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-07-04T12:00:00.000Z',
        relevantDates: [
          {
            startDate: new Date('2024-07-04T10:00:00.000Z'),
            endDate: new Date('2024-07-04T18:00:00.000Z'),
          },
        ],
        expirationDate: '2024-12-31T23:59:59.999Z',
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const zip = await JSZip.loadAsync(buffer);
      const passJsonFile = zip.file('pass.json');
      const passJsonContent = await passJsonFile!.async('string');

      // Should not throw when parsing
      const parsed = JSON.parse(passJsonContent);

      // Dates should be strings, not objects
      expect(typeof parsed.relevantDate).toBe('string');
      expect(typeof parsed.expirationDate).toBe('string');
      expect(Array.isArray(parsed.relevantDates)).toBe(true);
      expect(typeof parsed.relevantDates[0].startDate).toBe('string');
      expect(typeof parsed.relevantDates[0].endDate).toBe('string');
    });

    it('should pretty print pass.json with proper indentation', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-07-04T12:00:00.000Z',
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const zip = await JSZip.loadAsync(buffer);
      const passJsonFile = zip.file('pass.json');
      const passJsonContent = await passJsonFile!.async('string');

      // Check that JSON is formatted (has newlines)
      expect(passJsonContent).toContain('\n');
      // Check proper structure
      expect(passJsonContent).toContain('"relevantDate"');
    });
  });

  describe('millisecond precision handling', () => {
    it('should preserve full millisecond precision (3 digits)', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-07-04T12:00:00.123Z',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-07-04T12:00:00.123Z');
    });

    it('should preserve zero milliseconds when specified', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-07-04T12:00:00.000Z',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-07-04T12:00:00.000Z');
    });

    it('should handle Date object millisecond precision', () => {
      // Date with specific milliseconds
      const date = new Date('2024-07-04T12:00:00.456Z');
      const builder = createPassBuilder();

      builder
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Organization',
          description: 'Test Pass',
        })
        .setRelevantDate(date);

      const { passData } = builder.build();
      expect(passData.relevantDate).toBe('2024-07-04T12:00:00.456Z');
    });

    it('should handle milliseconds near boundary (999)', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-07-04T12:00:00.999Z',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-07-04T12:00:00.999Z');
    });

    it('should handle milliseconds near boundary (001)', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-07-04T12:00:00.001Z',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-07-04T12:00:00.001Z');
    });

    it('should convert Date.now() with millisecond precision', () => {
      const now = new Date();
      const builder = createPassBuilder();

      builder
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.test',
          serialNumber: 'TEST-001',
          teamIdentifier: 'ABCD1234',
        })
        .setOrganization({
          organizationName: 'Test Organization',
          description: 'Test Pass',
        })
        .setRelevantDate(now);

      const { passData } = builder.build();

      // Should match the ISO format with milliseconds
      expect(passData.relevantDate).toBe(now.toISOString());
      expect(passData.relevantDate).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it('should handle relevantDates millisecond precision', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDates: [
          {
            startDate: new Date('2024-07-04T10:00:00.123Z'),
            endDate: new Date('2024-07-04T18:00:00.456Z'),
          },
        ],
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      const relevantDates = parsed.relevantDates as Array<{
        startDate?: string;
        endDate?: string;
      }>;
      expect(relevantDates[0].startDate).toBe('2024-07-04T10:00:00.123Z');
      expect(relevantDates[0].endDate).toBe('2024-07-04T18:00:00.456Z');
    });
  });

  describe('special date values', () => {
    it('should handle midnight UTC', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-07-04T00:00:00.000Z',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-07-04T00:00:00.000Z');
    });

    it('should handle end of day UTC', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-07-04T23:59:59.999Z',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-07-04T23:59:59.999Z');
    });

    it('should handle leap year date', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-02-29T12:00:00.000Z',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-02-29T12:00:00.000Z');
    });

    it('should handle New Year transition', async () => {
      const passData: PassData = {
        ...minimalPassData,
        relevantDate: '2024-12-31T23:59:59.999Z',
        expirationDate: '2025-01-01T00:00:00.000Z',
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe('2024-12-31T23:59:59.999Z');
      expect(parsed.expirationDate).toBe('2025-01-01T00:00:00.000Z');
    });

    it('should handle daylight saving time boundary dates', async () => {
      // US DST change dates in 2024
      const springForward = '2024-03-10T02:00:00.000Z';
      const fallBack = '2024-11-03T02:00:00.000Z';

      const passData: PassData = {
        ...minimalPassData,
        relevantDate: springForward,
        expirationDate: fallBack,
      };

      const pass = createPass(passData);
      const parsed = await getPassJson(pass);

      expect(parsed.relevantDate).toBe(springForward);
      expect(parsed.expirationDate).toBe(fallBack);
    });
  });
});
