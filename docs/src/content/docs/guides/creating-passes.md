---
title: Creating Passes
description: Learn how to create and customize Apple Wallet passes
---

PassKite provides a fluent builder API for creating passes. This guide covers the complete pass creation process.

:::caution[Runs on the server]
Everything in this guide imports from `expo-passkite/server` and depends on Node-only APIs (`node-forge`, `jszip`, `node:fs`). Run pass generation on your backend and ship the resulting `.pkpass` (or its base64 form) to the device, where you can use [`addPassToWallet`](../wallet-integration/) from `expo-passkite`.
:::

## Pass Builder Overview

The `createPassBuilder()` function returns a builder that lets you configure every aspect of your pass:

```typescript
import { createPassBuilder, PassType } from 'expo-passkite/server';

const builder = createPassBuilder()
  .setIdentifiers({ /* ... */ })
  .setOrganization({ /* ... */ })
  .setPassType(PassType.StoreCard)
  .setColors({ /* ... */ })
  .addPrimaryField({ /* ... */ })
  .addBarcode({ /* ... */ });

const { passData, images } = builder.build();
```

## Required Configuration

### Identifiers

Every pass must have unique identifiers:

```typescript
builder.setIdentifiers({
  passTypeIdentifier: 'pass.com.example.myapp',  // Your Pass Type ID
  serialNumber: 'UNIQUE-ID-001',                  // Unique per pass
  teamIdentifier: 'ABCD123456',                   // Your Apple Team ID
});
```

### Organization Info

```typescript
builder.setOrganization({
  organizationName: 'Your Company',      // Required
  description: 'Loyalty Card',           // Required
  logoText: 'Your Brand',                // Optional, shown next to logo
});
```

### Pass Type

```typescript
import { PassType } from 'expo-passkite/server';

builder.setPassType(PassType.StoreCard);

// Available types:
// PassType.BoardingPass
// PassType.Coupon
// PassType.EventTicket
// PassType.StoreCard
// PassType.Generic
```

## Customizing Appearance

### Colors

```typescript
builder.setColors({
  backgroundColor: 'rgb(206, 140, 53)',  // Pass background
  foregroundColor: 'rgb(255, 255, 255)', // Text color
  labelColor: 'rgb(200, 200, 200)',      // Label text color (optional)
});
```

### Images

Pass images are added after creating the pass instance:

```typescript
import { createPass, PassImageType } from 'expo-passkite/server';

const { passData, images } = builder.build();
const pass = createPass(passData, images);

// Required: Icon (29x29 pt)
pass.addImage({
  type: PassImageType.Icon,
  data: iconBuffer,
});

// Optional images
pass.addImage({
  type: PassImageType.Logo,
  data: logoBuffer,
});

pass.addImage({
  type: PassImageType.Strip,
  data: stripBuffer,
});
```

#### Image Types and Sizes

| Type | Size | Usage |
|------|------|-------|
| `Icon` | 29x29 pt | **Required**. Shown in notifications |
| `Logo` | 160x50 pt max | Header area |
| `Strip` | 375x123 pt | Below header (event tickets, coupons) |
| `Background` | 180x220 pt | Full pass background |
| `Thumbnail` | 90x90 pt | Event tickets |
| `Footer` | 286x15 pt | Bottom of pass |

:::tip
Provide @2x and @3x versions for retina displays by calling `addImage` multiple times with different scale data.
:::

## Adding Fields

### Primary Fields

The most prominent information on the pass:

```typescript
builder.addPrimaryField({
  key: 'balance',        // Unique identifier
  label: 'BALANCE',      // Label text
  value: '$50.00',       // Display value
});
```

### Secondary Fields

```typescript
builder.addSecondaryField({
  key: 'member',
  label: 'MEMBER',
  value: 'John Doe',
});
```

### Auxiliary Fields

```typescript
builder.addAuxiliaryField({
  key: 'level',
  label: 'LEVEL',
  value: 'Gold',
});
```

### Header Fields

Small fields in the top right:

```typescript
builder.addHeaderField({
  key: 'gate',
  label: 'GATE',
  value: 'A12',
});
```

### Back Fields

Shown when the pass is flipped:

```typescript
builder.addBackField({
  key: 'terms',
  label: 'Terms & Conditions',
  value: 'Full terms and conditions text...',
});
```

## Adding Barcodes

```typescript
import { BarcodeFormat } from 'expo-passkite/server';

// QR Code
builder.addBarcode({
  format: BarcodeFormat.QR,
  message: 'https://example.com/verify/CARD-001',
  altText: 'CARD-001',  // Text below barcode
});

// Multiple barcodes (first supported format is used)
builder.addBarcode({
  format: BarcodeFormat.PDF417,
  message: 'PDF417-encoded-data',
});

// Available formats:
// BarcodeFormat.QR
// BarcodeFormat.PDF417
// BarcodeFormat.Aztec
// BarcodeFormat.Code128
```

## Pass Behavior

### Relevance

Control when the pass appears on lock screen:

```typescript
// Location-based relevance
builder.setLocations([
  {
    latitude: 37.7749,
    longitude: -122.4194,
    altitude: 0,
    relevantText: 'Welcome to our store!',
  },
]);

// Time-based relevance
builder.setRelevantDate(new Date('2024-12-25T10:00:00'));

// iBeacon relevance
builder.setBeacons([
  {
    proximityUUID: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
    major: 100,
    minor: 1,
    relevantText: 'You\'re near our beacon!',
  },
]);
```

### Expiration

```typescript
builder.setExpirationDate(new Date('2025-12-31T23:59:59'));
```

### Voiding

```typescript
builder.setVoided(true);  // Gray out the pass
```

### Web Service

Enable pass updates via a web service:

```typescript
builder.setWebService({
  authenticationToken: 'vxwxd7J8AlNNFPS8k0a0FfUFtq0ewzFdc',
  webServiceURL: 'https://example.com/passes/',
});
```

## Complete Example

```typescript
import {
  createPassBuilder,
  createPass,
  PassType,
  BarcodeFormat,
  PassImageType,
} from 'expo-passkite/server';

const builder = createPassBuilder()
  // Required identifiers
  .setIdentifiers({
    passTypeIdentifier: 'pass.com.example.coffee',
    serialNumber: `CARD-${Date.now()}`,
    teamIdentifier: 'ABCD123456',
  })
  // Organization
  .setOrganization({
    organizationName: 'Coffee House',
    description: 'Rewards Card',
    logoText: 'Coffee House',
  })
  // Pass type
  .setPassType(PassType.StoreCard)
  // Appearance
  .setColors({
    backgroundColor: 'rgb(139, 69, 19)',
    foregroundColor: 'rgb(255, 255, 255)',
    labelColor: 'rgb(220, 200, 180)',
  })
  // Fields
  .addPrimaryField({
    key: 'points',
    label: 'POINTS',
    value: '500',
  })
  .addSecondaryField({
    key: 'name',
    label: 'MEMBER',
    value: 'Jane Smith',
  })
  .addAuxiliaryField({
    key: 'level',
    label: 'STATUS',
    value: 'Gold Member',
  })
  .addBackField({
    key: 'terms',
    label: 'Terms',
    value: 'Points expire after 12 months of inactivity.',
  })
  // Barcode
  .addBarcode({
    format: BarcodeFormat.QR,
    message: 'https://coffee.example.com/card/500',
    altText: 'Scan for rewards',
  });

// Build and create
const { passData, images } = builder.build();
const pass = createPass(passData, images);

// Add images
pass.addImage({ type: PassImageType.Icon, data: iconBuffer });
pass.addImage({ type: PassImageType.Logo, data: logoBuffer });
pass.addImage({ type: PassImageType.Strip, data: stripBuffer });

// Sign
pass.setSigningCredentials({
  signerCertificate: certPem,
  signerKey: keyPem,
});

// Generate
const pkpassBase64 = await pass.generateBase64();
```

## Next Steps

- Learn about specific [Pass Types](/expo-passkite/guides/pass-types/)
- Add passes to wallet with [Wallet Integration](/expo-passkite/guides/wallet-integration/)
- See the full [API Reference](/expo-passkite/reference/api/)
