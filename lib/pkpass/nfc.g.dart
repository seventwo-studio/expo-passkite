// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'nfc.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

NFC _$NFCFromJson(Map<String, dynamic> json) => NFC(
      encryptionPublicKey: json['encryptionPublicKey'] as String,
      message: json['message'] as String,
      requiresAuthentication: json['requiresAuthentication'] as bool? ?? false,
    );

Map<String, dynamic> _$NFCToJson(NFC instance) => <String, dynamic>{
      'encryptionPublicKey': instance.encryptionPublicKey,
      'message': instance.message,
      'requiresAuthentication': instance.requiresAuthentication,
    };
