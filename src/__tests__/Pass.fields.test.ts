import { createPass, Pass } from '../Pass';
import { createPassBuilder } from '../PassBuilder';
import {
  PassData,
  PassFieldContent,
  PassType,
  TextAlignment,
  DateStyle,
  NumberStyle,
  DataDetectorType,
  BarcodeFormat,
  TransitType,
} from '../types';
import JSZip from 'jszip';

describe('Pass Field Content Edge Cases', () => {
  const minimalPassData: PassData = {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.example.test',
    serialNumber: 'TEST-001',
    teamIdentifier: 'ABCD1234',
    organizationName: 'Test Organization',
    description: 'Test Pass',
  };

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

  const getPassJsonFromBuffer = async (buffer: Uint8Array) => {
    const zip = await JSZip.loadAsync(buffer);
    const passJsonFile = zip.file('pass.json');
    const content = await passJsonFile!.async('string');
    return JSON.parse(content);
  };

  describe('All field types', () => {
    it('should add fields to headerFields array', async () => {
      const builder = createValidBuilder()
        .setPassType(PassType.StoreCard)
        .addHeaderField({ key: 'header1', label: 'Header 1', value: 'Value 1' })
        .addHeaderField({ key: 'header2', label: 'Header 2', value: 'Value 2' });

      const { passData } = builder.build();
      expect(passData.storeCard?.headerFields).toHaveLength(2);
      expect(passData.storeCard?.headerFields?.[0].key).toBe('header1');
      expect(passData.storeCard?.headerFields?.[1].key).toBe('header2');
    });

    it('should add fields to primaryFields array', async () => {
      const builder = createValidBuilder()
        .setPassType(PassType.EventTicket)
        .addPrimaryField({ key: 'primary1', label: 'Primary 1', value: 'Event Name' })
        .addPrimaryField({ key: 'primary2', label: 'Primary 2', value: 'Venue' });

      const { passData } = builder.build();
      expect(passData.eventTicket?.primaryFields).toHaveLength(2);
    });

    it('should add fields to secondaryFields array', async () => {
      const builder = createValidBuilder()
        .setPassType(PassType.Coupon)
        .addSecondaryField({ key: 'sec1', value: 'Discount' })
        .addSecondaryField({ key: 'sec2', value: 'Expiry' })
        .addSecondaryField({ key: 'sec3', value: 'Code' });

      const { passData } = builder.build();
      expect(passData.coupon?.secondaryFields).toHaveLength(3);
    });

    it('should add fields to auxiliaryFields array', async () => {
      const builder = createValidBuilder()
        .setPassType(PassType.BoardingPass, TransitType.Air)
        .addAuxiliaryField({ key: 'gate', label: 'Gate', value: 'A12' })
        .addAuxiliaryField({ key: 'seat', label: 'Seat', value: '14A' })
        .addAuxiliaryField({ key: 'zone', label: 'Zone', value: '1' });

      const { passData } = builder.build();
      expect(passData.boardingPass?.auxiliaryFields).toHaveLength(3);
    });

    it('should add fields to backFields array', async () => {
      const builder = createValidBuilder()
        .setPassType(PassType.Generic)
        .addBackField({ key: 'terms', label: 'Terms', value: 'Terms and conditions' })
        .addBackField({ key: 'website', label: 'Website', value: 'https://example.com' })
        .addBackField({ key: 'support', label: 'Support', value: 'support@example.com' })
        .addBackField({ key: 'faq', label: 'FAQ', value: 'Frequently asked questions' });

      const { passData } = builder.build();
      expect(passData.generic?.backFields).toHaveLength(4);
    });

    it('should serialize all field types correctly in generated pass', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          headerFields: [{ key: 'header', value: 'H' }],
          primaryFields: [{ key: 'primary', value: 'P' }],
          secondaryFields: [{ key: 'secondary', value: 'S' }],
          auxiliaryFields: [{ key: 'auxiliary', value: 'A' }],
          backFields: [{ key: 'back', value: 'B' }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.headerFields[0].value).toBe('H');
      expect(parsed.generic.primaryFields[0].value).toBe('P');
      expect(parsed.generic.secondaryFields[0].value).toBe('S');
      expect(parsed.generic.auxiliaryFields[0].value).toBe('A');
      expect(parsed.generic.backFields[0].value).toBe('B');
    });
  });

  describe('Different value types', () => {
    it('should handle string values', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{ key: 'name', value: 'John Doe' }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].value).toBe('John Doe');
      expect(typeof parsed.generic.primaryFields[0].value).toBe('string');
    });

    it('should handle number values', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [
            { key: 'balance', value: 1250.50 },
            { key: 'points', value: 1000 },
            { key: 'zero', value: 0 },
            { key: 'negative', value: -50 },
          ],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].value).toBe(1250.50);
      expect(parsed.generic.primaryFields[1].value).toBe(1000);
      expect(parsed.generic.primaryFields[2].value).toBe(0);
      expect(parsed.generic.primaryFields[3].value).toBe(-50);
    });

    it('should handle Date values', async () => {
      const testDate = new Date('2024-12-25T10:30:00.000Z');
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{ key: 'eventDate', value: testDate }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      // Dates should be serialized - either as ISO string or Date object serialization
      expect(parsed.generic.primaryFields[0].value).toBeDefined();
    });

    it('should handle integer values', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [
            { key: 'count', value: 42 },
            { key: 'maxInt', value: Number.MAX_SAFE_INTEGER },
          ],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].value).toBe(42);
      expect(parsed.generic.primaryFields[1].value).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle floating point values', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [
            { key: 'price', value: 19.99 },
            { key: 'percentage', value: 0.15 },
            { key: 'scientific', value: 1.5e10 },
          ],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].value).toBe(19.99);
      expect(parsed.generic.primaryFields[1].value).toBe(0.15);
      expect(parsed.generic.primaryFields[2].value).toBe(1.5e10);
    });
  });

  describe('changeMessage formatting', () => {
    it('should include changeMessage with %@ placeholder', async () => {
      const passData: PassData = {
        ...minimalPassData,
        storeCard: {
          headerFields: [{
            key: 'balance',
            label: 'Balance',
            value: '$100.00',
            changeMessage: 'Your balance is now %@',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.storeCard.headerFields[0].changeMessage).toBe('Your balance is now %@');
    });

    it('should handle changeMessage without placeholder', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'status',
            value: 'Active',
            changeMessage: 'Status has been updated',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].changeMessage).toBe('Status has been updated');
    });

    it('should handle changeMessage with special characters', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'points',
            value: 500,
            changeMessage: 'Points updated to %@! Keep earning.',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].changeMessage).toBe('Points updated to %@! Keep earning.');
    });

    it('should handle empty changeMessage', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'field',
            value: 'value',
            changeMessage: '',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].changeMessage).toBe('');
    });
  });

  describe('textAlignment options', () => {
    it('should set textAlignment to Left', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'aligned',
            value: 'Left aligned',
            textAlignment: TextAlignment.Left,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].textAlignment).toBe('PKTextAlignmentLeft');
    });

    it('should set textAlignment to Center', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'aligned',
            value: 'Center aligned',
            textAlignment: TextAlignment.Center,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].textAlignment).toBe('PKTextAlignmentCenter');
    });

    it('should set textAlignment to Right', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'aligned',
            value: 'Right aligned',
            textAlignment: TextAlignment.Right,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].textAlignment).toBe('PKTextAlignmentRight');
    });

    it('should set textAlignment to Natural', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'aligned',
            value: 'Natural aligned',
            textAlignment: TextAlignment.Natural,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].textAlignment).toBe('PKTextAlignmentNatural');
    });

    it('should handle multiple fields with different alignments', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          secondaryFields: [
            { key: 'left', value: 'L', textAlignment: TextAlignment.Left },
            { key: 'center', value: 'C', textAlignment: TextAlignment.Center },
            { key: 'right', value: 'R', textAlignment: TextAlignment.Right },
          ],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.secondaryFields[0].textAlignment).toBe('PKTextAlignmentLeft');
      expect(parsed.generic.secondaryFields[1].textAlignment).toBe('PKTextAlignmentCenter');
      expect(parsed.generic.secondaryFields[2].textAlignment).toBe('PKTextAlignmentRight');
    });
  });

  describe('attributedValue with HTML', () => {
    it('should include attributedValue with simple HTML', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'terms',
            label: 'Terms',
            value: 'Terms and Conditions',
            attributedValue: '<a href="https://example.com/terms">View Terms</a>',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.backFields[0].attributedValue).toBe('<a href="https://example.com/terms">View Terms</a>');
    });

    it('should handle attributedValue with complex HTML', async () => {
      const complexHtml = '<p>Welcome! <b>Important:</b> Read the <a href="https://example.com">terms</a>.</p>';
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'info',
            value: 'Info',
            attributedValue: complexHtml,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.backFields[0].attributedValue).toBe(complexHtml);
    });

    it('should handle attributedValue with escaped characters', async () => {
      const htmlWithEscapes = '<p>Price: &lt;$100 &amp; Free Shipping</p>';
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'price',
            value: 'Price Info',
            attributedValue: htmlWithEscapes,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.backFields[0].attributedValue).toBe(htmlWithEscapes);
    });

    it('should handle attributedValue with nested tags', async () => {
      const nestedHtml = '<div><span style="color:red">Important</span><br/><em>Please note</em></div>';
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'notice',
            value: 'Notice',
            attributedValue: nestedHtml,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.backFields[0].attributedValue).toBe(nestedHtml);
    });
  });

  describe('Date formatting options', () => {
    it('should set dateStyle to Short', async () => {
      const passData: PassData = {
        ...minimalPassData,
        eventTicket: {
          primaryFields: [{
            key: 'eventDate',
            value: new Date('2024-12-25T14:00:00Z'),
            dateStyle: DateStyle.Short,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.eventTicket.primaryFields[0].dateStyle).toBe('PKDateStyleShort');
    });

    it('should set dateStyle to Medium', async () => {
      const passData: PassData = {
        ...minimalPassData,
        eventTicket: {
          primaryFields: [{
            key: 'eventDate',
            value: new Date('2024-12-25T14:00:00Z'),
            dateStyle: DateStyle.Medium,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.eventTicket.primaryFields[0].dateStyle).toBe('PKDateStyleMedium');
    });

    it('should set dateStyle to Long', async () => {
      const passData: PassData = {
        ...minimalPassData,
        eventTicket: {
          primaryFields: [{
            key: 'eventDate',
            value: new Date('2024-12-25T14:00:00Z'),
            dateStyle: DateStyle.Long,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.eventTicket.primaryFields[0].dateStyle).toBe('PKDateStyleLong');
    });

    it('should set dateStyle to Full', async () => {
      const passData: PassData = {
        ...minimalPassData,
        eventTicket: {
          primaryFields: [{
            key: 'eventDate',
            value: new Date('2024-12-25T14:00:00Z'),
            dateStyle: DateStyle.Full,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.eventTicket.primaryFields[0].dateStyle).toBe('PKDateStyleFull');
    });

    it('should set dateStyle to None', async () => {
      const passData: PassData = {
        ...minimalPassData,
        eventTicket: {
          primaryFields: [{
            key: 'eventTime',
            value: new Date('2024-12-25T14:00:00Z'),
            dateStyle: DateStyle.None,
            timeStyle: DateStyle.Short,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.eventTicket.primaryFields[0].dateStyle).toBe('PKDateStyleNone');
      expect(parsed.eventTicket.primaryFields[0].timeStyle).toBe('PKDateStyleShort');
    });

    it('should set timeStyle options', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{
            key: 'departure',
            value: new Date('2024-12-25T14:30:00Z'),
            dateStyle: DateStyle.Short,
            timeStyle: DateStyle.Short,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.boardingPass.primaryFields[0].timeStyle).toBe('PKDateStyleShort');
    });

    it('should set isRelative to true', async () => {
      const passData: PassData = {
        ...minimalPassData,
        eventTicket: {
          primaryFields: [{
            key: 'eventDate',
            value: new Date('2024-12-25T14:00:00Z'),
            isRelative: true,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.eventTicket.primaryFields[0].isRelative).toBe(true);
    });

    it('should set isRelative to false', async () => {
      const passData: PassData = {
        ...minimalPassData,
        eventTicket: {
          primaryFields: [{
            key: 'eventDate',
            value: new Date('2024-12-25T14:00:00Z'),
            isRelative: false,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.eventTicket.primaryFields[0].isRelative).toBe(false);
    });

    it('should set ignoresTimeZone to true', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          auxiliaryFields: [{
            key: 'localTime',
            label: 'Local Time',
            value: new Date('2024-12-25T14:00:00Z'),
            ignoresTimeZone: true,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.boardingPass.auxiliaryFields[0].ignoresTimeZone).toBe(true);
    });

    it('should combine dateStyle, timeStyle, and ignoresTimeZone', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{
            key: 'boardingTime',
            label: 'Boarding',
            value: new Date('2024-12-25T14:00:00Z'),
            dateStyle: DateStyle.None,
            timeStyle: DateStyle.Short,
            ignoresTimeZone: true,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      const field = parsed.boardingPass.primaryFields[0];
      expect(field.dateStyle).toBe('PKDateStyleNone');
      expect(field.timeStyle).toBe('PKDateStyleShort');
      expect(field.ignoresTimeZone).toBe(true);
    });
  });

  describe('Number formatting options', () => {
    it('should set numberStyle to Decimal', async () => {
      const passData: PassData = {
        ...minimalPassData,
        storeCard: {
          primaryFields: [{
            key: 'amount',
            value: 1234.56,
            numberStyle: NumberStyle.Decimal,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.storeCard.primaryFields[0].numberStyle).toBe('PKNumberStyleDecimal');
    });

    it('should set numberStyle to Percent', async () => {
      const passData: PassData = {
        ...minimalPassData,
        coupon: {
          primaryFields: [{
            key: 'discount',
            label: 'Discount',
            value: 0.25,
            numberStyle: NumberStyle.Percent,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.coupon.primaryFields[0].numberStyle).toBe('PKNumberStylePercent');
    });

    it('should set numberStyle to Scientific', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'largeNumber',
            value: 6.022e23,
            numberStyle: NumberStyle.Scientific,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].numberStyle).toBe('PKNumberStyleScientific');
    });

    it('should set numberStyle to SpellOut', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'count',
            value: 5,
            numberStyle: NumberStyle.SpellOut,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].numberStyle).toBe('PKNumberStyleSpellOut');
    });

    it('should set currencyCode', async () => {
      const passData: PassData = {
        ...minimalPassData,
        storeCard: {
          headerFields: [{
            key: 'balance',
            label: 'Balance',
            value: 150.00,
            currencyCode: 'USD',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.storeCard.headerFields[0].currencyCode).toBe('USD');
    });

    it('should handle different currency codes', async () => {
      const passData: PassData = {
        ...minimalPassData,
        storeCard: {
          secondaryFields: [
            { key: 'usd', label: 'USD', value: 100, currencyCode: 'USD' },
            { key: 'eur', label: 'EUR', value: 100, currencyCode: 'EUR' },
            { key: 'gbp', label: 'GBP', value: 100, currencyCode: 'GBP' },
            { key: 'jpy', label: 'JPY', value: 10000, currencyCode: 'JPY' },
          ],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.storeCard.secondaryFields[0].currencyCode).toBe('USD');
      expect(parsed.storeCard.secondaryFields[1].currencyCode).toBe('EUR');
      expect(parsed.storeCard.secondaryFields[2].currencyCode).toBe('GBP');
      expect(parsed.storeCard.secondaryFields[3].currencyCode).toBe('JPY');
    });

    it('should combine numberStyle and currencyCode', async () => {
      const passData: PassData = {
        ...minimalPassData,
        storeCard: {
          primaryFields: [{
            key: 'price',
            label: 'Price',
            value: 49.99,
            numberStyle: NumberStyle.Decimal,
            currencyCode: 'EUR',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.storeCard.primaryFields[0].numberStyle).toBe('PKNumberStyleDecimal');
      expect(parsed.storeCard.primaryFields[0].currencyCode).toBe('EUR');
    });
  });

  describe('Data detector types', () => {
    it('should set single data detector type - PhoneNumber', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'support',
            label: 'Support',
            value: '+1 (555) 123-4567',
            dataDetectorTypes: [DataDetectorType.PhoneNumber],
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.backFields[0].dataDetectorTypes).toContain('PKDataDetectorTypePhoneNumber');
    });

    it('should set single data detector type - Link', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'website',
            label: 'Website',
            value: 'Visit us at https://example.com',
            dataDetectorTypes: [DataDetectorType.Link],
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.backFields[0].dataDetectorTypes).toContain('PKDataDetectorTypeLink');
    });

    it('should set single data detector type - Address', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'location',
            label: 'Location',
            value: '123 Main St, San Francisco, CA 94105',
            dataDetectorTypes: [DataDetectorType.Address],
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.backFields[0].dataDetectorTypes).toContain('PKDataDetectorTypeAddress');
    });

    it('should set single data detector type - CalendarEvent', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'event',
            label: 'Event',
            value: 'December 25, 2024 at 2:00 PM',
            dataDetectorTypes: [DataDetectorType.CalendarEvent],
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.backFields[0].dataDetectorTypes).toContain('PKDataDetectorTypeCalendarEvent');
    });

    it('should set multiple data detector types', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'contact',
            label: 'Contact',
            value: 'Call +1-555-123-4567 or visit https://example.com at 123 Main St',
            dataDetectorTypes: [
              DataDetectorType.PhoneNumber,
              DataDetectorType.Link,
              DataDetectorType.Address,
            ],
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      const detectors = parsed.generic.backFields[0].dataDetectorTypes;
      expect(detectors).toContain('PKDataDetectorTypePhoneNumber');
      expect(detectors).toContain('PKDataDetectorTypeLink');
      expect(detectors).toContain('PKDataDetectorTypeAddress');
      expect(detectors).toHaveLength(3);
    });

    it('should set all data detector types', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'info',
            label: 'Info',
            value: 'Full contact info',
            dataDetectorTypes: [
              DataDetectorType.PhoneNumber,
              DataDetectorType.Link,
              DataDetectorType.Address,
              DataDetectorType.CalendarEvent,
            ],
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      const detectors = parsed.generic.backFields[0].dataDetectorTypes;
      expect(detectors).toHaveLength(4);
    });

    it('should handle empty data detector types array', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'noDetectors',
            value: 'Plain text without detectors',
            dataDetectorTypes: [],
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.backFields[0].dataDetectorTypes).toEqual([]);
    });
  });

  describe('Semantic tags on individual fields', () => {
    it('should set semantic tags on a field', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          headerFields: [{
            key: 'gate',
            label: 'Gate',
            value: 'A12',
            semantics: {
              departureGate: 'A12',
            },
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.boardingPass.headerFields[0].semantics.departureGate).toBe('A12');
    });

    it('should set multiple semantic tags on a field', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{
            key: 'destination',
            label: 'JFK',
            value: 'New York',
            semantics: {
              destinationAirportCode: 'JFK',
              destinationAirportName: 'John F. Kennedy International Airport',
            },
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      const semantics = parsed.boardingPass.primaryFields[0].semantics;
      expect(semantics.destinationAirportCode).toBe('JFK');
      expect(semantics.destinationAirportName).toBe('John F. Kennedy International Airport');
    });

    it('should set passenger name semantic tag', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          secondaryFields: [{
            key: 'passenger',
            label: 'Passenger',
            value: 'John Doe',
            semantics: {
              passengerName: {
                givenName: 'John',
                familyName: 'Doe',
              },
            },
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      const passengerName = parsed.boardingPass.secondaryFields[0].semantics.passengerName;
      expect(passengerName.givenName).toBe('John');
      expect(passengerName.familyName).toBe('Doe');
    });

    it('should set balance semantic tag', async () => {
      const passData: PassData = {
        ...minimalPassData,
        storeCard: {
          headerFields: [{
            key: 'balance',
            label: 'Balance',
            value: '$50.00',
            semantics: {
              balance: {
                amount: '50.00',
                currencyCode: 'USD',
              },
            },
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      const balance = parsed.storeCard.headerFields[0].semantics.balance;
      expect(balance.amount).toBe('50.00');
      expect(balance.currencyCode).toBe('USD');
    });

    it('should set event semantic tags on field', async () => {
      const passData: PassData = {
        ...minimalPassData,
        eventTicket: {
          primaryFields: [{
            key: 'event',
            label: 'Event',
            value: 'Summer Concert',
            semantics: {
              eventName: 'Summer Concert 2024',
              venueName: 'Madison Square Garden',
            },
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      const semantics = parsed.eventTicket.primaryFields[0].semantics;
      expect(semantics.eventName).toBe('Summer Concert 2024');
      expect(semantics.venueName).toBe('Madison Square Garden');
    });

    it('should set seat semantic tags', async () => {
      const passData: PassData = {
        ...minimalPassData,
        eventTicket: {
          auxiliaryFields: [{
            key: 'seat',
            label: 'Seat',
            value: 'Section A, Row 5, Seat 12',
            semantics: {
              seats: [{
                seatSection: 'A',
                seatRow: '5',
                seatNumber: '12',
              }],
            },
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      const seats = parsed.eventTicket.auxiliaryFields[0].semantics.seats;
      expect(seats[0].seatSection).toBe('A');
      expect(seats[0].seatRow).toBe('5');
      expect(seats[0].seatNumber).toBe('12');
    });
  });

  describe('Empty/missing labels', () => {
    it('should handle field without label', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'noLabel',
            value: 'Value without label',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].key).toBe('noLabel');
      expect(parsed.generic.primaryFields[0].value).toBe('Value without label');
      expect(parsed.generic.primaryFields[0].label).toBeUndefined();
    });

    it('should handle field with empty string label', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'emptyLabel',
            label: '',
            value: 'Value with empty label',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].label).toBe('');
    });

    it('should handle mix of fields with and without labels', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          secondaryFields: [
            { key: 'withLabel', label: 'Has Label', value: 'Value 1' },
            { key: 'withoutLabel', value: 'Value 2' },
            { key: 'emptyLabel', label: '', value: 'Value 3' },
          ],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.secondaryFields[0].label).toBe('Has Label');
      expect(parsed.generic.secondaryFields[1].label).toBeUndefined();
      expect(parsed.generic.secondaryFields[2].label).toBe('');
    });

    it('should handle header field without label', async () => {
      const builder = createValidBuilder()
        .setPassType(PassType.StoreCard)
        .addHeaderField({ key: 'points', value: 1000 });

      const { passData } = builder.build();
      expect(passData.storeCard?.headerFields?.[0].label).toBeUndefined();
    });

    it('should handle back field without label', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'info',
            value: 'Some information without a label',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.backFields[0].label).toBeUndefined();
    });
  });

  describe('Duplicate keys across fields', () => {
    it('should allow same key in different field types', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          headerFields: [{ key: 'name', value: 'Header Name' }],
          primaryFields: [{ key: 'name', value: 'Primary Name' }],
          secondaryFields: [{ key: 'name', value: 'Secondary Name' }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.headerFields[0].key).toBe('name');
      expect(parsed.generic.primaryFields[0].key).toBe('name');
      expect(parsed.generic.secondaryFields[0].key).toBe('name');
    });

    it('should handle duplicate keys within same field type array', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [
            { key: 'info', value: 'First info' },
            { key: 'info', value: 'Second info' },
          ],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      // Both should be present in serialized output
      expect(parsed.generic.backFields).toHaveLength(2);
      expect(parsed.generic.backFields[0].key).toBe('info');
      expect(parsed.generic.backFields[1].key).toBe('info');
    });

    it('should preserve all fields with duplicate keys via builder', async () => {
      const builder = createValidBuilder()
        .setPassType(PassType.Generic)
        .addSecondaryField({ key: 'item', value: 'Item 1' })
        .addSecondaryField({ key: 'item', value: 'Item 2' })
        .addSecondaryField({ key: 'item', value: 'Item 3' });

      const { passData } = builder.build();
      expect(passData.generic?.secondaryFields).toHaveLength(3);
    });
  });

  describe('Very long field values', () => {
    it('should handle very long string value', async () => {
      const longValue = 'A'.repeat(5000);
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'longText',
            label: 'Long Text',
            value: longValue,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.backFields[0].value).toBe(longValue);
      expect(parsed.generic.backFields[0].value.length).toBe(5000);
    });

    it('should handle very long label', async () => {
      const longLabel = 'Label '.repeat(100);
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'field',
            label: longLabel,
            value: 'Value',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].label).toBe(longLabel);
    });

    it('should handle very long changeMessage', async () => {
      const longMessage = 'Your balance has been updated to %@. ' + 'Thank you for your loyalty. '.repeat(50);
      const passData: PassData = {
        ...minimalPassData,
        storeCard: {
          headerFields: [{
            key: 'balance',
            value: 100,
            changeMessage: longMessage,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.storeCard.headerFields[0].changeMessage).toBe(longMessage);
    });

    it('should handle very long attributedValue HTML', async () => {
      const longHtml = '<p>' + 'Lorem ipsum dolor sit amet. '.repeat(200) + '</p>';
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'terms',
            value: 'Terms',
            attributedValue: longHtml,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.backFields[0].attributedValue).toBe(longHtml);
    });

    it('should handle very long key', async () => {
      const longKey = 'field_' + 'x'.repeat(200);
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: longKey,
            value: 'Value',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].key).toBe(longKey);
    });
  });

  describe('Special characters in keys and values', () => {
    it('should handle special characters in key', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'field-with_special.chars',
            value: 'Value',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].key).toBe('field-with_special.chars');
    });

    it('should handle unicode characters in value', async () => {
      const unicodeValue = 'Hello \u4e16\u754c \ud83c\udf89 \u00e9\u00e8\u00ea';
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'unicode',
            value: unicodeValue,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].value).toBe(unicodeValue);
    });

    it('should handle emoji in value', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'emoji',
            value: 'Welcome! \ud83d\ude4b\u200d\u2642\ufe0f \ud83c\udf88 \ud83c\udf89',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].value).toBe('Welcome! \ud83d\ude4b\u200d\u2642\ufe0f \ud83c\udf88 \ud83c\udf89');
    });

    it('should handle quotes in value', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'quotes',
            value: 'He said "Hello" and she said \'Hi\'',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].value).toBe('He said "Hello" and she said \'Hi\'');
    });

    it('should handle newlines in value', async () => {
      const valueWithNewlines = 'Line 1\nLine 2\nLine 3';
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'multiline',
            value: valueWithNewlines,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.backFields[0].value).toBe(valueWithNewlines);
    });

    it('should handle tabs in value', async () => {
      const valueWithTabs = 'Column1\tColumn2\tColumn3';
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'tabbed',
            value: valueWithTabs,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.backFields[0].value).toBe(valueWithTabs);
    });

    it('should handle backslashes in value', async () => {
      const valueWithBackslashes = 'C:\\Users\\Name\\Documents';
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'path',
            value: valueWithBackslashes,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.backFields[0].value).toBe(valueWithBackslashes);
    });

    it('should handle special JSON characters in label', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'special',
            label: 'Label with "quotes" and \\backslash',
            value: 'Value',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].label).toBe('Label with "quotes" and \\backslash');
    });

    it('should handle numeric string values', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'numericString',
            value: '12345678901234567890',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].value).toBe('12345678901234567890');
      expect(typeof parsed.generic.primaryFields[0].value).toBe('string');
    });

    it('should handle currency symbols in value', async () => {
      const passData: PassData = {
        ...minimalPassData,
        storeCard: {
          primaryFields: [{
            key: 'prices',
            value: '$100 | \u20ac85 | \u00a375 | \u00a510,000',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.storeCard.primaryFields[0].value).toBe('$100 | \u20ac85 | \u00a375 | \u00a510,000');
    });

    it('should handle RTL characters in value', async () => {
      const rtlValue = '\u05e9\u05dc\u05d5\u05dd \u0645\u0631\u062d\u0628\u0627';
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{
            key: 'rtl',
            value: rtlValue,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].value).toBe(rtlValue);
    });

    it('should handle null-like string values', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [
            { key: 'nullString', value: 'null' },
            { key: 'undefinedString', value: 'undefined' },
            { key: 'falseString', value: 'false' },
          ],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.generic.primaryFields[0].value).toBe('null');
      expect(parsed.generic.primaryFields[1].value).toBe('undefined');
      expect(parsed.generic.primaryFields[2].value).toBe('false');
    });
  });

  describe('Edge cases for combined options', () => {
    it('should handle field with all options set', async () => {
      const passData: PassData = {
        ...minimalPassData,
        storeCard: {
          headerFields: [{
            key: 'fullField',
            label: 'Full Field',
            value: 100.50,
            changeMessage: 'Value changed to %@',
            textAlignment: TextAlignment.Right,
            numberStyle: NumberStyle.Decimal,
            currencyCode: 'USD',
            dataDetectorTypes: [DataDetectorType.Link],
            semantics: {
              balance: { amount: '100.50', currencyCode: 'USD' },
            },
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      const field = parsed.storeCard.headerFields[0];
      expect(field.key).toBe('fullField');
      expect(field.label).toBe('Full Field');
      expect(field.value).toBe(100.50);
      expect(field.changeMessage).toBe('Value changed to %@');
      expect(field.textAlignment).toBe('PKTextAlignmentRight');
      expect(field.numberStyle).toBe('PKNumberStyleDecimal');
      expect(field.currencyCode).toBe('USD');
      expect(field.dataDetectorTypes).toContain('PKDataDetectorTypeLink');
      expect(field.semantics.balance.amount).toBe('100.50');
    });

    it('should handle date field with all date options', async () => {
      const passData: PassData = {
        ...minimalPassData,
        eventTicket: {
          primaryFields: [{
            key: 'eventDateTime',
            label: 'Event Time',
            value: new Date('2024-12-25T14:00:00Z'),
            dateStyle: DateStyle.Medium,
            timeStyle: DateStyle.Short,
            isRelative: false,
            ignoresTimeZone: true,
            changeMessage: 'Event time updated to %@',
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      const field = parsed.eventTicket.primaryFields[0];
      expect(field.dateStyle).toBe('PKDateStyleMedium');
      expect(field.timeStyle).toBe('PKDateStyleShort');
      expect(field.isRelative).toBe(false);
      expect(field.ignoresTimeZone).toBe(true);
      expect(field.changeMessage).toBe('Event time updated to %@');
    });

    it('should handle attributedValue with text alignment', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          backFields: [{
            key: 'terms',
            label: 'Terms',
            value: 'Terms and Conditions',
            attributedValue: '<a href="https://example.com/terms">Full Terms</a>',
            textAlignment: TextAlignment.Center,
          }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      const field = parsed.generic.backFields[0];
      expect(field.attributedValue).toBe('<a href="https://example.com/terms">Full Terms</a>');
      expect(field.textAlignment).toBe('PKTextAlignmentCenter');
    });
  });

  describe('Boarding pass specific fields', () => {
    it('should handle all transit types', async () => {
      const transitTypes = [
        { type: TransitType.Air, expected: 'PKTransitTypeAir' },
        { type: TransitType.Boat, expected: 'PKTransitTypeBoat' },
        { type: TransitType.Bus, expected: 'PKTransitTypeBus' },
        { type: TransitType.Train, expected: 'PKTransitTypeTrain' },
        { type: TransitType.Generic, expected: 'PKTransitTypeGeneric' },
      ];

      for (const { type, expected } of transitTypes) {
        const builder = createValidBuilder()
          .setPassType(PassType.BoardingPass, type)
          .addPrimaryField({ key: 'from', value: 'Origin' });

        const { passData } = builder.build();
        expect(passData.boardingPass?.transitType).toBe(expected);
      }
    });

    it('should handle boarding pass with full flight info fields', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          headerFields: [
            { key: 'gate', label: 'GATE', value: 'A12' },
            { key: 'boardingTime', label: 'BOARDING', value: '14:30' },
          ],
          primaryFields: [
            { key: 'origin', label: 'SFO', value: 'San Francisco' },
            { key: 'destination', label: 'JFK', value: 'New York' },
          ],
          secondaryFields: [
            { key: 'passenger', label: 'PASSENGER', value: 'DOE/JOHN' },
            { key: 'class', label: 'CLASS', value: 'Business' },
          ],
          auxiliaryFields: [
            { key: 'flight', label: 'FLIGHT', value: 'AA123' },
            { key: 'seat', label: 'SEAT', value: '4A' },
            { key: 'zone', label: 'ZONE', value: '1' },
            { key: 'confirmation', label: 'CONFIRMATION', value: 'ABC123' },
          ],
          backFields: [
            { key: 'terms', label: 'Terms', value: 'Standard airline terms apply' },
          ],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.boardingPass.transitType).toBe('PKTransitTypeAir');
      expect(parsed.boardingPass.headerFields).toHaveLength(2);
      expect(parsed.boardingPass.primaryFields).toHaveLength(2);
      expect(parsed.boardingPass.secondaryFields).toHaveLength(2);
      expect(parsed.boardingPass.auxiliaryFields).toHaveLength(4);
      expect(parsed.boardingPass.backFields).toHaveLength(1);
    });
  });

  describe('Pass types field placement', () => {
    it('should place fields in coupon pass type', async () => {
      const passData: PassData = {
        ...minimalPassData,
        coupon: {
          primaryFields: [{ key: 'offer', label: 'Offer', value: '20% OFF' }],
          secondaryFields: [{ key: 'expires', label: 'Expires', value: '12/31/2024' }],
          auxiliaryFields: [{ key: 'code', label: 'Code', value: 'SAVE20' }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.coupon).toBeDefined();
      expect(parsed.coupon.primaryFields[0].value).toBe('20% OFF');
    });

    it('should place fields in event ticket pass type', async () => {
      const passData: PassData = {
        ...minimalPassData,
        eventTicket: {
          primaryFields: [{ key: 'event', value: 'Concert' }],
          secondaryFields: [{ key: 'venue', value: 'Arena' }],
          auxiliaryFields: [
            { key: 'section', value: 'A' },
            { key: 'row', value: '5' },
            { key: 'seat', value: '12' },
          ],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.eventTicket).toBeDefined();
      expect(parsed.eventTicket.auxiliaryFields).toHaveLength(3);
    });

    it('should place fields in store card pass type', async () => {
      const passData: PassData = {
        ...minimalPassData,
        storeCard: {
          headerFields: [{ key: 'points', label: 'Points', value: 5000 }],
          primaryFields: [{ key: 'name', label: 'Name', value: 'John Doe' }],
          secondaryFields: [{ key: 'level', label: 'Level', value: 'Gold' }],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const parsed = await getPassJsonFromBuffer(buffer);

      expect(parsed.storeCard).toBeDefined();
      expect(parsed.storeCard.headerFields[0].value).toBe(5000);
    });
  });
});
