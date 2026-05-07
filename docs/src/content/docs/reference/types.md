---
title: TypeScript Types
description: Complete TypeScript type definitions for PassKite
---

This page documents all TypeScript types exported by PassKite.

## Core Types

### PassData

The complete pass data structure matching Apple's PassKit format.

```typescript
interface PassData {
  // Required
  formatVersion: 1;
  passTypeIdentifier: string;
  serialNumber: string;
  teamIdentifier: string;
  organizationName: string;
  description: string;

  // Optional metadata
  logoText?: string;
  associatedStoreIdentifiers?: number[];
  appLaunchURL?: string;
  userInfo?: Record<string, unknown>;
  expirationDate?: string;       // ISO 8601 date
  voided?: boolean;
  groupingIdentifier?: string;
  suppressStripShine?: boolean;
  maxDistance?: number;
  semantics?: PassSemantics;

  // Appearance
  backgroundColor?: string;      // 'rgb(r, g, b)'
  foregroundColor?: string;
  labelColor?: string;

  // Web service
  authenticationToken?: string;
  webServiceURL?: string;

  // Barcodes
  barcodes?: Barcode[];
  barcode?: Barcode;            // Legacy single barcode

  // Locations and beacons
  locations?: PassLocation[];
  beacons?: PassBeacon[];
  relevantDate?: string;        // ISO 8601 date

  // NFC
  nfc?: {
    message: string;
    encryptionPublicKey?: string;
  };

  // Pass type structure (exactly one required)
  boardingPass?: PassStructure;
  coupon?: PassStructure;
  eventTicket?: PassStructure;
  storeCard?: PassStructure;
  generic?: PassStructure;
}
```

### PassStructure

The field structure for a pass type.

```typescript
interface PassStructure {
  headerFields?: PassField[];
  primaryFields?: PassField[];
  secondaryFields?: PassField[];
  auxiliaryFields?: PassField[];
  backFields?: PassField[];

  // Boarding pass specific
  transitType?: TransitType;
}
```

### PassField

Individual field on a pass.

```typescript
interface PassField {
  // Required
  key: string;                    // Unique identifier for the field
  value: string | number | Date;  // The field's value

  // Optional display
  label?: string;                 // Label shown above the value
  attributedValue?: string;       // HTML attributed string
  changeMessage?: string;         // %@ is replaced with new value

  // Formatting
  textAlignment?: TextAlignment;
  dateStyle?: DateStyle;
  timeStyle?: TimeStyle;
  isRelative?: boolean;           // For date fields
  ignoresTimeZone?: boolean;      // For date fields
  numberStyle?: NumberStyle;
  currencyCode?: string;          // ISO 4217 currency code

  // Data detectors
  dataDetectorTypes?: DataDetectorType[];

  // Semantics
  semantics?: FieldSemantics;

  // Personalization
  row?: number;                   // Row number for multi-row layouts
}
```

### Barcode

Barcode configuration.

```typescript
interface Barcode {
  format: BarcodeFormat;
  message: string;
  messageEncoding?: string;       // Default: 'iso-8859-1'
  altText?: string;               // Text below barcode
}
```

### PassLocation

Location for relevance.

```typescript
interface PassLocation {
  latitude: number;               // -90 to 90
  longitude: number;              // -180 to 180
  altitude?: number;              // Meters
  relevantText?: string;          // Lock screen message
}
```

### PassBeacon

iBeacon for relevance.

```typescript
interface PassBeacon {
  proximityUUID: string;          // UUID string
  major?: number;                 // 0-65535
  minor?: number;                 // 0-65535
  relevantText?: string;          // Lock screen message
}
```

---

## Image Types

### PassImage

Image configuration for adding to a pass.

```typescript
interface PassImage {
  type: PassImageType;
  data: Buffer;                   // Image data
  scale?: 1 | 2 | 3;             // Retina scale
  locale?: string;                // Localization code
}
```

### PassImageType

```typescript
enum PassImageType {
  Icon = 'icon',           // 29x29 pt, required
  Logo = 'logo',           // 160x50 pt max
  Strip = 'strip',         // 375x123 pt
  Background = 'background', // 180x220 pt
  Thumbnail = 'thumbnail', // 90x90 pt
  Footer = 'footer',       // 286x15 pt
}
```

### Image Size Reference

| Type | @1x | @2x | @3x |
|------|-----|-----|-----|
| Icon | 29x29 | 58x58 | 87x87 |
| Logo | 160x50 | 320x100 | 480x150 |
| Strip | 375x123 | 750x246 | 1125x369 |
| Background | 180x220 | 360x440 | 540x660 |
| Thumbnail | 90x90 | 180x180 | 270x270 |
| Footer | 286x15 | 572x30 | 858x45 |

---

## Signing Types

### SigningCredentials

Credentials for signing passes.

```typescript
interface SigningCredentials {
  wwdrCertificate?: string;       // WWDR G4 PEM (embedded by default)
  signerCertificate: string;      // Pass Type ID certificate PEM
  signerKey: string;              // Private key PEM
  signerKeyPassphrase?: string;   // If private key is encrypted
}
```

---

## Wallet Types

### WalletResult

Result from wallet operations.

```typescript
interface WalletResult {
  success: boolean;
  error?: string;
}
```

### WalletPassPayload

Explicit platform-specific payload accepted by `addPassToWallet`.

```typescript
type WalletPassPayload =
  | { type: 'apple-wallet'; passBase64: string }
  | { type: 'google-wallet'; jwt: string };
```

### PassEvent

Event data for pass lifecycle events.

```typescript
interface PassEvent {
  passTypeIdentifier: string;
  serialNumber: string;
}
```

### Subscription

Event subscription handle.

```typescript
interface Subscription {
  remove(): void;
}
```

---

## Enums

### PassType

```typescript
enum PassType {
  BoardingPass = 'boardingPass',
  Coupon = 'coupon',
  EventTicket = 'eventTicket',
  StoreCard = 'storeCard',
  Generic = 'generic',
}
```

### TransitType

```typescript
enum TransitType {
  Air = 'PKTransitTypeAir',
  Boat = 'PKTransitTypeBoat',
  Bus = 'PKTransitTypeBus',
  Train = 'PKTransitTypeTrain',
  Generic = 'PKTransitTypeGeneric',
}
```

### BarcodeFormat

```typescript
enum BarcodeFormat {
  QR = 'PKBarcodeFormatQR',
  PDF417 = 'PKBarcodeFormatPDF417',
  Aztec = 'PKBarcodeFormatAztec',
  Code128 = 'PKBarcodeFormatCode128',
}
```

### TextAlignment

```typescript
enum TextAlignment {
  Left = 'PKTextAlignmentLeft',
  Center = 'PKTextAlignmentCenter',
  Right = 'PKTextAlignmentRight',
  Natural = 'PKTextAlignmentNatural',
}
```

### DateStyle

```typescript
enum DateStyle {
  None = 'PKDateStyleNone',
  Short = 'PKDateStyleShort',
  Medium = 'PKDateStyleMedium',
  Long = 'PKDateStyleLong',
  Full = 'PKDateStyleFull',
}
```

### TimeStyle

```typescript
enum TimeStyle {
  None = 'PKTimeStyleNone',
  Short = 'PKTimeStyleShort',
  Medium = 'PKTimeStyleMedium',
  Long = 'PKTimeStyleLong',
  Full = 'PKTimeStyleFull',
}
```

### NumberStyle

```typescript
enum NumberStyle {
  Decimal = 'PKNumberStyleDecimal',
  Percent = 'PKNumberStylePercent',
  Scientific = 'PKNumberStyleScientific',
  SpellOut = 'PKNumberStyleSpellOut',
}
```

### DataDetectorType

```typescript
enum DataDetectorType {
  PhoneNumber = 'PKDataDetectorTypePhoneNumber',
  Link = 'PKDataDetectorTypeLink',
  Address = 'PKDataDetectorTypeAddress',
  CalendarEvent = 'PKDataDetectorTypeCalendarEvent',
}
```

---

## Personalization Types

### PersonalizationConfig

Configuration for personalized passes.

```typescript
interface PersonalizationConfig {
  requiredPersonalizationFields: PersonalizationField[];
  description: string;
  termsAndConditions?: string;
}
```

### PersonalizationField

```typescript
enum PersonalizationField {
  Name = 'PKPassPersonalizationFieldName',
  PostalCode = 'PKPassPersonalizationFieldPostalCode',
  EmailAddress = 'PKPassPersonalizationFieldEmailAddress',
  PhoneNumber = 'PKPassPersonalizationFieldPhoneNumber',
}
```

---

## Semantic Types

PassKite supports Apple's semantic tags for enhanced Siri and system integration.

### PassSemantics

```typescript
interface PassSemantics {
  // Event
  eventName?: string;
  venueName?: string;
  venueLocation?: SemanticLocation;
  eventStartDate?: string;
  eventEndDate?: string;

  // Travel
  departureLocation?: SemanticLocation;
  arrivalLocation?: SemanticLocation;
  departureDate?: string;
  arrivalDate?: string;
  transitProvider?: string;
  vehicleName?: string;
  vehicleNumber?: string;

  // Seats
  seats?: SemanticSeat[];

  // Balance
  balance?: SemanticBalance;

  // Membership
  membershipProgramName?: string;
  membershipProgramNumber?: string;
}
```

### SemanticLocation

```typescript
interface SemanticLocation {
  latitude: number;
  longitude: number;
}
```

### SemanticSeat

```typescript
interface SemanticSeat {
  seatNumber?: string;
  seatRow?: string;
  seatSection?: string;
  seatType?: string;
}
```

### SemanticBalance

```typescript
interface SemanticBalance {
  currencyAmount?: SemanticCurrencyAmount;
  loyaltyPointsAmount?: number;
}
```

### SemanticCurrencyAmount

```typescript
interface SemanticCurrencyAmount {
  amount: string;
  currencyCode: string;   // ISO 4217
}
```
