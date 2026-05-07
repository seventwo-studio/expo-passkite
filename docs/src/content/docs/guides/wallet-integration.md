---
title: Wallet Integration
description: Add passes to iOS Wallet and listen for events
---

PassKite provides native iOS integration for adding passes to Apple Wallet and tracking pass events.

## Checking Availability

Before attempting to add a pass, check if the wallet is available:

```typescript
import { isPassLibraryAvailable, canAddPasses } from 'expo-passkite';

// Check if PassKit is available on this device
const available = await isPassLibraryAvailable();

// Check if passes can be added (not restricted by MDM, etc.)
const canAdd = await canAddPasses();

if (!available) {
  console.log('Wallet not available on this device');
} else if (!canAdd) {
  console.log('Adding passes is restricted');
} else {
  console.log('Ready to add passes!');
}
```

## Adding a Pass

```typescript
import { addPassToWallet } from 'expo-passkite';

// Generate your pass as base64
const passBase64 = await pass.generateBase64();

// Add to wallet
const result = await addPassToWallet(passBase64);

if (result.success) {
  console.log('Pass added successfully!');
} else {
  console.error('Failed to add pass:', result.error);
}
```

### Error Handling

```typescript
const result = await addPassToWallet(passBase64);

if (!result.success) {
  switch (result.error) {
    case 'PASS_LIBRARY_NOT_AVAILABLE':
      // Wallet not available on device
      break;
    case 'INVALID_PASS_DATA':
      // The pass data is malformed
      break;
    case 'USER_CANCELLED':
      // User dismissed the add pass dialog
      break;
    case 'PASS_ALREADY_EXISTS':
      // This exact pass is already in wallet
      break;
    default:
      // Other error
      console.error('Unknown error:', result.error);
  }
}
```

## Checking for Existing Passes

Check if a specific pass is already in the user's wallet:

```typescript
import { containsPass } from 'expo-passkite';

const exists = await containsPass(
  'pass.com.example.myapp',  // Pass Type ID
  'CARD-001'                  // Serial Number
);

if (exists) {
  console.log('Pass already in wallet');
} else {
  console.log('Pass not in wallet');
}
```

## Listening for Events

Subscribe to pass lifecycle events:

```typescript
import { onPassAdded, onPassRemoved } from 'expo-passkite';

// When a pass is added to wallet
const addedSubscription = onPassAdded((event) => {
  console.log('Pass added:', {
    passTypeIdentifier: event.passTypeIdentifier,
    serialNumber: event.serialNumber,
  });

  // Maybe sync with your backend
  await api.markPassAsActive(event.serialNumber);
});

// When a pass is removed from wallet
const removedSubscription = onPassRemoved((event) => {
  console.log('Pass removed:', {
    passTypeIdentifier: event.passTypeIdentifier,
    serialNumber: event.serialNumber,
  });

  // Maybe sync with your backend
  await api.markPassAsRemoved(event.serialNumber);
});

// Clean up subscriptions when component unmounts
return () => {
  addedSubscription.remove();
  removedSubscription.remove();
};
```

### React Hook Example

```typescript
import { useEffect, useState } from 'react';
import { onPassAdded, onPassRemoved, containsPass } from 'expo-passkite';

function usePassStatus(passTypeId: string, serialNumber: string) {
  const [isInWallet, setIsInWallet] = useState(false);

  useEffect(() => {
    // Check initial status
    containsPass(passTypeId, serialNumber).then(setIsInWallet);

    // Listen for changes
    const addedSub = onPassAdded((event) => {
      if (event.passTypeIdentifier === passTypeId &&
          event.serialNumber === serialNumber) {
        setIsInWallet(true);
      }
    });

    const removedSub = onPassRemoved((event) => {
      if (event.passTypeIdentifier === passTypeId &&
          event.serialNumber === serialNumber) {
        setIsInWallet(false);
      }
    });

    return () => {
      addedSub.remove();
      removedSub.remove();
    };
  }, [passTypeId, serialNumber]);

  return isInWallet;
}

// Usage
function MyComponent() {
  const isInWallet = usePassStatus('pass.com.example.myapp', 'CARD-001');

  return (
    <Button
      title={isInWallet ? 'View in Wallet' : 'Add to Wallet'}
      onPress={handlePress}
    />
  );
}
```

## Complete Integration Example

```typescript
import React, { useState, useEffect } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import {
  addPassToWallet,
  canAddPasses,
  containsPass,
  onPassAdded,
  onPassRemoved,
} from 'expo-passkite';
// In a real app, the createPass/createPassBuilder calls below would run on
// your backend — they are imported from `expo-passkite/server` because they
// pull in node-forge and other Node-only dependencies.
import { createPassBuilder, createPass, PassType } from 'expo-passkite/server';

const PASS_TYPE_ID = 'pass.com.example.myapp';
const SERIAL_NUMBER = 'CARD-001';

export function WalletCard() {
  const [isInWallet, setIsInWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check initial status
    containsPass(PASS_TYPE_ID, SERIAL_NUMBER).then(setIsInWallet);

    // Subscribe to events
    const addedSub = onPassAdded((e) => {
      if (e.serialNumber === SERIAL_NUMBER) setIsInWallet(true);
    });
    const removedSub = onPassRemoved((e) => {
      if (e.serialNumber === SERIAL_NUMBER) setIsInWallet(false);
    });

    return () => {
      addedSub.remove();
      removedSub.remove();
    };
  }, []);

  const handleAddToWallet = async () => {
    setIsLoading(true);
    try {
      // Check if we can add passes
      if (!(await canAddPasses())) {
        Alert.alert('Error', 'Cannot add passes to wallet');
        return;
      }

      // Create the pass
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: PASS_TYPE_ID,
          serialNumber: SERIAL_NUMBER,
          teamIdentifier: 'YOUR_TEAM_ID',
        })
        .setOrganization({
          organizationName: 'Example Inc.',
          description: 'Loyalty Card',
        })
        .setPassType(PassType.StoreCard)
        .addPrimaryField({
          key: 'points',
          label: 'POINTS',
          value: '500',
        });

      // Add images, build, sign, generate
      builder.addImage({ type: PassImageType.Icon, data: iconBuffer });

      const { passData, images } = builder.build();
      const pass = createPass(passData, images);
      pass.setSigningCredentials(credentials);
      const base64 = await pass.generateBase64();

      // Add to wallet
      const result = await addPassToWallet(base64);

      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to add pass');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      {isInWallet ? (
        <Text>Pass is in your wallet</Text>
      ) : (
        <Button
          title={isLoading ? 'Adding...' : 'Add to Wallet'}
          onPress={handleAddToWallet}
          disabled={isLoading}
        />
      )}
    </View>
  );
}
```

## Google Wallet (Android)

For Android devices, PassKite supports Google Wallet via JWT tokens. The flow is different from iOS:

1. Create pass classes and objects via the Google Wallet API (server-side)
2. Generate a signed JWT token (server-side)
3. Pass the JWT to `addGoogleWalletJwt` or an explicit Google Wallet payload

```typescript
import { Platform } from 'react-native';
import { addGoogleWalletJwt, addPassToWallet } from 'expo-passkite';

if (Platform.OS === 'ios') {
  // Use .pkpass base64
  const pkpassBase64 = await pass.generateBase64();
  await addPassToWallet(pkpassBase64);
} else {
  // Use Google Wallet JWT (obtained from your server)
  const jwt = await fetchGoogleWalletJwt(userId);
  await addGoogleWalletJwt(jwt);

  // Or use the discriminated payload API:
  await addPassToWallet({ type: 'google-wallet', jwt });
}
```

See [Google Wallet API documentation](https://developers.google.com/wallet) for details on generating JWT tokens.

## Next Steps

- See the full [API Reference](/expo-passkite/reference/api/)
- Learn about [Pass Types](/expo-passkite/guides/pass-types/)
