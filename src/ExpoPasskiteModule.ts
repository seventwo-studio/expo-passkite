import { requireNativeModule, NativeModule } from 'expo';
import { Platform } from 'react-native';
import { AddPassResult, ExpoPasskiteModuleInterface } from './types';

// Define events that the module can emit
type ExpoPasskiteEvents = {
  onPassAdded: (event: { passTypeIdentifier: string; serialNumber: string }) => void;
  onPassRemoved: (event: { passTypeIdentifier: string; serialNumber: string }) => void;
};

// Native module interface extending NativeModule
declare class ExpoPasskiteModuleType extends NativeModule<ExpoPasskiteEvents> implements ExpoPasskiteModuleInterface {
  addPassToWallet(passData: string): Promise<AddPassResult>;
  canAddPasses(): Promise<boolean>;
  isPassLibraryAvailable(): Promise<boolean>;
  containsPass(passTypeIdentifier: string, serialNumber: string): Promise<boolean>;
}

// Import the native module
const ExpoPasskiteNativeModule = requireNativeModule<ExpoPasskiteModuleType>('ExpoPasskite');

/**
 * Add a pass to the device wallet
 * @param passBase64 Base64 encoded .pkpass file data
 * @returns Promise with the result of the operation
 */
export async function addPassToWallet(passBase64: string): Promise<AddPassResult> {
  if (Platform.OS === 'web') {
    return {
      success: false,
      error: 'Wallet integration is not available on web',
    };
  }
  return ExpoPasskiteNativeModule.addPassToWallet(passBase64);
}

/**
 * Check if passes can be added on this device
 */
export async function canAddPasses(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  return ExpoPasskiteNativeModule.canAddPasses();
}

/**
 * Check if the pass library is available
 */
export async function isPassLibraryAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  return ExpoPasskiteNativeModule.isPassLibraryAvailable();
}

/**
 * Check if a specific pass is already in the wallet
 */
export async function containsPass(
  passTypeIdentifier: string,
  serialNumber: string
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  return ExpoPasskiteNativeModule.containsPass(passTypeIdentifier, serialNumber);
}

/**
 * Subscribe to pass added events
 */
export function onPassAdded(
  callback: (event: { passTypeIdentifier: string; serialNumber: string }) => void
): { remove: () => void } {
  return ExpoPasskiteNativeModule.addListener('onPassAdded', callback);
}

/**
 * Subscribe to pass removed events
 */
export function onPassRemoved(
  callback: (event: { passTypeIdentifier: string; serialNumber: string }) => void
): { remove: () => void } {
  return ExpoPasskiteNativeModule.addListener('onPassRemoved', callback);
}

export default ExpoPasskiteNativeModule;
