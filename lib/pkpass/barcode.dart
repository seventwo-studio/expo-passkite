import 'package:json_annotation/json_annotation.dart';

part 'barcode.g.dart';

/// Enum representing the different types of barcodes supported by PkPass.
enum PkPassBarcodeType {
  /// QR Code format.
  @JsonValue('PKBarcodeFormatQR')
  qr,

  /// PDF417 format.
  @JsonValue('PKBarcodeFormatPDF417')
  pdf417,

  /// Aztec format.
  @JsonValue('PKBarcodeFormatAztec')
  aztec,

  /// Code 128 format.
  @JsonValue('PKBarcodeFormatCode128')
  code128,
}

/// A class representing a barcode in a PkPass.
@JsonSerializable(includeIfNull: false)
class Barcode {
  /// Creates a new instance of the [Barcode] class.
  /// The [format], [message], and [messageEncoding] parameters are required.
  Barcode({
    this.altText,
    required this.format,
    required this.message,
    required this.messageEncoding,
  });

  /// Optional alternative text for the barcode.
  /// This text can be used to provide a human-readable version of the barcode data.
  /// It is useful for accessibility purposes or when the barcode cannot be scanned.
  @JsonKey(name: 'altText')
  final String? altText;

  /// The format of the barcode.
  /// This specifies the type of barcode to be used, such as QR code, PDF417, or Aztec.
  /// The format must be one of the predefined types in the `PkPassBarcodeType` enum.
  @JsonKey(name: 'format')
  final PkPassBarcodeType format;

  /// The message encoded in the barcode.
  /// This is the actual data that will be encoded in the barcode.
  /// It can contain information such as a URL, a product code, or any other data that needs to be scanned.
  @JsonKey(name: 'message')
  final String message;

  /// The encoding used for the message.
  /// This specifies the character encoding used for the message, such as UTF-8 or ISO-8859-1.
  /// Proper encoding ensures that the message is correctly interpreted when scanned.
  @JsonKey(name: 'messageEncoding')
  final String messageEncoding;

  /// Creates a copy of this [Barcode] but with the given fields replaced with the new values.
  Barcode copyWith({
    String? altText,
    PkPassBarcodeType? format,
    String? message,
    String? messageEncoding,
  }) {
    return Barcode(
      altText: altText ?? this.altText,
      format: format ?? this.format,
      message: message ?? this.message,
      messageEncoding: messageEncoding ?? this.messageEncoding,
    );
  }

  /// Converts this [Barcode] instance to a JSON map.
  Map<String, dynamic> toJson() => _$BarcodeToJson(this);

  /// Creates a new [Barcode] instance from a JSON map.
  factory Barcode.fromJson(Map<String, dynamic> json) =>
      _$BarcodeFromJson(json);
}
