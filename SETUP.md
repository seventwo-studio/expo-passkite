# PassKite Setup Guide

This guide walks you through setting up Apple Wallet pass signing credentials for PassKite.

## Prerequisites

- An [Apple Developer Program](https://developer.apple.com/programs/) membership ($99/year)
- macOS with Keychain Access (for certificate management)
- OpenSSL (pre-installed on macOS)

## Step 1: Create a Pass Type ID

1. Go to [Apple Developer Portal - Identifiers](https://developer.apple.com/account/resources/identifiers/list/passTypeId)

2. Click the **+** button to create a new identifier

3. Select **Pass Type IDs** and click **Continue**

4. Enter a description (e.g., "My App Loyalty Card")

5. Enter an identifier in reverse-DNS format:
   ```
   pass.com.yourcompany.yourapp
   ```

6. Click **Continue**, then **Register**

## Step 2: Create a Pass Signing Certificate

1. Go to [Apple Developer Portal - Certificates](https://developer.apple.com/account/resources/certificates/list)

2. Click the **+** button to create a new certificate

3. Under **Services**, select **Pass Type ID Certificate** and click **Continue**

4. Select your Pass Type ID from the dropdown and click **Continue**

5. You'll need to create a Certificate Signing Request (CSR):

   **On macOS:**
   - Open **Keychain Access**
   - Go to **Keychain Access → Certificate Assistant → Request a Certificate From a Certificate Authority**
   - Enter your email address
   - Select **Saved to disk**
   - Click **Continue** and save the `.certSigningRequest` file

6. Upload the CSR file and click **Continue**

7. Download the certificate (`.cer` file)

8. Double-click the downloaded certificate to install it in Keychain Access

## Step 3: Export Credentials

### Export the Signing Certificate and Private Key

1. Open **Keychain Access**

2. In the **login** keychain, find your Pass Type ID certificate (under **My Certificates**)

3. Expand it to see the private key

4. Select **both** the certificate and key, right-click → **Export 2 items...**

5. Save as `pass-certificate.p12` with a password

### Convert to PEM Format

Open Terminal and run:

```bash
# Create a credentials directory (this is gitignored)
mkdir -p credentials

# Extract the certificate
openssl pkcs12 -in pass-certificate.p12 -clcerts -nokeys -out credentials/signer-cert.pem

# Extract the private key (you can remove -nodes to keep it encrypted)
openssl pkcs12 -in pass-certificate.p12 -nocerts -out credentials/signer-key.pem

# If you used -nodes, the key is unencrypted
# If not, you'll need to provide the passphrase in PASSKITE_SIGNER_KEY_PASSPHRASE
```

### Download the Apple WWDR Certificate

Apple's Worldwide Developer Relations (WWDR) certificate is required for pass signing:

```bash
# Download the G4 certificate (for passes created after January 27, 2022)
curl -o credentials/wwdr.cer https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer

# Convert from DER to PEM format
openssl x509 -inform DER -in credentials/wwdr.cer -out credentials/wwdr.pem

# Clean up
rm credentials/wwdr.cer
```

## Step 4: Find Your Team ID

1. Go to [Apple Developer - Membership](https://developer.apple.com/account#MembershipDetailsCard)

2. Your **Team ID** is displayed (10 alphanumeric characters)

## Step 5: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```bash
   # Your Pass Type ID
   PASSKITE_PASS_TYPE_ID=pass.com.yourcompany.yourapp

   # Your Team ID
   PASSKITE_TEAM_ID=ABCD123456

   # Credential files (using file: prefix)
   PASSKITE_WWDR_CERT=file:./credentials/wwdr.pem
   PASSKITE_SIGNER_CERT=file:./credentials/signer-cert.pem
   PASSKITE_SIGNER_KEY=file:./credentials/signer-key.pem

   # If your private key is encrypted, add the passphrase
   PASSKITE_SIGNER_KEY_PASSPHRASE=your-passphrase-here
   ```

## Step 6: Verify Your Setup

Run the example app to verify everything works:

```bash
cd example
pnpm install
pnpm ios
```

The app should be able to generate and add passes to Apple Wallet.

## Security Best Practices

### Never Commit Credentials

The following are automatically ignored by `.gitignore`:
- `.env` files
- `credentials/` directory
- `*.pem`, `*.p12`, `*.cer`, `*.key` files

### For CI/CD Environments

Store credentials as secrets in your CI/CD platform:

**GitHub Actions:**
```yaml
env:
  PASSKITE_PASS_TYPE_ID: ${{ secrets.PASSKITE_PASS_TYPE_ID }}
  PASSKITE_TEAM_ID: ${{ secrets.PASSKITE_TEAM_ID }}
  PASSKITE_WWDR_CERT: ${{ secrets.PASSKITE_WWDR_CERT }}
  PASSKITE_SIGNER_CERT: ${{ secrets.PASSKITE_SIGNER_CERT }}
  PASSKITE_SIGNER_KEY: ${{ secrets.PASSKITE_SIGNER_KEY }}
  PASSKITE_SIGNER_KEY_PASSPHRASE: ${{ secrets.PASSKITE_SIGNER_KEY_PASSPHRASE }}
```

For secrets, paste the entire PEM file content (the credential loader handles `\n` conversion).

### Rotate Certificates

Pass Type ID certificates expire after one year. Set a reminder to:
1. Create a new certificate before expiration
2. Update your credentials
3. Re-deploy your application

## Troubleshooting

### "Pass does not contain icon.png"

Every pass requires an icon image. Make sure to add:
```typescript
pass.addImage({
  type: PassImageType.Icon,
  data: iconImageBuffer,
});
```

### "Invalid signature"

- Ensure you're using the correct WWDR certificate (G4 for new passes)
- Verify your Pass Type ID matches the certificate
- Check that the private key passphrase is correct

### "Team ID mismatch"

The Team ID in your pass must match the Team ID in your signing certificate.

## Additional Resources

- [Apple Wallet Developer Guide](https://developer.apple.com/documentation/walletpasses)
- [Pass Type ID Certificate Help](https://developer.apple.com/help/account/certificates/create-a-pass-type-id-certificate)
- [PassKit Package Format Reference](https://developer.apple.com/documentation/walletpasses/creating_the_source_for_a_pass)
