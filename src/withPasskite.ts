import {
  ConfigPlugin,
  withEntitlementsPlist,
  createRunOncePlugin,
} from 'expo/config-plugins';

/**
 * Configuration options for the Passkite config plugin
 */
export interface PasskitePluginOptions {
  /**
   * Pass type identifiers that the app can access
   * Use '$(TeamIdentifierPrefix)*' to allow all passes from your team
   * @default ['$(TeamIdentifierPrefix)*']
   */
  passTypeIdentifiers?: string[];
}

/**
 * Config plugin to add PassKit entitlements to iOS
 */
const withPasskiteEntitlements: ConfigPlugin<PasskitePluginOptions | void> = (
  config,
  options = {}
) => {
  const passTypeIdentifiers = options?.passTypeIdentifiers || ['$(TeamIdentifierPrefix)*'];

  return withEntitlementsPlist(config, (modConfig) => {
    modConfig.modResults['com.apple.developer.pass-type-identifiers'] = passTypeIdentifiers;
    return modConfig;
  });
};

const pkg = {
  name: 'expo-passkite',
  version: '0.1.0',
};

/**
 * Expo config plugin for expo-passkite
 *
 * Adds the required iOS entitlements for PassKit integration.
 *
 * @example
 * ```json
 * {
 *   "expo": {
 *     "plugins": [
 *       ["expo-passkite", {
 *         "passTypeIdentifiers": ["$(TeamIdentifierPrefix)pass.com.example.myapp"]
 *       }]
 *     ]
 *   }
 * }
 * ```
 */
const withPasskite = createRunOncePlugin(
  withPasskiteEntitlements,
  pkg.name,
  pkg.version
);

export default withPasskite;
