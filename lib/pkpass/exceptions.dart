/// Exception thrown when the `manifest.json` file is missing.
class ManifestJsonMissingException implements Exception {
  const ManifestJsonMissingException();
  @override
  String toString() => 'The PkPass has no manifest.json';
}

/// Exception thrown when the `pass.json` file is missing.
class PassJsonMissingException implements Exception {
  const PassJsonMissingException();
  @override
  String toString() => 'The PkPass has no pass.json';
}

/// Exception thrown when the byte data from which the pass or passes should be read is empty.
class ByteDataEmptyException implements Exception {
  const ByteDataEmptyException();
  @override
  String toString() => 'The list of bytes have no content';
}

/// Exception thrown when a file in the pkpass archive is missing a checksum.
class ChecksumMissingException implements Exception {
  const ChecksumMissingException();
  @override
  String toString() => 'A file in the pkpass archive is missing a checksum';
}

/// Exception thrown when the checksum of a file does not match the expected checksum.
class ChecksumMismatchException implements Exception {
  const ChecksumMismatchException(this.fileName);

  final String fileName;

  @override
  String toString() =>
      "The checksum of $fileName doesn't match the expected checksum";
}

/// Exception thrown when the signature does not match the given information in the pass.
class SignatureMismatchException implements Exception {
  const SignatureMismatchException();
  @override
  String toString() =>
      "The signature doesn't match the given information in the pass";
}

/// Exception thrown when the certificate used for the signature is expired.
class CertificateExpiredException implements Exception {
  const CertificateExpiredException();
  @override
  String toString() => 'The certificate used for the signature is expired';
}
