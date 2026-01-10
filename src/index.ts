// Types
export * from './types';

// Pass generation
export { Pass, createPass } from './Pass';
export { PassBuilder, createPassBuilder } from './PassBuilder';

// Credentials management
export {
  loadCredentialsFromEnv,
  loadPassIdentityFromEnv,
  hasCredentialsInEnv,
  hasPassIdentityInEnv,
  CREDENTIAL_ENV_VARS,
} from './credentials';
export type { PassIdentity } from './credentials';

// Native wallet integration
export {
  addPassToWallet,
  canAddPasses,
  isPassLibraryAvailable,
  containsPass,
  onPassAdded,
  onPassRemoved,
} from './ExpoPasskiteModule';

// Note: Config plugin (withPasskite) is available via app.plugin.js
// and should not be imported at runtime
