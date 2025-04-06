import 'dart:typed_data';

import 'package:collection/collection.dart';
import 'package:crypto/crypto.dart';
import 'package:passkite/crypto/apple_wwdr_certificate.dart';
import 'package:passkite/crypto/certificate_extension.dart';
import 'package:pkcs7/pkcs7.dart';

import '../pkpass/exceptions.dart';

/// [identifier] corresponds to the `passTypeIdentifier` in PkPasses or the
/// `orderTypeIdentifier` for PkOrders.
///
/// [teamIdentifier] corresponds to the `teamIdentifier` in PkPasses or the
/// `merchantIdentifier` for PkOrders.
///
/// Verifies the signature of the given manifest.
///
/// [signatureBytes] is the signature to verify.
/// [manifestBytes] is the manifest data.
/// [identifier] is the pass or order type identifier.
/// [teamIdentifier] is the team or merchant identifier.
/// [now] is the current date and time, used to check certificate expiration.
/// [checkOutdatedIssuerCerts] indicates whether to check for outdated issuer certificates.
/// [overrideWwdrCert] is an optional override for the Apple WWDR certificate.
///
/// Returns true if the signature is valid, false otherwise.
bool verifySignature({
  required Uint8List signatureBytes,
  required Uint8List manifestBytes,
  required String identifier,
  required String teamIdentifier,
  DateTime? currentDateTime,
  bool checkOutdatedIssuerCerts = true,
  X509? overrideWwdrCert,
}) {
  final manifestHash = Uint8List.fromList(sha256.convert(manifestBytes).bytes);
  final pkcs7 = Pkcs7.fromDer(signatureBytes);

  if (checkOutdatedIssuerCerts) {
    for (final cert in pkcs7.certificates) {
      if (cert.notAfter.isBefore(currentDateTime ?? DateTime.now())) {
        throw const CertificateExpiredException();
      }
    }
  }

  final issuerCert = pkcs7.certificates
      .firstWhereOrNull(_certificateVerifier(teamIdentifier, identifier));

  if (issuerCert == null) {
    throw const SignatureMismatchException();
  }

  // Verify that there is a certificate in pkcs7.certificates which:
  // - Has a subject with a UID that matches the passTypeIdentifier.
  // - Has an organizationalUnitName that matches the teamIdentifier.
  // Ensure there is a certificate that matches an Apple WWDR certificate.1

  final signerInfo = pkcs7.verify([overrideWwdrCert ?? wwdr]);
  return signerInfo.listEquality(manifestHash, signerInfo.messageDigest!);
}

/// Returns a function that verifies if a certificate matches the given
/// team identifier and pass/order type identifier.
bool Function(X509) _certificateVerifier(
    String teamIdentifier, String identifier) {
  return (X509 x509) {
    final identifierMatches = x509.identifier == identifier;
    final teamIdentifierMatches = x509.teamIdentifier == teamIdentifier;

    return identifierMatches && teamIdentifierMatches;
  };
}
