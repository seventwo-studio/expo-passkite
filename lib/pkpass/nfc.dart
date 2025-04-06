import 'package:json_annotation/json_annotation.dart';

part 'nfc.g.dart';

/// A class representing an NFC payload in a PkPass.
@JsonSerializable(includeIfNull: false)
class NFC {
  /// Creates a new instance of the [NFC] class.
  /// The [encryptionPublicKey] and [message] parameters are required.
  NFC({
    required this.encryptionPublicKey,
    required this.message,
    this.requiresAuthentication = false,
  });

  /// The public encryption key the Value Added Services protocol uses.
  /// Use a Base64-encoded X.509 SubjectPublicKeyInfo structure that contains an ECDH public key for group P256.
  @JsonKey(name: 'encryptionPublicKey')
  final String encryptionPublicKey;

  /// The payload the device transmits to the Apple Pay terminal.
  /// The size must be no more than 64 bytes. The system truncates messages longer than 64 bytes.
  @JsonKey(name: 'message')
  final String message;

  /// A Boolean value that indicates whether the NFC pass requires authentication.
  /// The default value is false. A value of true requires the user to authenticate for each use of the NFC pass.
  @JsonKey(name: 'requiresAuthentication')
  final bool requiresAuthentication;

  /// Creates a copy of this [NFC] but with the given fields replaced with the new values.
  NFC copyWith({
    String? encryptionPublicKey,
    String? message,
    bool? requiresAuthentication,
  }) {
    return NFC(
      encryptionPublicKey: encryptionPublicKey ?? this.encryptionPublicKey,
      message: message ?? this.message,
      requiresAuthentication:
          requiresAuthentication ?? this.requiresAuthentication,
    );
  }

  /// Converts this [NFC] instance to a JSON map.
  Map<String, dynamic> toJson() => _$NFCToJson(this);

  /// Creates a new [NFC] instance from a JSON map.
  factory NFC.fromJson(Map<String, dynamic> json) => _$NFCFromJson(json);
}
