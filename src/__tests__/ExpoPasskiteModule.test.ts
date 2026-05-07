import {
  addGoogleWalletJwt,
  addPassToWallet,
  canAddPasses,
  containsPass,
  isPassLibraryAvailable,
  onPassAdded,
  onPassRemoved,
} from '../index';

describe('ExpoPasskiteModule platform routing', () => {
  const originalExpoOS = process.env.EXPO_OS;

  afterEach(() => {
    if (originalExpoOS === undefined) {
      delete process.env.EXPO_OS;
    } else {
      process.env.EXPO_OS = originalExpoOS;
    }
  });

  it('should allow importing wallet APIs outside native runtimes', () => {
    expect(typeof addPassToWallet).toBe('function');
    expect(typeof addGoogleWalletJwt).toBe('function');
  });

  it('should return unavailable results on web without loading the native module', async () => {
    process.env.EXPO_OS = 'web';

    await expect(addPassToWallet('base64-pass')).resolves.toEqual({
      success: false,
      error: 'Wallet integration is not available on this platform',
    });
    await expect(addGoogleWalletJwt('jwt')).resolves.toEqual({
      success: false,
      error: 'Wallet integration is not available on this platform',
    });
    await expect(canAddPasses()).resolves.toBe(false);
    await expect(isPassLibraryAvailable()).resolves.toBe(false);
    await expect(containsPass('pass.example', 'SERIAL')).resolves.toBe(false);

    expect(typeof onPassAdded(() => {}).remove).toBe('function');
    expect(typeof onPassRemoved(() => {}).remove).toBe('function');
  });

  it('should reject bare strings on Android instead of treating them as Google Wallet JWTs', async () => {
    process.env.EXPO_OS = 'android';

    const result = await addPassToWallet('base64-pass');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Google Wallet JWT');
  });

  it('should reject Apple Wallet payloads on Android without loading the native module', async () => {
    process.env.EXPO_OS = 'android';

    const result = await addPassToWallet({
      type: 'apple-wallet',
      passBase64: 'base64-pass',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Android cannot add Apple .pkpass payloads');
  });

  it('should reject Google Wallet JWTs on iOS without loading the native module', async () => {
    process.env.EXPO_OS = 'ios';

    const result = await addGoogleWalletJwt('jwt');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Google Wallet JWTs are only supported on Android');
  });
});
