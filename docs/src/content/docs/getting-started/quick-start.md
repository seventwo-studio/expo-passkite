---
title: Quick Start
description: Create and add your first Apple Wallet pass
---

This guide will walk you through creating and adding your first pass to Apple Wallet.

## Prerequisites

Before you begin, make sure you have:

1. [Installed PassKite](/expo-passkite/getting-started/installation/)
2. [Set up your signing credentials](/expo-passkite/guides/setup-credentials/)

## Create a Simple Store Card

```typescript
import {
  createPassBuilder,
  createPass,
  PassType,
  BarcodeFormat,
  PassImageType,
  addPassToWallet,
  canAddPasses,
} from 'expo-passkite';

// Your signing credentials (see Setup Credentials guide)
const signingCredentials = {
  signerCertificate: SIGNER_CERT_PEM,
  signerKey: SIGNER_KEY_PEM,
  signerKeyPassphrase: 'your-passphrase', // if key is encrypted
};

async function createMyPass() {
  // 1. Build the pass data
  const builder = createPassBuilder()
    .setIdentifiers({
      passTypeIdentifier: 'pass.com.example.myapp',
      serialNumber: 'CARD-001',
      teamIdentifier: 'YOUR_TEAM_ID',
    })
    .setOrganization({
      organizationName: 'Coffee Shop',
      description: 'Loyalty Card',
      logoText: 'Coffee Shop',
    })
    .setPassType(PassType.StoreCard)
    .setColors({
      backgroundColor: 'rgb(139, 69, 19)',
      foregroundColor: 'rgb(255, 255, 255)',
    })
    .addPrimaryField({
      key: 'points',
      label: 'POINTS',
      value: '250',
    })
    .addSecondaryField({
      key: 'name',
      label: 'MEMBER',
      value: 'John Doe',
    })
    .addBarcode({
      format: BarcodeFormat.QR,
      message: 'https://example.com/card/CARD-001',
      altText: 'CARD-001',
    });

  const { passData, images } = builder.build();

  // 2. Create the pass instance
  const pass = createPass(passData, images);

  // 3. Add images (icon is required)
  // You'll need to load your images as Buffers
  pass.addImage({
    type: PassImageType.Icon,
    data: iconImageBuffer,
  });
  pass.addImage({
    type: PassImageType.Logo,
    data: logoImageBuffer,
  });

  // 4. Set signing credentials
  pass.setSigningCredentials(signingCredentials);

  // 5. Generate the pass
  const passBase64 = await pass.generateBase64();

  // 6. Add to wallet
  if (await canAddPasses()) {
    const result = await addPassToWallet(passBase64);
    if (result.success) {
      console.log('Pass added successfully!');
    } else {
      console.error('Failed:', result.error);
    }
  }
}
```

## Loading Images

Pass images need to be provided as Buffers. Here's how to load them:

```typescript
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

async function loadImage(assetPath: string): Promise<Buffer> {
  const base64 = await FileSystem.readAsStringAsync(assetPath, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return Buffer.from(base64, 'base64');
}

// Usage
const iconBuffer = await loadImage(Asset.fromModule(require('./assets/icon.png')).localUri);
```

## Required Images

Every pass must have at least an **icon** image:

| Image | Size | Required |
|-------|------|----------|
| Icon | 29x29 pt | Yes |
| Icon @2x | 58x58 pt | Recommended |
| Icon @3x | 87x87 pt | Recommended |
| Logo | 160x50 pt max | Optional |
| Strip | 375x123 pt | Optional |
| Background | 180x220 pt | Optional |

## Listening for Events

Track when passes are added or removed:

```typescript
import { onPassAdded, onPassRemoved } from 'expo-passkite';

// Subscribe to events
const addedSub = onPassAdded((event) => {
  console.log('Pass added:', event.passTypeIdentifier, event.serialNumber);
});

const removedSub = onPassRemoved((event) => {
  console.log('Pass removed:', event.passTypeIdentifier, event.serialNumber);
});

// Clean up when done
addedSub.remove();
removedSub.remove();
```

## Next Steps

- Learn about different [Pass Types](/expo-passkite/guides/pass-types/)
- Explore [Creating Passes](/expo-passkite/guides/creating-passes/) in depth
- Check the [API Reference](/expo-passkite/reference/api/)
