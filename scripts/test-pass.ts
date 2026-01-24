/**
 * Quick test script to verify pass generation with real credentials
 */
import { PassBuilder } from '../src/PassBuilder';
import { Pass } from '../src/Pass';
import { loadCredentialsFromEnv, loadPassIdentityFromEnv } from '../src/credentials';
import { PassType } from '../src/types';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('Loading credentials...');

  const credentials = loadCredentialsFromEnv();
  const identity = loadPassIdentityFromEnv();

  console.log('✓ Credentials loaded');
  console.log(`  Pass Type ID: ${identity.passTypeIdentifier}`);
  console.log(`  Team ID: ${identity.teamIdentifier}`);

  console.log('\nBuilding pass...');

  const builder = new PassBuilder();

  builder.setIdentifiers({
    passTypeIdentifier: identity.passTypeIdentifier,
    serialNumber: `test-${Date.now()}`,
    teamIdentifier: identity.teamIdentifier,
  });

  builder.setOrganization({
    organizationName: 'PassKite',
    description: 'Test Pass',
    logoText: 'PassKite',
  });

  builder.setColors({
    foregroundColor: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(26, 26, 46)',
  });

  builder.setPassType(PassType.Generic);

  builder.addPrimaryField({
    key: 'welcome',
    label: 'WELCOME',
    value: 'Hello World!',
  });

  builder.addSecondaryField({
    key: 'generated',
    label: 'GENERATED',
    value: new Date().toLocaleString(),
  });

  builder.addBarcode({
    format: 'PKBarcodeFormatQR',
    message: 'https://github.com/seventwo-studio/passkite',
    messageEncoding: 'iso-8859-1',
  });

  // Create a minimal valid 29x29 white PNG for icon
  const iconPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAIAAADZ8fBYAAAADklEQVR42mP4////geMBADz4H/WE1U8rAAAAAElFTkSuQmCC',
    'base64'
  );

  builder.addImage({
    type: 'icon',
    data: iconPng,
  });

  const { passData, images } = builder.build();

  console.log('✓ Pass data built');

  const pass = new Pass(passData, images);
  pass.setSigningCredentials(credentials);

  console.log('\nGenerating signed .pkpass file...');

  const pkpassData = await pass.generate();

  const outputPath = join(import.meta.dir, '..', 'test-output.pkpass');
  writeFileSync(outputPath, pkpassData);

  console.log(`\n✅ Success! Pass generated at:\n   ${outputPath}`);
  console.log('\nOpen it with:');
  console.log('  open test-output.pkpass');
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
