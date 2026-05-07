import type { NativeModule } from 'expo';
import type { AddPassResult, ExpoPasskiteModuleInterface, WalletPassPayload } from './types';

// Define events that the module can emit
type ExpoPasskiteEvents = {
  onPassAdded: (event: { passTypeIdentifier: string; serialNumber: string }) => void;
  onPassRemoved: (event: { passTypeIdentifier: string; serialNumber: string }) => void;
};

// Native module interface extending NativeModule
declare class ExpoPasskiteModuleType extends NativeModule<ExpoPasskiteEvents> implements ExpoPasskiteModuleInterface {
  addPassToWallet(passData: string): Promise<AddPassResult>;
  addGoogleWalletJwt(jwt: string): Promise<AddPassResult>;
  canAddPasses(): Promise<boolean>;
  isPassLibraryAvailable(): Promise<boolean>;
  containsPass(passTypeIdentifier: string, serialNumber: string): Promise<boolean>;
}

let ExpoPasskiteNativeModule: ExpoPasskiteModuleType | null = null;

function getPlatformOS(): string {
  if (typeof process !== 'undefined' && process.env?.EXPO_OS) {
    return process.env.EXPO_OS;
  }

  try {
    const { Platform } = require('react-native') as { Platform: { OS: string } };
    return Platform.OS;
  } catch {
    return 'node';
  }
}

function getNativeModule(): ExpoPasskiteModuleType {
  if (!ExpoPasskiteNativeModule) {
    const { requireNativeModule } = require('expo') as typeof import('expo');
    ExpoPasskiteNativeModule = requireNativeModule<ExpoPasskiteModuleType>('ExpoPasskite');
  }
  return ExpoPasskiteNativeModule;
}

/**
 * Add a pass to the device wallet.
 *
 * Passing a string preserves the existing iOS Apple Wallet behavior and treats it
 * as base64 encoded .pkpass data. Android requires an explicit Google Wallet
 * JWT payload or addGoogleWalletJwt(jwt).
 *
 * @param payload Base64 encoded .pkpass data for iOS, or an explicit wallet payload
 * @returns Promise with the result of the operation
 */
export async function addPassToWallet(passBase64: string): Promise<AddPassResult>;
export async function addPassToWallet(payload: WalletPassPayload): Promise<AddPassResult>;
export async function addPassToWallet(payload: string | WalletPassPayload): Promise<AddPassResult> {
  const platformOS = getPlatformOS();

  if (platformOS === 'web' || platformOS === 'node') {
    return {
      success: false,
      error: 'Wallet integration is not available on this platform',
    };
  }

  if (typeof payload === 'string') {
    if (platformOS === 'android') {
      return {
        success: false,
        error: 'Android requires a Google Wallet JWT. Use addGoogleWalletJwt(jwt) or addPassToWallet({ type: "google-wallet", jwt }).',
      };
    }

    return getNativeModule().addPassToWallet(payload);
  }

  if (payload.type === 'google-wallet') {
    return addGoogleWalletJwt(payload.jwt);
  }

  if (platformOS === 'android') {
    return {
      success: false,
      error: 'Android cannot add Apple .pkpass payloads. Use addGoogleWalletJwt(jwt) with a Google Wallet JWT.',
    };
  }

  return getNativeModule().addPassToWallet(payload.passBase64);
}

/**
 * Add a Google Wallet pass on Android using a signed JWT generated server-side.
 */
export async function addGoogleWalletJwt(jwt: string): Promise<AddPassResult> {
  const platformOS = getPlatformOS();

  if (platformOS === 'web' || platformOS === 'node') {
    return {
      success: false,
      error: 'Wallet integration is not available on this platform',
    };
  }

  if (platformOS !== 'android') {
    return {
      success: false,
      error: 'Google Wallet JWTs are only supported on Android',
    };
  }

  return getNativeModule().addGoogleWalletJwt(jwt);
}

/**
 * Check if passes can be added on this device
 */
export async function canAddPasses(): Promise<boolean> {
  const platformOS = getPlatformOS();

  if (platformOS === 'web' || platformOS === 'node') {
    return false;
  }
  return getNativeModule().canAddPasses();
}

/**
 * Check if the pass library is available
 */
export async function isPassLibraryAvailable(): Promise<boolean> {
  const platformOS = getPlatformOS();

  if (platformOS === 'web' || platformOS === 'node') {
    return false;
  }
  return getNativeModule().isPassLibraryAvailable();
}

/**
 * Check if a specific pass is already in the wallet
 */
export async function containsPass(
  passTypeIdentifier: string,
  serialNumber: string
): Promise<boolean> {
  const platformOS = getPlatformOS();

  if (platformOS === 'web' || platformOS === 'node') {
    return false;
  }
  return getNativeModule().containsPass(passTypeIdentifier, serialNumber);
}

/**
 * Subscribe to pass added events
 */
export function onPassAdded(
  callback: (event: { passTypeIdentifier: string; serialNumber: string }) => void
): { remove: () => void } {
  const platformOS = getPlatformOS();

  if (platformOS === 'web' || platformOS === 'node') {
    return { remove: () => {} };
  }

  return getNativeModule().addListener('onPassAdded', callback);
}

/**
 * Subscribe to pass removed events
 */
export function onPassRemoved(
  callback: (event: { passTypeIdentifier: string; serialNumber: string }) => void
): { remove: () => void } {
  const platformOS = getPlatformOS();

  if (platformOS === 'web' || platformOS === 'node') {
    return { remove: () => {} };
  }

  return getNativeModule().addListener('onPassRemoved', callback);
}

export default {
  addPassToWallet,
  addGoogleWalletJwt,
  canAddPasses,
  isPassLibraryAvailable,
  containsPass,
  onPassAdded,
  onPassRemoved,
};
