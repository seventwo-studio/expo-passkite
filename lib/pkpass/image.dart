import 'dart:typed_data';
import 'package:archive/archive.dart';
import 'package:crypto/crypto.dart';

class PKImage {
  final String name;
  final Map<int, Uint8List> images;

  PKImage({
    required this.name,
    required this.images,
  });

  _fileName(int scale) => '$name@$scale.png';

  _addToManifest(Map<String, dynamic> manifest) {
    images.forEach(
      (scale, value) {
        final fileName = _fileName(scale);
        final sha1Hash = sha1.convert(value).toString();
        manifest[fileName] = sha1Hash;
      },
    );
  }

  _addToArchive(Archive archive) {
    images.forEach(
      (scale, value) {
        final fileName = _fileName(scale);
        archive.addFile(
          ArchiveFile(
            fileName,
            value.lengthInBytes,
            value,
          ),
        );
      },
    );
  }

  addToPass(Archive archive, Map<String, dynamic> manifest) {
    _addToManifest(manifest);
    _addToArchive(archive);
  }
}
