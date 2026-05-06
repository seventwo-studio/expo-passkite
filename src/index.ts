// Types
export * from './types';

// Native wallet integration
export {
  addPassToWallet,
  canAddPasses,
  isPassLibraryAvailable,
  containsPass,
  onPassAdded,
  onPassRemoved,
} from './ExpoPasskiteModule';

// Note: Pass generation (Pass, PassBuilder, credentials, certificates) lives in
// `expo-passkite/server` because it depends on Node-only APIs (node-forge, node:fs).
// Importing it from a React Native bundle will fail at runtime.
//
// Note: Config plugin (withPasskite) is available via app.plugin.js and
// should not be imported at runtime.
