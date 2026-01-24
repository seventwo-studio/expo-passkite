---
title: API Reference
description: Complete API reference for PassKite
---

This page documents all exported functions, types, and constants from PassKite.

## Pass Generation

### createPassBuilder()

Creates a new `PassBuilder` instance for constructing pass data.

```typescript
function createPassBuilder(): PassBuilder;
```

**Returns:** A `PassBuilder` instance with chainable methods.

**Example:**
```typescript
const builder = createPassBuilder()
  .setIdentifiers({ /* ... */ })
  .setPassType(PassType.StoreCard);
```

---

### PassBuilder

The builder class for constructing pass data. All methods return `this` for chaining.

#### setIdentifiers(identifiers)

Sets required pass identifiers.

```typescript
setIdentifiers(identifiers: {
  passTypeIdentifier: string;  // Your Pass Type ID (e.g., 'pass.com.example.app')
  serialNumber: string;        // Unique identifier for this pass
  teamIdentifier: string;      // Your Apple Developer Team ID
}): PassBuilder;
```

#### setOrganization(org)

Sets organization information.

```typescript
setOrganization(org: {
  organizationName: string;    // Company or organization name
  description: string;         // Brief pass description
  logoText?: string;           // Text displayed next to logo
}): PassBuilder;
```

#### setPassType(type)

Sets the type of pass.

```typescript
setPassType(type: PassType): PassBuilder;
```

See [PassType](#passtype) enum for available values.

#### setTransitType(type)

Sets the transit type for boarding passes.

```typescript
setTransitType(type: TransitType): PassBuilder;
```

See [TransitType](#transittype) enum for available values.

#### setColors(colors)

Sets pass appearance colors.

```typescript
setColors(colors: {
  backgroundColor?: string;    // RGB string, e.g., 'rgb(255, 255, 255)'
  foregroundColor?: string;    // Text color
  labelColor?: string;         // Label text color
}): PassBuilder;
```

#### addPrimaryField(field)

Adds a primary field (most prominent).

```typescript
addPrimaryField(field: PassField): PassBuilder;
```

#### addSecondaryField(field)

Adds a secondary field.

```typescript
addSecondaryField(field: PassField): PassBuilder;
```

#### addAuxiliaryField(field)

Adds an auxiliary field.

```typescript
addAuxiliaryField(field: PassField): PassBuilder;
```

#### addHeaderField(field)

Adds a header field (top right area).

```typescript
addHeaderField(field: PassField): PassBuilder;
```

#### addBackField(field)

Adds a back field (shown when pass is flipped).

```typescript
addBackField(field: PassField): PassBuilder;
```

#### addBarcode(barcode)

Adds a barcode to the pass.

```typescript
addBarcode(barcode: {
  format: BarcodeFormat;       // Barcode type
  message: string;             // Barcode content
  messageEncoding?: string;    // Default: 'iso-8859-1'
  altText?: string;            // Text displayed below barcode
}): PassBuilder;
```

#### setLocations(locations)

Sets location-based relevance triggers.

```typescript
setLocations(locations: Array<{
  latitude: number;
  longitude: number;
  altitude?: number;
  relevantText?: string;       // Shown on lock screen when nearby
}>): PassBuilder;
```

#### setBeacons(beacons)

Sets iBeacon-based relevance triggers.

```typescript
setBeacons(beacons: Array<{
  proximityUUID: string;
  major?: number;
  minor?: number;
  relevantText?: string;
}>): PassBuilder;
```

#### setRelevantDate(date)

Sets time-based relevance.

```typescript
setRelevantDate(date: Date): PassBuilder;
```

#### setExpirationDate(date)

Sets when the pass expires.

```typescript
setExpirationDate(date: Date): PassBuilder;
```

#### setVoided(voided)

Marks the pass as voided (grayed out).

```typescript
setVoided(voided: boolean): PassBuilder;
```

#### setWebService(config)

Configures web service for pass updates.

```typescript
setWebService(config: {
  authenticationToken: string; // Token for authenticating with your server
  webServiceURL: string;       // Base URL for pass updates
}): PassBuilder;
```

#### setNFC(nfc)

Configures NFC payload.

```typescript
setNFC(nfc: {
  message: string;             // NFC payload
  encryptionPublicKey?: string;
}): PassBuilder;
```

#### build()

Builds the final pass data.

```typescript
build(): {
  passData: PassData;
  images: Map<PassImageType, Buffer>;
};
```

---

### createPass(passData, images, personalization?)

Creates a `Pass` instance for signing and generation.

```typescript
function createPass(
  passData: PassData,
  images?: Map<PassImageType, Buffer>,
  personalization?: PersonalizationConfig
): Pass;
```

**Parameters:**
- `passData` - The pass data from `builder.build()`
- `images` - Optional initial images
- `personalization` - Optional personalization configuration

**Returns:** A `Pass` instance.

---

### Pass

The class for signing and generating passes.

#### setSigningCredentials(credentials)

Sets the certificates for signing the pass.

```typescript
setSigningCredentials(credentials: {
  wwdrCertificate?: string;      // WWDR cert PEM (optional, embedded by default)
  signerCertificate: string;     // Your Pass Type ID cert PEM
  signerKey: string;             // Private key PEM
  signerKeyPassphrase?: string;  // If key is encrypted
}): void;
```

#### addImage(image)

Adds an image to the pass.

```typescript
addImage(image: {
  type: PassImageType;
  data: Buffer;
  scale?: 1 | 2 | 3;           // Default: 1
  locale?: string;             // For localized images
}): void;
```

#### generate()

Generates the `.pkpass` file as a Buffer.

```typescript
generate(): Promise<Buffer>;
```

#### generateBase64()

Generates the `.pkpass` file as a base64 string.

```typescript
generateBase64(): Promise<string>;
```

---

## Wallet Integration

### addPassToWallet(passData)

Adds a pass to the device wallet.

```typescript
function addPassToWallet(passData: string): Promise<{
  success: boolean;
  error?: string;
}>;
```

**Parameters:**
- `passData` - Base64-encoded `.pkpass` file (iOS) or JWT token (Android)

**Returns:** Promise resolving to result object.

**Error codes:**
- `PASS_LIBRARY_NOT_AVAILABLE` - Wallet not available
- `INVALID_PASS_DATA` - Malformed pass data
- `USER_CANCELLED` - User dismissed dialog
- `PASS_ALREADY_EXISTS` - Pass already in wallet

---

### canAddPasses()

Checks if passes can be added to the wallet.

```typescript
function canAddPasses(): Promise<boolean>;
```

---

### isPassLibraryAvailable()

Checks if the PassKit library is available.

```typescript
function isPassLibraryAvailable(): Promise<boolean>;
```

---

### containsPass(passTypeIdentifier, serialNumber)

Checks if a specific pass exists in the wallet.

```typescript
function containsPass(
  passTypeIdentifier: string,
  serialNumber: string
): Promise<boolean>;
```

---

### onPassAdded(callback)

Subscribes to pass added events.

```typescript
function onPassAdded(callback: (event: PassEvent) => void): Subscription;
```

**Returns:** Subscription object with `remove()` method.

---

### onPassRemoved(callback)

Subscribes to pass removed events.

```typescript
function onPassRemoved(callback: (event: PassEvent) => void): Subscription;
```

**Returns:** Subscription object with `remove()` method.

---

## Types

### PassField

```typescript
interface PassField {
  key: string;                   // Unique identifier
  label?: string;                // Display label
  value: string | number;        // Display value
  attributedValue?: string;      // HTML-formatted value
  changeMessage?: string;        // Message when value changes
  textAlignment?: TextAlignment;
  dateStyle?: DateStyle;
  timeStyle?: TimeStyle;
  numberStyle?: NumberStyle;
  currencyCode?: string;
}
```

### PassEvent

```typescript
interface PassEvent {
  passTypeIdentifier: string;
  serialNumber: string;
}
```

### Subscription

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

### PassImageType

```typescript
enum PassImageType {
  Icon = 'icon',
  Logo = 'logo',
  Strip = 'strip',
  Background = 'background',
  Thumbnail = 'thumbnail',
  Footer = 'footer',
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

---

## Config Plugin

### withPasskite

Expo config plugin for automatic iOS configuration.

```typescript
function withPasskite(
  config: ExpoConfig,
  options: {
    passTypeIdentifiers: string[];
  }
): ExpoConfig;
```

**Usage in app.json:**

```json
{
  "expo": {
    "plugins": [
      ["expo-passkite", {
        "passTypeIdentifiers": [
          "$(TeamIdentifierPrefix)pass.com.example.app"
        ]
      }]
    ]
  }
}
```

This configures the `com.apple.developer.pass-type-identifiers` entitlement in your iOS project.
