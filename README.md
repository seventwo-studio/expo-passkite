# expo-passkite

Generate Apple Wallet passes (.pkpass) and add them to iOS Wallet or Google Wallet.

**[Documentation](https://seventwo-studio.github.io/expo-passkite/)** | **[API Reference](https://seventwo-studio.github.io/expo-passkite/reference/api/)** | **[Setup Guide](https://seventwo-studio.github.io/expo-passkite/guides/setup-credentials/)**

## Installation

```bash
npx expo install expo-passkite
```

## Configuration

Add the config plugin to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      ["expo-passkite", {
        "passTypeIdentifiers": ["$(TeamIdentifierPrefix)pass.com.example.myapp"]
      }]
    ]
  }
}
```

Then run prebuild:

```bash
npx expo prebuild
```

## Usage

The package ships two entry points so React Native bundles never pull in Node-only signing code:

| Entry point | Use it for | Runs in |
| --- | --- | --- |
| `expo-passkite` | Adding passes to Apple Wallet, querying state, listening to events, types/enums | React Native, web |
| `expo-passkite/server` | Building, signing, and packaging `.pkpass` files (`Pass`, `PassBuilder`, credential helpers, certificates) | Node, Bun, your backend |

The server entry depends on `node-forge`, `jszip`, and `node:fs`. Importing it from a React Native runtime will fail — generate passes on a server and ship the resulting `.pkpass` (or its base64 form) to the device.

### Creating a Pass (server)

```typescript
import {
  createPassBuilder,
  createPass,
  PassType,
  BarcodeFormat,
  PassImageType,
} from 'expo-passkite/server';

// Build pass data
const builder = createPassBuilder()
  .setIdentifiers({
    passTypeIdentifier: 'pass.com.example.myapp',
    serialNumber: 'E5982H-I2',
    teamIdentifier: 'A93A5CM278',
  })
  .setOrganization({
    organizationName: 'Example Inc.',
    description: 'Example Store Card',
    logoText: 'Example',
  })
  .setPassType(PassType.StoreCard)
  .setColors({
    backgroundColor: 'rgb(206, 140, 53)',
    foregroundColor: 'rgb(255, 255, 255)',
  })
  .addPrimaryField({
    key: 'balance',
    label: 'Balance',
    value: '$50.00',
  })
  .addBarcode({
    format: BarcodeFormat.QR,
    message: 'https://example.com/card/E5982H-I2',
    altText: 'E5982H-I2',
  });

const { passData, images } = builder.build();

// Create the pass
const pass = createPass(passData, images);

// Set signing credentials (required for valid passes)
pass.setSigningCredentials({
  wwdrCertificate: wwdrCertPem,
  signerCertificate: signerCertPem,
  signerKey: signerKeyPem,
  signerKeyPassphrase: 'password', // if key is encrypted
});

// Generate .pkpass file
const pkpassBuffer = await pass.generate();

// Or generate as base64 for sending to native module
const pkpassBase64 = await pass.generateBase64();
```

### Adding to Wallet

```typescript
import {
  addPassToWallet,
  canAddPasses,
  isPassLibraryAvailable,
  containsPass,
} from 'expo-passkite';

// Check if wallet is available
const available = await isPassLibraryAvailable();
const canAdd = await canAddPasses();

if (canAdd) {
  // Generate pass as base64
  const passBase64 = await pass.generateBase64();

  // Add to wallet
  const result = await addPassToWallet(passBase64);

  if (result.success) {
    console.log('Pass added successfully!');
  } else {
    console.error('Failed to add pass:', result.error);
  }
}

// Check if a specific pass exists
const exists = await containsPass('pass.com.example.myapp', 'E5982H-I2');
```

### Listening to Events

```typescript
import { onPassAdded, onPassRemoved } from 'expo-passkite';

// Subscribe to pass added events
const addedSubscription = onPassAdded((event) => {
  console.log('Pass added:', event.passTypeIdentifier, event.serialNumber);
});

// Subscribe to pass removed events
const removedSubscription = onPassRemoved((event) => {
  console.log('Pass removed:', event.passTypeIdentifier, event.serialNumber);
});

// Clean up
addedSubscription.remove();
removedSubscription.remove();
```

## Pass Types

- `PassType.BoardingPass` - Airline, train, bus, boat boarding passes
- `PassType.Coupon` - Coupons and offers
- `PassType.EventTicket` - Concert, movie, sports event tickets
- `PassType.StoreCard` - Loyalty and membership cards
- `PassType.Generic` - General purpose passes

## Signing Passes

To create valid passes that can be added to Apple Wallet, you need:

1. **Apple Developer Account** with Pass Type ID capability
2. **Pass Type ID** registered in Apple Developer Portal
3. **Pass Type ID Certificate** (.p12 or .pem)
4. **Apple WWDR Certificate** (Worldwide Developer Relations)

### Obtaining Certificates

1. Log in to [Apple Developer Portal](https://developer.apple.com)
2. Go to Certificates, Identifiers & Profiles
3. Create a Pass Type ID under Identifiers
4. Create a Pass Type ID Certificate under Certificates
5. Download the WWDR certificate from Apple

### Converting Certificates

```bash
# Convert .p12 to PEM files
openssl pkcs12 -in pass.p12 -out signerCert.pem -clcerts -nokeys
openssl pkcs12 -in pass.p12 -out signerKey.pem -nocerts -nodes
```

## Android / Google Wallet

For Android, the `addPassToWallet` function expects a Google Wallet JWT token instead of a .pkpass file. You'll need to:

1. Set up a Google Wallet API account
2. Create pass classes and objects via the Google Wallet API
3. Generate a signed JWT token server-side
4. Pass the JWT to `addPassToWallet`

See [Google Wallet API documentation](https://developers.google.com/wallet) for details.

## Documentation

For complete documentation, visit **[seventwo-studio.github.io/expo-passkite](https://seventwo-studio.github.io/expo-passkite/)**

- [Getting Started](https://seventwo-studio.github.io/expo-passkite/getting-started/introduction/)
- [Setup Credentials](https://seventwo-studio.github.io/expo-passkite/guides/setup-credentials/)
- [Creating Passes](https://seventwo-studio.github.io/expo-passkite/guides/creating-passes/)
- [Pass Types](https://seventwo-studio.github.io/expo-passkite/guides/pass-types/)
- [Wallet Integration](https://seventwo-studio.github.io/expo-passkite/guides/wallet-integration/)
- [API Reference](https://seventwo-studio.github.io/expo-passkite/reference/api/)
- [TypeScript Types](https://seventwo-studio.github.io/expo-passkite/reference/types/)

## License

MIT
