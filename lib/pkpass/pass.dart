import 'dart:convert';
import 'dart:typed_data';

import 'package:archive/archive.dart';
import 'package:passkite/pkpass/pass_data.dart';
import 'package:passkite/pkpass/image.dart';

import 'package:crypto/crypto.dart';

import 'package:passkite/crypto/write_signature.dart';

class Pass {
  /// Creates a new instance of the [Pass] class.
  Pass({
    required this.data,
    Map<String, String>? manifest,
    this.background,
    this.footer,
    this.icon,
    this.logo,
    this.strip,
    this.thumbnail,
  }) : manifest = manifest ?? {};

  final PassData data;
  final Map<String, String> manifest;

  final PKImage? background;
  final PKImage? footer;
  final PKImage? icon;
  final PKImage? logo;
  final PKImage? strip;
  final PKImage? thumbnail;

  Uint8List? generate({
    required String? certificatePem,
    required String? privateKeyPem,
  }) {
    final encoder = JsonUtf8Encoder();
    final archive = Archive();

    logo?.addToPass(archive, manifest);
    background?.addToPass(archive, manifest);
    footer?.addToPass(archive, manifest);
    icon?.addToPass(archive, manifest);
    strip?.addToPass(archive, manifest);
    thumbnail?.addToPass(archive, manifest);

    final passBytes = Uint8List.fromList(
      encoder.convert(data.toJson()),
    );

    archive.addFile(
      ArchiveFile(
        'pass.json',
        passBytes.length,
        passBytes,
      ),
    );

    manifest['pass.json'] = sha1.convert(passBytes).toString();
    final manifestBytes = Uint8List.fromList(
      encoder.convert(manifest),
    );
    archive.addFile(
      ArchiveFile(
        'manifest.json',
        manifestBytes.length,
        manifestBytes,
      ),
    );

    if (certificatePem != null && privateKeyPem != null) {
      final signature = writeSignature(certificatePem, privateKeyPem,
          manifestBytes, data.passTypeIdentifier, data.teamIdentifier, true);

      final signatureFile = ArchiveFile(
        'signature',
        signature.length,
        signature,
      );
      archive.addFile(signatureFile);
    }

    final pass = ZipEncoder().encode(archive);
    if (pass == null) return null;
    return Uint8List.fromList(pass);
  }
}
