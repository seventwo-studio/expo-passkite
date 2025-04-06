// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'pass_data.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PassData _$PassDataFromJson(Map<String, dynamic> json) => PassData(
      appLaunchURL: json['appLaunchURL'] as String?,
      associatedStoreIdentifiers:
          (json['associatedStoreIdentifiers'] as List<dynamic>?)
              ?.map((e) => (e as num).toInt())
              .toList(),
      authenticationToken: json['authenticationToken'] as String?,
      backgroundColor: json['backgroundColor'] as String?,
      barcodes: (json['barcodes'] as List<dynamic>?)
          ?.map((e) => Barcode.fromJson(e as Map<String, dynamic>))
          .toList(),
      beacons: (json['beacons'] as List<dynamic>?)
          ?.map((e) => Beacon.fromJson(e as Map<String, dynamic>))
          .toList(),
      boardingPass: json['boardingPass'] == null
          ? null
          : BoardingPass.fromJson(json['boardingPass'] as Map<String, dynamic>),
      coupon: json['coupon'] == null
          ? null
          : Coupon.fromJson(json['coupon'] as Map<String, dynamic>),
      description: json['description'] as String,
      eventTicket: json['eventTicket'] == null
          ? null
          : EventTicket.fromJson(json['eventTicket'] as Map<String, dynamic>),
      expirationDate: json['expirationDate'] as String?,
      foregroundColor: json['foregroundColor'] as String?,
      formatVersion: (json['formatVersion'] as num?)?.toInt() ?? 1,
      generic: json['generic'] == null
          ? null
          : Generic.fromJson(json['generic'] as Map<String, dynamic>),
      groupingIdentifier: json['groupingIdentifier'] as String?,
      labelColor: json['labelColor'] as String?,
      locations: (json['locations'] as List<dynamic>?)
          ?.map((e) => Location.fromJson(e as Map<String, dynamic>))
          .toList(),
      logoText: json['logoText'] as String?,
      maxDistance: (json['maxDistance'] as num?)?.toInt(),
      nfc: json['nfc'] == null
          ? null
          : NFC.fromJson(json['nfc'] as Map<String, dynamic>),
      organizationName: json['organizationName'] as String,
      passTypeIdentifier: json['passTypeIdentifier'] as String,
      relevantDate: json['relevantDate'] as String?,
      relevantDates: (json['relevantDates'] as List<dynamic>?)
          ?.map((e) => RelevantDate.fromJson(e as Map<String, dynamic>))
          .toList(),
      semantics: json['semantics'] == null
          ? null
          : SemanticTags.fromJson(json['semantics'] as Map<String, dynamic>),
      serialNumber: json['serialNumber'] as String,
      sharingProhibited: json['sharingProhibited'] as bool?,
      storeCard: json['storeCard'] == null
          ? null
          : StoreCard.fromJson(json['storeCard'] as Map<String, dynamic>),
      suppressStripShine: json['suppressStripShine'] as bool?,
      teamIdentifier: json['teamIdentifier'] as String,
      userInfo: json['userInfo'] as Map<String, dynamic>?,
      voided: json['voided'] as bool?,
      webServiceURL: json['webServiceURL'] as String?,
    );

Map<String, dynamic> _$PassDataToJson(PassData instance) => <String, dynamic>{
      if (instance.appLaunchURL case final value?) 'appLaunchURL': value,
      if (instance.associatedStoreIdentifiers case final value?)
        'associatedStoreIdentifiers': value,
      if (instance.authenticationToken case final value?)
        'authenticationToken': value,
      if (instance.backgroundColor case final value?) 'backgroundColor': value,
      if (instance.barcodes case final value?) 'barcodes': value,
      if (instance.beacons case final value?) 'beacons': value,
      if (instance.boardingPass case final value?) 'boardingPass': value,
      if (instance.coupon case final value?) 'coupon': value,
      'description': instance.description,
      if (instance.eventTicket case final value?) 'eventTicket': value,
      if (instance.expirationDate case final value?) 'expirationDate': value,
      if (instance.foregroundColor case final value?) 'foregroundColor': value,
      'formatVersion': instance.formatVersion,
      if (instance.generic case final value?) 'generic': value,
      if (instance.groupingIdentifier case final value?)
        'groupingIdentifier': value,
      if (instance.labelColor case final value?) 'labelColor': value,
      if (instance.locations case final value?) 'locations': value,
      if (instance.logoText case final value?) 'logoText': value,
      if (instance.maxDistance case final value?) 'maxDistance': value,
      if (instance.nfc case final value?) 'nfc': value,
      'organizationName': instance.organizationName,
      'passTypeIdentifier': instance.passTypeIdentifier,
      if (instance.relevantDate case final value?) 'relevantDate': value,
      if (instance.relevantDates case final value?) 'relevantDates': value,
      if (instance.semantics case final value?) 'semantics': value,
      'serialNumber': instance.serialNumber,
      if (instance.sharingProhibited case final value?)
        'sharingProhibited': value,
      if (instance.storeCard case final value?) 'storeCard': value,
      if (instance.suppressStripShine case final value?)
        'suppressStripShine': value,
      'teamIdentifier': instance.teamIdentifier,
      if (instance.userInfo case final value?) 'userInfo': value,
      if (instance.voided case final value?) 'voided': value,
      if (instance.webServiceURL case final value?) 'webServiceURL': value,
    };
