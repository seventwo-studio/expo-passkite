// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'semantic_tag_type.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SemanticTagCurrencyAmount _$SemanticTagCurrencyAmountFromJson(
        Map<String, dynamic> json) =>
    SemanticTagCurrencyAmount(
      amount: json['amount'] as String,
      currencyCode: json['currencyCode'] as String,
    );

Map<String, dynamic> _$SemanticTagCurrencyAmountToJson(
        SemanticTagCurrencyAmount instance) =>
    <String, dynamic>{
      'amount': instance.amount,
      'currencyCode': instance.currencyCode,
    };

SemanticTagLocation _$SemanticTagLocationFromJson(Map<String, dynamic> json) =>
    SemanticTagLocation(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
    );

Map<String, dynamic> _$SemanticTagLocationToJson(
        SemanticTagLocation instance) =>
    <String, dynamic>{
      'latitude': instance.latitude,
      'longitude': instance.longitude,
    };

SemanticTagPersonNameComponents _$SemanticTagPersonNameComponentsFromJson(
        Map<String, dynamic> json) =>
    SemanticTagPersonNameComponents(
      familyName: json['familyName'] as String,
      givenName: json['givenName'] as String,
      middleName: json['middleName'] as String?,
      namePrefix: json['namePrefix'] as String?,
      nameSuffix: json['nameSuffix'] as String?,
      nickname: json['nickname'] as String?,
      phoneticRepresentation: json['phoneticRepresentation'] as String?,
    );

Map<String, dynamic> _$SemanticTagPersonNameComponentsToJson(
        SemanticTagPersonNameComponents instance) =>
    <String, dynamic>{
      'familyName': instance.familyName,
      'givenName': instance.givenName,
      if (instance.middleName case final value?) 'middleName': value,
      if (instance.namePrefix case final value?) 'namePrefix': value,
      if (instance.nameSuffix case final value?) 'nameSuffix': value,
      if (instance.nickname case final value?) 'nickname': value,
      if (instance.phoneticRepresentation case final value?)
        'phoneticRepresentation': value,
    };

SemanticTagSeat _$SemanticTagSeatFromJson(Map<String, dynamic> json) =>
    SemanticTagSeat(
      seatDescription: json['seatDescription'] as String?,
      seatIdentifier: json['seatIdentifier'] as String?,
      seatNumber: json['seatNumber'] as String?,
      seatRow: json['seatRow'] as String?,
      seatSection: json['seatSection'] as String?,
      seatType: json['seatType'] as String?,
    );

Map<String, dynamic> _$SemanticTagSeatToJson(SemanticTagSeat instance) =>
    <String, dynamic>{
      if (instance.seatDescription case final value?) 'seatDescription': value,
      if (instance.seatIdentifier case final value?) 'seatIdentifier': value,
      if (instance.seatNumber case final value?) 'seatNumber': value,
      if (instance.seatRow case final value?) 'seatRow': value,
      if (instance.seatSection case final value?) 'seatSection': value,
      if (instance.seatType case final value?) 'seatType': value,
    };

SemanticTagWifiNetwork _$SemanticTagWifiNetworkFromJson(
        Map<String, dynamic> json) =>
    SemanticTagWifiNetwork(
      password: json['password'] as String,
      ssid: json['ssid'] as String,
    );

Map<String, dynamic> _$SemanticTagWifiNetworkToJson(
        SemanticTagWifiNetwork instance) =>
    <String, dynamic>{
      'password': instance.password,
      'ssid': instance.ssid,
    };
