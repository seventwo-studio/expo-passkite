import 'dart:convert' as convert;
import 'dart:typed_data';
import 'package:pointycastle/pointycastle.dart';

/// RSA PEM parser.
class RSAKeyParser {
  /// Parses the PEM key no matter it is public or private, it will figure it out.
  RSAAsymmetricKey parse(String pemKey) {
    final pemLines = pemKey.split(RegExp(r'\r\n?|\n'));
    final pemHeader = pemLines.first;

    switch (pemHeader) {
      case '-----BEGIN RSA PUBLIC KEY-----':
        return _parsePublicKey(_parseASN1Sequence(pemLines));
      case '-----BEGIN PUBLIC KEY-----':
        return _parsePublicKey(
            _extractPKCS8PublicKeySequence(_parseASN1Sequence(pemLines)));
      case '-----BEGIN RSA PRIVATE KEY-----':
        return _parsePrivateKey(_parseASN1Sequence(pemLines));
      case '-----BEGIN PRIVATE KEY-----':
        return _parsePrivateKey(
            _extractPKCS8PrivateKeySequence(_parseASN1Sequence(pemLines)));
      default:
        throw FormatException(
            'Unable to parse key, invalid format.', pemHeader);
    }
  }

  /// Parses a public key from an ASN.1 sequence.
  RSAAsymmetricKey _parsePublicKey(ASN1Sequence asn1Sequence) {
    final modulus = (asn1Sequence.elements![0] as ASN1Integer).integer!;
    final exponent = (asn1Sequence.elements![1] as ASN1Integer).integer!;

    return RSAPublicKey(modulus, exponent);
  }

  /// Parses a private key from an ASN.1 sequence.
  RSAAsymmetricKey _parsePrivateKey(ASN1Sequence asn1Sequence) {
    final modulus = (asn1Sequence.elements![1] as ASN1Integer).integer!;
    final privateExponent = (asn1Sequence.elements![3] as ASN1Integer).integer!;
    final prime1 = (asn1Sequence.elements![4] as ASN1Integer).integer!;
    final prime2 = (asn1Sequence.elements![5] as ASN1Integer).integer!;

    return RSAPrivateKey(modulus, privateExponent, prime1, prime2);
  }

  /// Parses an ASN.1 sequence from a list of PEM rows.
  ASN1Sequence _parseASN1Sequence(List<String> pemLines) {
    final keyData = pemLines
        .skipWhile((line) => line.startsWith('-----BEGIN'))
        .takeWhile((line) => !line.startsWith('-----END'))
        .map((line) => line.trim())
        .join('');

    final keyBytes = Uint8List.fromList(convert.base64.decode(keyData));
    final asn1Parser = ASN1Parser(keyBytes);

    return asn1Parser.nextObject() as ASN1Sequence;
  }

  /// Extracts the public key sequence from a PKCS#8 ASN.1 sequence.
  ASN1Sequence _extractPKCS8PublicKeySequence(ASN1Sequence asn1Sequence) {
    final ASN1Object bitString = asn1Sequence.elements![1];
    final bitStringBytes = bitString.valueBytes!.sublist(1);
    final asn1Parser = ASN1Parser(Uint8List.fromList(bitStringBytes));

    return asn1Parser.nextObject() as ASN1Sequence;
  }

  /// Extracts the private key sequence from a PKCS#8 ASN.1 sequence.
  ASN1Sequence _extractPKCS8PrivateKeySequence(ASN1Sequence asn1Sequence) {
    final ASN1Object bitString = asn1Sequence.elements![2];
    final bitStringBytes = bitString.valueBytes;
    final asn1Parser = ASN1Parser(bitStringBytes);

    return asn1Parser.nextObject() as ASN1Sequence;
  }
}
