// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'beacon.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Beacon _$BeaconFromJson(Map<String, dynamic> json) => Beacon(
      proximityUUID: json['proximityUUID'] as String,
      major: (json['major'] as num?)?.toInt(),
      minor: (json['minor'] as num?)?.toInt(),
      relevantText: json['relevantText'] as String?,
    );

Map<String, dynamic> _$BeaconToJson(Beacon instance) => <String, dynamic>{
      'proximityUUID': instance.proximityUUID,
      if (instance.major case final value?) 'major': value,
      if (instance.minor case final value?) 'minor': value,
      if (instance.relevantText case final value?) 'relevantText': value,
    };
