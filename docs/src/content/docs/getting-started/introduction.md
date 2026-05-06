---
title: Introduction
description: Learn about PassKite and what it can do for your app
---

PassKite is an Expo/React Native library for generating Apple Wallet passes (`.pkpass` files) and adding them directly to iOS Wallet or Google Wallet.

## What is PassKite?

PassKite provides:

- **Pass Generation**: Create valid Apple Wallet passes entirely in JavaScript/TypeScript
- **Fluent Builder API**: Intuitive API for building passes with type safety
- **Native Wallet Integration**: Add passes to iOS Wallet directly from your app
- **Expo Config Plugin**: Automatic iOS entitlements configuration
- **Cross-Platform Support**: iOS Wallet native support, Google Wallet via JWT

## Use Cases

PassKite is perfect for:

- **Loyalty Programs**: Store cards with points, balances, and rewards
- **Event Tickets**: Concert tickets, movie passes, sports events
- **Boarding Passes**: Airlines, trains, buses, ferries
- **Coupons**: Promotional offers and discounts
- **Membership Cards**: Gym memberships, club cards, ID badges

## How It Works

1. **Build your pass** using the fluent builder API
2. **Sign the pass** with your Apple Pass Type ID certificate
3. **Generate** the `.pkpass` file as a base64 string
4. **Add to Wallet** using the native module

Pass generation runs on a server (`expo-passkite/server`); the client only adds the resulting base64 to the wallet (`expo-passkite`).

```typescript
// --- on your server ---
import { createPassBuilder, createPass, PassType } from 'expo-passkite/server';

const builder = createPassBuilder()
  .setIdentifiers({ /* ... */ })
  .setPassType(PassType.StoreCard);

const pass = createPass(builder.build().passData);
pass.setSigningCredentials({ /* ... */ });
const base64 = await pass.generateBase64();
// send `base64` to the client over your API

// --- on the device ---
import { addPassToWallet } from 'expo-passkite';

await addPassToWallet(base64);
```

## Requirements

- **Expo SDK 52+** or React Native 0.76+
- **Apple Developer Program** membership (for pass signing)
- **iOS 15+** for wallet integration

## Next Steps

Ready to get started? Head to the [Installation](/expo-passkite/getting-started/installation/) guide.
