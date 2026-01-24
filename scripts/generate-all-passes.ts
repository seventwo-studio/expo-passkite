/**
 * Comprehensive pass generation test
 * Generates passes for every possible configuration to validate the library
 */
import { PassBuilder } from '../src/PassBuilder';
import { Pass } from '../src/Pass';
import { loadCredentialsFromEnv, loadPassIdentityFromEnv } from '../src/credentials';
import {
  PassType,
  TransitType,
  BarcodeFormat,
  PassImageType,
  TextAlignment,
  DateStyle,
  NumberStyle,
  DataDetectorType,
} from '../src/types';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(import.meta.dir, '..', 'test-passes');

// Minimal valid PNG icons in different colors (29x29)
const ICONS = {
  white: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAIAAADZ8fBYAAAAEklEQVR42mP4////GYMKjHoaAHqpH/U/HrJdAAAAAElFTkSuQmCC', 'base64'),
  blue: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAIAAADZ8fBYAAAAGElEQVR42mNgGGTg////DAwMo54e9TQSAABxPh/1cNvLqAAAAABJRU5ErkJggg==', 'base64'),
  red: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAIAAADZ8fBYAAAAGElEQVR42mNgGGTg/38GBgaG0U+PerqfAAB0vB/1U+5O7QAAAABJRU5ErkJggg==', 'base64'),
  green: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAIAAADZ8fBYAAAAGElEQVR42mNgGGTgP4MCA8Oop0c9PQIAAHI2H/Wfy2ySAAAAAElFTkSuQmCC', 'base64'),
};

let credentials: ReturnType<typeof loadCredentialsFromEnv>;
let identity: ReturnType<typeof loadPassIdentityFromEnv>;
let passCount = 0;
let successCount = 0;
let failCount = 0;

async function generatePass(name: string, builderFn: (builder: PassBuilder) => void): Promise<void> {
  passCount++;
  const safeName = name.replace(/[^a-z0-9-]/gi, '-').toLowerCase();

  try {
    const builder = new PassBuilder();

    // Set required fields
    builder.setIdentifiers({
      passTypeIdentifier: identity.passTypeIdentifier,
      serialNumber: `test-${safeName}-${Date.now()}`,
      teamIdentifier: identity.teamIdentifier,
    });

    // Apply custom configuration
    builderFn(builder);

    const { passData, images } = builder.build();
    const pass = new Pass(passData, images);
    pass.setSigningCredentials(credentials);

    const pkpassData = await pass.generate();
    const outputPath = join(OUTPUT_DIR, `${safeName}.pkpass`);
    writeFileSync(outputPath, pkpassData);

    console.log(`  ✓ ${name}`);
    successCount++;
  } catch (err) {
    console.log(`  ✗ ${name}: ${(err as Error).message}`);
    failCount++;
  }
}

async function main() {
  console.log('Loading credentials...');
  credentials = loadCredentialsFromEnv();
  identity = loadPassIdentityFromEnv();
  console.log(`  Pass Type ID: ${identity.passTypeIdentifier}\n`);

  // Create output directory
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // ============================================================
  // PASS TYPES
  // ============================================================
  console.log('=== PASS TYPES ===');

  await generatePass('Generic Pass', (b) => {
    b.setPassType(PassType.Generic);
    b.setOrganization({ organizationName: 'Test Org', description: 'Generic Pass Test' });
    b.addPrimaryField({ key: 'member', label: 'MEMBER', value: 'John Doe' });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  await generatePass('Store Card', (b) => {
    b.setPassType(PassType.StoreCard);
    b.setOrganization({ organizationName: 'Coffee Shop', description: 'Loyalty Card' });
    b.setColors({ backgroundColor: 'rgb(139, 69, 19)', foregroundColor: 'rgb(255, 255, 255)' });
    b.addPrimaryField({ key: 'balance', label: 'BALANCE', value: '$25.00' });
    b.addSecondaryField({ key: 'points', label: 'POINTS', value: '1,250' });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  await generatePass('Coupon', (b) => {
    b.setPassType(PassType.Coupon);
    b.setOrganization({ organizationName: 'Super Store', description: '20% Off Coupon' });
    b.setColors({ backgroundColor: 'rgb(255, 99, 71)', foregroundColor: 'rgb(255, 255, 255)' });
    b.addPrimaryField({ key: 'offer', label: 'OFFER', value: '20% OFF' });
    b.addAuxiliaryField({ key: 'expires', label: 'EXPIRES', value: '2025-12-31' });
    b.addImage({ type: PassImageType.Icon, data: ICONS.red });
  });

  await generatePass('Event Ticket', (b) => {
    b.setPassType(PassType.EventTicket);
    b.setOrganization({ organizationName: 'Concert Hall', description: 'Concert Ticket' });
    b.setColors({ backgroundColor: 'rgb(75, 0, 130)', foregroundColor: 'rgb(255, 255, 255)' });
    b.addPrimaryField({ key: 'event', label: 'EVENT', value: 'Rock Concert' });
    b.addSecondaryField({ key: 'date', label: 'DATE', value: 'Jan 15, 2025' });
    b.addSecondaryField({ key: 'time', label: 'TIME', value: '8:00 PM' });
    b.addAuxiliaryField({ key: 'seat', label: 'SEAT', value: 'A-15' });
    b.addAuxiliaryField({ key: 'section', label: 'SECTION', value: 'Floor' });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  // Boarding passes with all transit types
  const transitTypes = [
    { type: TransitType.Air, name: 'Flight', from: 'SFO', to: 'JFK', carrier: 'AA 123' },
    { type: TransitType.Train, name: 'Train', from: 'NYC', to: 'BOS', carrier: 'Amtrak 2151' },
    { type: TransitType.Bus, name: 'Bus', from: 'LA', to: 'SF', carrier: 'Greyhound 45' },
    { type: TransitType.Boat, name: 'Ferry', from: 'SF', to: 'Sausalito', carrier: 'Golden Gate' },
    { type: TransitType.Generic, name: 'Generic Transit', from: 'A', to: 'B', carrier: 'Transit Co' },
  ];

  for (const transit of transitTypes) {
    await generatePass(`Boarding Pass - ${transit.name}`, (b) => {
      b.setPassType(PassType.BoardingPass, transit.type);
      b.setOrganization({ organizationName: transit.carrier, description: `${transit.name} Boarding Pass` });
      b.setColors({ backgroundColor: 'rgb(0, 51, 102)', foregroundColor: 'rgb(255, 255, 255)' });
      b.addHeaderField({ key: 'gate', label: 'GATE', value: 'B12' });
      b.addPrimaryField({ key: 'from', label: transit.from, value: transit.from });
      b.addPrimaryField({ key: 'to', label: transit.to, value: transit.to });
      b.addSecondaryField({ key: 'passenger', label: 'PASSENGER', value: 'JOHN DOE' });
      b.addAuxiliaryField({ key: 'class', label: 'CLASS', value: 'Economy' });
      b.addAuxiliaryField({ key: 'seat', label: 'SEAT', value: '24A' });
      b.addImage({ type: PassImageType.Icon, data: ICONS.blue });
    });
  }

  // ============================================================
  // BARCODE FORMATS
  // ============================================================
  console.log('\n=== BARCODE FORMATS ===');

  const barcodeFormats: Array<{ format: BarcodeFormat; name: string }> = [
    { format: BarcodeFormat.QR, name: 'QR Code' },
    { format: BarcodeFormat.PDF417, name: 'PDF417' },
    { format: BarcodeFormat.Aztec, name: 'Aztec' },
    { format: BarcodeFormat.Code128, name: 'Code128' },
  ];

  for (const bc of barcodeFormats) {
    await generatePass(`Barcode - ${bc.name}`, (b) => {
      b.setPassType(PassType.Generic);
      b.setOrganization({ organizationName: 'Barcode Test', description: `${bc.name} Test` });
      b.addPrimaryField({ key: 'type', label: 'BARCODE TYPE', value: bc.name });
      b.addBarcode({
        format: bc.format,
        message: 'TESTBARCODE12345',
        messageEncoding: 'iso-8859-1',
        altText: 'TESTBARCODE12345',
      });
      b.addImage({ type: PassImageType.Icon, data: ICONS.white });
    });
  }

  await generatePass('Multiple Barcodes', (b) => {
    b.setPassType(PassType.Generic);
    b.setOrganization({ organizationName: 'Multi Barcode', description: 'Multiple Barcodes Test' });
    b.addPrimaryField({ key: 'test', label: 'TEST', value: 'Multiple Barcodes' });
    b.addBarcode({ format: BarcodeFormat.QR, message: 'QR-CODE-DATA', messageEncoding: 'iso-8859-1' });
    b.addBarcode({ format: BarcodeFormat.PDF417, message: 'PDF417-DATA', messageEncoding: 'iso-8859-1' });
    b.addBarcode({ format: BarcodeFormat.Aztec, message: 'AZTEC-DATA', messageEncoding: 'iso-8859-1' });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  // ============================================================
  // FIELD CONFIGURATIONS
  // ============================================================
  console.log('\n=== FIELD CONFIGURATIONS ===');

  await generatePass('All Field Types', (b) => {
    b.setPassType(PassType.Generic);
    b.setOrganization({ organizationName: 'Field Test', description: 'All Fields', logoText: 'LOGO' });
    b.addHeaderField({ key: 'h1', label: 'HEADER 1', value: 'H1 Value' });
    b.addHeaderField({ key: 'h2', label: 'HEADER 2', value: 'H2 Value' });
    b.addPrimaryField({ key: 'p1', label: 'PRIMARY', value: 'Primary Value' });
    b.addSecondaryField({ key: 's1', label: 'SECONDARY 1', value: 'Sec 1' });
    b.addSecondaryField({ key: 's2', label: 'SECONDARY 2', value: 'Sec 2' });
    b.addSecondaryField({ key: 's3', label: 'SECONDARY 3', value: 'Sec 3' });
    b.addAuxiliaryField({ key: 'a1', label: 'AUX 1', value: 'Aux 1' });
    b.addAuxiliaryField({ key: 'a2', label: 'AUX 2', value: 'Aux 2' });
    b.addAuxiliaryField({ key: 'a3', label: 'AUX 3', value: 'Aux 3' });
    b.addBackField({ key: 'b1', label: 'Back Field 1', value: 'This is back field content' });
    b.addBackField({ key: 'b2', label: 'Back Field 2', value: 'More back content with details' });
    b.addBackField({ key: 'b3', label: 'Terms', value: 'Terms and conditions apply...' });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  await generatePass('Field with Change Message', (b) => {
    b.setPassType(PassType.Generic);
    b.setOrganization({ organizationName: 'Change Test', description: 'Change Message Test' });
    b.addPrimaryField({
      key: 'balance',
      label: 'BALANCE',
      value: '$100.00',
      changeMessage: 'Your balance is now %@',
    });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  await generatePass('Field with Data Detector', (b) => {
    b.setPassType(PassType.Generic);
    b.setOrganization({ organizationName: 'Data Detector', description: 'Data Detector Test' });
    b.addPrimaryField({ key: 'info', label: 'INFO', value: 'Test' });
    b.addBackField({
      key: 'phone',
      label: 'Phone',
      value: '+1 (555) 123-4567',
      dataDetectorTypes: [DataDetectorType.PhoneNumber],
    });
    b.addBackField({
      key: 'link',
      label: 'Website',
      value: 'https://example.com',
      dataDetectorTypes: [DataDetectorType.Link],
    });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  await generatePass('Currency Field', (b) => {
    b.setPassType(PassType.StoreCard);
    b.setOrganization({ organizationName: 'Currency Test', description: 'Currency Fields' });
    b.addPrimaryField({
      key: 'balance',
      label: 'BALANCE',
      value: 150,
      currencyCode: 'USD',
    });
    b.addSecondaryField({
      key: 'euros',
      label: 'EUR',
      value: 125.50,
      currencyCode: 'EUR',
    });
    b.addImage({ type: PassImageType.Icon, data: ICONS.green });
  });

  await generatePass('Number Field', (b) => {
    b.setPassType(PassType.Generic);
    b.setOrganization({ organizationName: 'Number Test', description: 'Number Fields' });
    b.addPrimaryField({
      key: 'count',
      label: 'COUNT',
      value: 42,
      numberStyle: NumberStyle.Decimal,
    });
    b.addSecondaryField({
      key: 'percent',
      label: 'DISCOUNT',
      value: 0.25,
      numberStyle: NumberStyle.Percent,
    });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  await generatePass('Date Field', (b) => {
    b.setPassType(PassType.EventTicket);
    b.setOrganization({ organizationName: 'Date Test', description: 'Date Fields' });
    b.addPrimaryField({ key: 'event', label: 'EVENT', value: 'Conference' });
    b.addSecondaryField({
      key: 'date',
      label: 'DATE',
      value: '2025-06-15T14:30:00Z',
      dateStyle: DateStyle.Medium,
      timeStyle: DateStyle.Short,
    });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  await generatePass('Text Alignment', (b) => {
    b.setPassType(PassType.Generic);
    b.setOrganization({ organizationName: 'Alignment Test', description: 'Text Alignment' });
    b.addPrimaryField({ key: 'center', label: 'CENTER', value: 'Centered', textAlignment: TextAlignment.Center });
    b.addSecondaryField({ key: 'left', label: 'LEFT', value: 'Left', textAlignment: TextAlignment.Left });
    b.addSecondaryField({ key: 'right', label: 'RIGHT', value: 'Right', textAlignment: TextAlignment.Right });
    b.addSecondaryField({ key: 'natural', label: 'NATURAL', value: 'Natural', textAlignment: TextAlignment.Natural });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  // ============================================================
  // COLORS & STYLING
  // ============================================================
  console.log('\n=== COLORS & STYLING ===');

  const colorSchemes = [
    { name: 'Dark Theme', bg: 'rgb(30, 30, 30)', fg: 'rgb(255, 255, 255)', label: 'rgb(180, 180, 180)' },
    { name: 'Light Theme', bg: 'rgb(245, 245, 245)', fg: 'rgb(30, 30, 30)', label: 'rgb(100, 100, 100)' },
    { name: 'Blue Theme', bg: 'rgb(0, 122, 255)', fg: 'rgb(255, 255, 255)', label: 'rgb(200, 230, 255)' },
    { name: 'Green Theme', bg: 'rgb(52, 199, 89)', fg: 'rgb(255, 255, 255)', label: 'rgb(200, 255, 200)' },
    { name: 'Orange Theme', bg: 'rgb(255, 149, 0)', fg: 'rgb(255, 255, 255)', label: 'rgb(255, 230, 200)' },
    { name: 'Pink Theme', bg: 'rgb(255, 45, 85)', fg: 'rgb(255, 255, 255)', label: 'rgb(255, 200, 210)' },
    { name: 'Purple Theme', bg: 'rgb(175, 82, 222)', fg: 'rgb(255, 255, 255)', label: 'rgb(230, 200, 255)' },
  ];

  for (const scheme of colorSchemes) {
    await generatePass(`Color - ${scheme.name}`, (b) => {
      b.setPassType(PassType.Generic);
      b.setOrganization({ organizationName: 'Color Test', description: scheme.name });
      b.setColors({ backgroundColor: scheme.bg, foregroundColor: scheme.fg, labelColor: scheme.label });
      b.addPrimaryField({ key: 'theme', label: 'THEME', value: scheme.name });
      b.addSecondaryField({ key: 'bg', label: 'BACKGROUND', value: scheme.bg });
      b.addImage({ type: PassImageType.Icon, data: ICONS.white });
    });
  }

  // ============================================================
  // LOCATIONS & RELEVANCE
  // ============================================================
  console.log('\n=== LOCATIONS & RELEVANCE ===');

  await generatePass('Location - Single', (b) => {
    b.setPassType(PassType.StoreCard);
    b.setOrganization({ organizationName: 'Location Test', description: 'Single Location' });
    b.addPrimaryField({ key: 'store', label: 'STORE', value: 'Downtown' });
    b.addLocation({
      latitude: 37.7749,
      longitude: -122.4194,
      relevantText: 'Welcome to our Downtown store!',
    });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  await generatePass('Location - Multiple', (b) => {
    b.setPassType(PassType.StoreCard);
    b.setOrganization({ organizationName: 'Multi Location', description: 'Multiple Locations' });
    b.addPrimaryField({ key: 'chain', label: 'CHAIN', value: 'Coffee Co' });
    b.addLocation({ latitude: 37.7749, longitude: -122.4194, relevantText: 'SF Downtown' });
    b.addLocation({ latitude: 37.3382, longitude: -121.8863, relevantText: 'San Jose' });
    b.addLocation({ latitude: 37.5485, longitude: -121.9886, relevantText: 'Fremont' });
    b.addLocation({ latitude: 37.8044, longitude: -122.2712, relevantText: 'Oakland' });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  await generatePass('Location with Max Distance', (b) => {
    b.setPassType(PassType.Coupon);
    b.setOrganization({ organizationName: 'Distance Test', description: 'Max Distance' });
    b.addPrimaryField({ key: 'offer', label: 'OFFER', value: '10% Off' });
    b.setMaxDistance(500); // 500 meters
    b.addLocation({ latitude: 37.7749, longitude: -122.4194 });
    b.addImage({ type: PassImageType.Icon, data: ICONS.red });
  });

  await generatePass('Beacon', (b) => {
    b.setPassType(PassType.StoreCard);
    b.setOrganization({ organizationName: 'Beacon Test', description: 'iBeacon Support' });
    b.addPrimaryField({ key: 'store', label: 'STORE', value: 'Smart Store' });
    b.addBeacon({
      proximityUUID: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
      major: 1,
      minor: 100,
      relevantText: 'You are near the entrance!',
    });
    b.addBeacon({
      proximityUUID: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
      major: 1,
      minor: 200,
      relevantText: 'Check out our sale section!',
    });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  await generatePass('Relevant Date', (b) => {
    b.setPassType(PassType.EventTicket);
    b.setOrganization({ organizationName: 'Date Relevance', description: 'Relevant Date Test' });
    b.addPrimaryField({ key: 'event', label: 'EVENT', value: 'Concert' });
    b.setRelevantDate(new Date('2025-06-15T20:00:00'));
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  await generatePass('Expiration Date', (b) => {
    b.setPassType(PassType.Coupon);
    b.setOrganization({ organizationName: 'Expiration Test', description: 'Expires Soon' });
    b.addPrimaryField({ key: 'offer', label: 'OFFER', value: '50% Off' });
    b.addAuxiliaryField({ key: 'expires', label: 'EXPIRES', value: 'Dec 31, 2025' });
    b.setExpirationDate(new Date('2025-12-31T23:59:59'));
    b.addImage({ type: PassImageType.Icon, data: ICONS.red });
  });

  // ============================================================
  // WEB SERVICE & UPDATES
  // ============================================================
  console.log('\n=== WEB SERVICE & UPDATES ===');

  await generatePass('Web Service Enabled', (b) => {
    b.setPassType(PassType.StoreCard);
    b.setOrganization({ organizationName: 'Web Service', description: 'Updatable Pass' });
    b.addPrimaryField({ key: 'balance', label: 'BALANCE', value: '$50.00' });
    b.setWebService({
      webServiceURL: 'https://api.example.com/passes/',
      authenticationToken: 'vxwxd7J8AlNNFPS8k0a0FfUFtq0ewzFdc',
    });
    b.addImage({ type: PassImageType.Icon, data: ICONS.green });
  });

  await generatePass('Voided Pass', (b) => {
    b.setPassType(PassType.Coupon);
    b.setOrganization({ organizationName: 'Voided Test', description: 'Voided Pass' });
    b.addPrimaryField({ key: 'offer', label: 'OFFER', value: 'USED' });
    b.setVoided(true);
    b.addImage({ type: PassImageType.Icon, data: ICONS.red });
  });

  // ============================================================
  // NFC
  // ============================================================
  console.log('\n=== NFC ===');

  await generatePass('NFC Enabled', (b) => {
    b.setPassType(PassType.StoreCard);
    b.setOrganization({ organizationName: 'NFC Test', description: 'NFC Pass' });
    b.addPrimaryField({ key: 'member', label: 'MEMBER ID', value: 'NFC-12345' });
    b.setNFC({
      message: 'com.example.nfc.payment',
      encryptionPublicKey: 'MDkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDIgADVYF8RFbIw/M7PGw8NA==',
    });
    b.addImage({ type: PassImageType.Icon, data: ICONS.blue });
  });

  // ============================================================
  // SEMANTIC TAGS
  // ============================================================
  console.log('\n=== SEMANTIC TAGS ===');

  await generatePass('Semantic - Airline', (b) => {
    b.setPassType(PassType.BoardingPass, TransitType.Air);
    b.setOrganization({ organizationName: 'Semantic Air', description: 'Airline Semantics' });
    b.addHeaderField({ key: 'gate', label: 'GATE', value: 'A12' });
    b.addPrimaryField({ key: 'from', label: 'SFO', value: 'SFO' });
    b.addPrimaryField({ key: 'to', label: 'JFK', value: 'JFK' });
    b.addSecondaryField({ key: 'passenger', label: 'PASSENGER', value: 'JOHN DOE' });
    b.setSemanticTags({
      airlineCode: 'AA',
      flightNumber: 123,
      departureAirportCode: 'SFO',
      destinationAirportCode: 'JFK',
      boardingGroup: 'A',
      seats: [{ seatNumber: '24A' }],
      passengerName: { givenName: 'John', familyName: 'Doe' },
    });
    b.addImage({ type: PassImageType.Icon, data: ICONS.blue });
  });

  await generatePass('Semantic - Event', (b) => {
    b.setPassType(PassType.EventTicket);
    b.setOrganization({ organizationName: 'Semantic Event', description: 'Event Semantics' });
    b.addPrimaryField({ key: 'event', label: 'EVENT', value: 'Tech Conference' });
    b.addSecondaryField({ key: 'date', label: 'DATE', value: 'June 15, 2025' });
    b.setSemanticTags({
      eventName: 'Tech Conference 2025',
      eventType: 'PKEventTypeConference',
      venueName: 'Convention Center',
      venueLocation: { latitude: 37.7749, longitude: -122.4194 },
      eventStartDate: '2025-06-15T09:00:00Z',
      eventEndDate: '2025-06-15T18:00:00Z',
    });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  await generatePass('Semantic - Store Card', (b) => {
    b.setPassType(PassType.StoreCard);
    b.setOrganization({ organizationName: 'Semantic Store', description: 'Store Semantics' });
    b.addPrimaryField({ key: 'balance', label: 'BALANCE', value: '$75.00' });
    b.setSemanticTags({
      balance: { amount: '75.00', currencyCode: 'USD' },
      membershipProgramName: 'Rewards Club',
      membershipProgramNumber: 'RC-123456789',
    });
    b.addImage({ type: PassImageType.Icon, data: ICONS.green });
  });

  await generatePass('Semantic - Transit', (b) => {
    b.setPassType(PassType.BoardingPass, TransitType.Train);
    b.setOrganization({ organizationName: 'Semantic Rail', description: 'Transit Semantics' });
    b.addPrimaryField({ key: 'from', label: 'NYC', value: 'New York' });
    b.addPrimaryField({ key: 'to', label: 'BOS', value: 'Boston' });
    b.setSemanticTags({
      transitProvider: 'Amtrak',
      departurePlatform: 'Track 5',
      departureStationName: 'Penn Station',
      destinationStationName: 'South Station',
      carNumber: 'Car 7',
    });
    b.addImage({ type: PassImageType.Icon, data: ICONS.blue });
  });

  // ============================================================
  // IMAGES
  // ============================================================
  console.log('\n=== IMAGES ===');

  await generatePass('Multiple Image Scales', (b) => {
    b.setPassType(PassType.Generic);
    b.setOrganization({ organizationName: 'Scale Test', description: 'Image Scales' });
    b.addPrimaryField({ key: 'test', label: 'TEST', value: 'Multiple Scales' });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white, scale: 1 });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white, scale: 2 });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white, scale: 3 });
    b.addImage({ type: PassImageType.Logo, data: ICONS.blue, scale: 1 });
    b.addImage({ type: PassImageType.Logo, data: ICONS.blue, scale: 2 });
  });

  await generatePass('All Image Types', (b) => {
    b.setPassType(PassType.StoreCard);
    b.setOrganization({ organizationName: 'Image Types', description: 'All Images', logoText: 'LOGO' });
    b.addPrimaryField({ key: 'test', label: 'TEST', value: 'All Images' });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
    b.addImage({ type: PassImageType.Logo, data: ICONS.blue });
    b.addImage({ type: PassImageType.Strip, data: ICONS.green });
    b.addImage({ type: PassImageType.Thumbnail, data: ICONS.red });
  });

  // ============================================================
  // COMPLEX COMBINATIONS
  // ============================================================
  console.log('\n=== COMPLEX COMBINATIONS ===');

  await generatePass('Full Featured Event', (b) => {
    b.setPassType(PassType.EventTicket);
    b.setOrganization({
      organizationName: 'Live Nation',
      description: 'Taylor Swift Concert',
      logoText: 'LIVE NATION',
    });
    b.setColors({
      backgroundColor: 'rgb(128, 0, 128)',
      foregroundColor: 'rgb(255, 255, 255)',
      labelColor: 'rgb(255, 200, 255)',
    });

    b.addHeaderField({ key: 'date', label: 'DATE', value: 'SAT, JUN 15' });
    b.addPrimaryField({ key: 'event', label: 'EVENT', value: 'Taylor Swift - Eras Tour' });
    b.addSecondaryField({ key: 'venue', label: 'VENUE', value: 'SoFi Stadium' });
    b.addSecondaryField({ key: 'doors', label: 'DOORS', value: '6:00 PM' });
    b.addAuxiliaryField({ key: 'section', label: 'SECTION', value: 'Floor A' });
    b.addAuxiliaryField({ key: 'row', label: 'ROW', value: '15' });
    b.addAuxiliaryField({ key: 'seat', label: 'SEAT', value: '23' });

    b.addBackField({ key: 'terms', label: 'Terms', value: 'No refunds. Must present valid ID.' });
    b.addBackField({ key: 'info', label: 'Event Info', value: 'Gates open at 6:00 PM. Show starts at 8:00 PM.' });

    b.addBarcode({
      format: BarcodeFormat.QR,
      message: 'TKT-TS-2025-123456789',
      messageEncoding: 'iso-8859-1',
      altText: 'TKT-TS-2025-123456789',
    });

    b.setRelevantDate(new Date('2025-06-15T18:00:00'));
    b.addLocation({
      latitude: 33.9534,
      longitude: -118.3391,
      relevantText: 'Welcome to SoFi Stadium!',
    });

    b.setSemanticTags({
      eventName: 'Taylor Swift - Eras Tour',
      eventType: 'PKEventTypeLivePerformance',
      venueName: 'SoFi Stadium',
    });

    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  await generatePass('Full Featured Loyalty Card', (b) => {
    b.setPassType(PassType.StoreCard);
    b.setOrganization({
      organizationName: 'Starbucks',
      description: 'Starbucks Rewards',
      logoText: 'STARBUCKS',
    });
    b.setColors({
      backgroundColor: 'rgb(0, 112, 74)',
      foregroundColor: 'rgb(255, 255, 255)',
      labelColor: 'rgb(200, 255, 230)',
    });

    b.addHeaderField({ key: 'tier', label: 'TIER', value: 'Gold ★' });
    b.addPrimaryField({
      key: 'balance',
      label: 'BALANCE',
      value: 45.75,
      currencyCode: 'USD',
    });
    b.addSecondaryField({ key: 'stars', label: 'STARS', value: '425' });
    b.addSecondaryField({ key: 'member', label: 'MEMBER SINCE', value: '2020' });
    b.addAuxiliaryField({ key: 'rewards', label: 'REWARDS AVAILABLE', value: '2' });

    b.addBackField({ key: 'card', label: 'Card Number', value: '6041 5300 1234 5678' });
    b.addBackField({ key: 'website', label: 'Website', value: 'starbucks.com/rewards' });

    b.addBarcode({
      format: BarcodeFormat.PDF417,
      message: '6041530012345678',
      messageEncoding: 'iso-8859-1',
      altText: '6041 5300 1234 5678',
    });

    b.addLocation({ latitude: 37.7749, longitude: -122.4194 });
    b.addLocation({ latitude: 37.7858, longitude: -122.4064 });

    b.setWebService({
      webServiceURL: 'https://api.starbucks.com/passes/',
      authenticationToken: 'sbux_token_abc123',
    });

    b.setSemanticTags({
      balance: { amount: '45.75', currencyCode: 'USD' },
      membershipProgramName: 'Starbucks Rewards',
    });

    b.addImage({ type: PassImageType.Icon, data: ICONS.green });
  });

  await generatePass('Full Featured Boarding Pass', (b) => {
    b.setPassType(PassType.BoardingPass, TransitType.Air);
    b.setOrganization({
      organizationName: 'United Airlines',
      description: 'Boarding Pass',
      logoText: 'UNITED',
    });
    b.setColors({
      backgroundColor: 'rgb(0, 40, 87)',
      foregroundColor: 'rgb(255, 255, 255)',
      labelColor: 'rgb(180, 200, 230)',
    });

    b.addHeaderField({ key: 'gate', label: 'GATE', value: 'B22', changeMessage: 'Gate changed to %@' });
    b.addHeaderField({ key: 'zone', label: 'ZONE', value: '2' });
    b.addPrimaryField({ key: 'from', label: 'SAN FRANCISCO', value: 'SFO' });
    b.addPrimaryField({ key: 'to', label: 'NEW YORK', value: 'JFK' });
    b.addSecondaryField({ key: 'passenger', label: 'PASSENGER', value: 'DOE/JOHN MR' });
    b.addSecondaryField({ key: 'flight', label: 'FLIGHT', value: 'UA 123' });
    b.addAuxiliaryField({ key: 'departs', label: 'DEPARTS', value: '10:30 AM' });
    b.addAuxiliaryField({ key: 'seat', label: 'SEAT', value: '24A' });
    b.addAuxiliaryField({ key: 'class', label: 'CLASS', value: 'Economy Plus' });
    b.addAuxiliaryField({ key: 'boards', label: 'BOARDS', value: '10:00 AM' });

    b.addBackField({ key: 'confirmation', label: 'Confirmation', value: 'ABC123' });
    b.addBackField({ key: 'seq', label: 'Sequence', value: '025' });
    b.addBackField({ key: 'ffn', label: 'MileagePlus', value: 'AB123456' });
    b.addBackField({ key: 'terms', label: 'Important', value: 'Please arrive at gate 30 minutes before departure.' });

    b.addBarcode({
      format: BarcodeFormat.Aztec,
      message: 'M1DOE/JOHN MR       EABC123 SFOJFKUA 0123 025Y024A0002 100',
      messageEncoding: 'iso-8859-1',
    });

    b.setRelevantDate(new Date('2025-06-15T10:00:00'));
    b.addLocation({ latitude: 37.6213, longitude: -122.3790, relevantText: 'Your flight departs from Gate B22' });

    b.setSemanticTags({
      airlineCode: 'UA',
      flightCode: 'UA123',
      flightNumber: 123,
      departureAirportCode: 'SFO',
      departureAirportName: 'San Francisco International',
      destinationAirportCode: 'JFK',
      destinationAirportName: 'John F. Kennedy International',
      departureGate: 'B22',
      boardingGroup: '2',
      seats: [{ seatNumber: '24A', seatSection: 'Economy Plus' }],
      passengerName: { givenName: 'John', familyName: 'Doe' },
      confirmationNumber: 'ABC123',
    });

    b.addImage({ type: PassImageType.Icon, data: ICONS.blue });
  });

  await generatePass('Minimal Valid Pass', (b) => {
    b.setPassType(PassType.Generic);
    b.setOrganization({ organizationName: 'Minimal', description: 'Minimal Pass' });
    b.addImage({ type: PassImageType.Icon, data: ICONS.white });
  });

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n' + '='.repeat(50));
  console.log(`RESULTS: ${successCount}/${passCount} passes generated successfully`);
  if (failCount > 0) {
    console.log(`         ${failCount} failures`);
  }
  console.log(`\nOutput directory: ${OUTPUT_DIR}`);
  console.log('\nTo test passes:');
  console.log('  1. AirDrop individual .pkpass files to your iPhone');
  console.log('  2. Or open them with: open test-passes/*.pkpass');
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
