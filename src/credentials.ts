import { SigningCredentials } from './types';

/**
 * Environment variable names for pass signing credentials
 */
export const CREDENTIAL_ENV_VARS = {
  WWDR_CERTIFICATE: 'PASSKITE_WWDR_CERT',
  SIGNER_CERTIFICATE: 'PASSKITE_SIGNER_CERT',
  SIGNER_KEY: 'PASSKITE_SIGNER_KEY',
  SIGNER_KEY_PASSPHRASE: 'PASSKITE_SIGNER_KEY_PASSPHRASE',
  PASS_TYPE_IDENTIFIER: 'PASSKITE_PASS_TYPE_ID',
  TEAM_IDENTIFIER: 'PASSKITE_TEAM_ID',
} as const;

/**
 * Pass identity configuration from environment
 */
export interface PassIdentity {
  passTypeIdentifier: string;
  teamIdentifier: string;
}

/**
 * Load signing credentials from environment variables.
 *
 * Environment variables can contain either:
 * - The actual PEM content (with \n for newlines)
 * - A file path prefixed with "file:" (e.g., "file:./credentials/signer.pem")
 *
 * Required environment variables:
 * - PASSKITE_WWDR_CERT: Apple WWDR certificate (PEM format)
 * - PASSKITE_SIGNER_CERT: Your pass signing certificate (PEM format)
 * - PASSKITE_SIGNER_KEY: Your pass signing private key (PEM format)
 *
 * Optional:
 * - PASSKITE_SIGNER_KEY_PASSPHRASE: Passphrase for encrypted private key
 *
 * @throws Error if required credentials are missing
 */
export function loadCredentialsFromEnv(): SigningCredentials {
  const wwdrCert = process.env[CREDENTIAL_ENV_VARS.WWDR_CERTIFICATE];
  const signerCert = process.env[CREDENTIAL_ENV_VARS.SIGNER_CERTIFICATE];
  const signerKey = process.env[CREDENTIAL_ENV_VARS.SIGNER_KEY];
  const passphrase = process.env[CREDENTIAL_ENV_VARS.SIGNER_KEY_PASSPHRASE];

  const missing: string[] = [];
  if (!wwdrCert) missing.push(CREDENTIAL_ENV_VARS.WWDR_CERTIFICATE);
  if (!signerCert) missing.push(CREDENTIAL_ENV_VARS.SIGNER_CERTIFICATE);
  if (!signerKey) missing.push(CREDENTIAL_ENV_VARS.SIGNER_KEY);

  if (missing.length > 0 || !wwdrCert || !signerCert || !signerKey) {
    throw new Error(
      `Missing required environment variables for pass signing:\n` +
      `  ${missing.join('\n  ')}\n\n` +
      `See SETUP.md for instructions on obtaining and configuring credentials.`
    );
  }

  return {
    wwdrCertificate: resolveCredential(wwdrCert),
    signerCertificate: resolveCredential(signerCert),
    signerKey: resolveCredential(signerKey),
    signerKeyPassphrase: passphrase,
  };
}

/**
 * Load pass identity (type ID and team ID) from environment variables.
 *
 * Required environment variables:
 * - PASSKITE_PASS_TYPE_ID: Your Pass Type ID (e.g., "pass.com.example.mypass")
 * - PASSKITE_TEAM_ID: Your Apple Developer Team ID (10 characters)
 *
 * @throws Error if required identity variables are missing
 */
export function loadPassIdentityFromEnv(): PassIdentity {
  const passTypeId = process.env[CREDENTIAL_ENV_VARS.PASS_TYPE_IDENTIFIER];
  const teamId = process.env[CREDENTIAL_ENV_VARS.TEAM_IDENTIFIER];

  const missing: string[] = [];
  if (!passTypeId) missing.push(CREDENTIAL_ENV_VARS.PASS_TYPE_IDENTIFIER);
  if (!teamId) missing.push(CREDENTIAL_ENV_VARS.TEAM_IDENTIFIER);

  if (missing.length > 0 || !passTypeId || !teamId) {
    throw new Error(
      `Missing required environment variables for pass identity:\n` +
      `  ${missing.join('\n  ')}\n\n` +
      `See SETUP.md for instructions on obtaining your Pass Type ID and Team ID.`
    );
  }

  return {
    passTypeIdentifier: passTypeId,
    teamIdentifier: teamId,
  };
}

/**
 * Check if all required credentials are available in environment.
 * Useful for conditional logic without throwing errors.
 */
export function hasCredentialsInEnv(): boolean {
  return !!(
    process.env[CREDENTIAL_ENV_VARS.WWDR_CERTIFICATE] &&
    process.env[CREDENTIAL_ENV_VARS.SIGNER_CERTIFICATE] &&
    process.env[CREDENTIAL_ENV_VARS.SIGNER_KEY]
  );
}

/**
 * Check if pass identity is available in environment.
 */
export function hasPassIdentityInEnv(): boolean {
  return !!(
    process.env[CREDENTIAL_ENV_VARS.PASS_TYPE_IDENTIFIER] &&
    process.env[CREDENTIAL_ENV_VARS.TEAM_IDENTIFIER]
  );
}

/**
 * Resolve a credential value that may be either:
 * - Direct PEM content
 * - A file path prefixed with "file:"
 */
function resolveCredential(value: string): string {
  if (value.startsWith('file:')) {
    const filePath = value.slice(5);
    // Dynamic import to avoid bundling fs in browser environments
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    return fs.readFileSync(filePath, 'utf-8');
  }
  // Replace literal \n with actual newlines (common in env vars)
  return value.replace(/\\n/g, '\n');
}
