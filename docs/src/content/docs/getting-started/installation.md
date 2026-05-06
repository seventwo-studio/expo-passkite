---
title: Installation
description: Install PassKite in your Expo or React Native project
---

## Install the Package

```bash
npx expo install expo-passkite
```

Or with your preferred package manager:

```bash
# npm
npm install expo-passkite

# yarn
yarn add expo-passkite

# pnpm
pnpm add expo-passkite

# bun
bun add expo-passkite
```

## Configure the Expo Plugin

Add the config plugin to your `app.json` or `app.config.js`:

```json title="app.json"
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

Or in JavaScript config:

```javascript title="app.config.js"
export default {
  expo: {
    plugins: [
      ['expo-passkite', {
        passTypeIdentifiers: ['$(TeamIdentifierPrefix)pass.com.example.myapp']
      }]
    ]
  }
};
```

### Plugin Options

| Option | Type | Description |
|--------|------|-------------|
| `passTypeIdentifiers` | `string[]` | Array of Pass Type IDs your app can handle. Use `$(TeamIdentifierPrefix)` prefix for dynamic team ID. |

## Run Prebuild

Generate the native projects with the configured entitlements:

```bash
npx expo prebuild
```

This will configure the iOS project with the necessary `com.apple.developer.pass-type-identifiers` entitlement.

## Verify Installation

```typescript
import { isPassLibraryAvailable } from 'expo-passkite';

const available = await isPassLibraryAvailable();
console.log('Wallet available:', available);
```

## Next Steps

Now that PassKite is installed, you need to set up your Apple signing credentials. See the [Setup Credentials](/expo-passkite/guides/setup-credentials/) guide.

Then check out the [Quick Start](/expo-passkite/getting-started/quick-start/) to create your first pass.
