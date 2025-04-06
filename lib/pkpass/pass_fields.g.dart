// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'pass_fields.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PassFields _$PassFieldsFromJson(Map<String, dynamic> json) => PassFields(
      auxiliaryFields: (json['auxiliaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      backFields: (json['backFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      headerFields: (json['headerFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      primaryFields: (json['primaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      secondaryFields: (json['secondaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$PassFieldsToJson(PassFields instance) =>
    <String, dynamic>{
      if (instance.auxiliaryFields case final value?) 'auxiliaryFields': value,
      if (instance.backFields case final value?) 'backFields': value,
      if (instance.headerFields case final value?) 'headerFields': value,
      if (instance.primaryFields case final value?) 'primaryFields': value,
      if (instance.secondaryFields case final value?) 'secondaryFields': value,
    };

BoardingPass _$BoardingPassFromJson(Map<String, dynamic> json) => BoardingPass(
      auxiliaryFields: (json['auxiliaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      backFields: (json['backFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      headerFields: (json['headerFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      primaryFields: (json['primaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      secondaryFields: (json['secondaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      transitType: $enumDecode(_$TransitTypeEnumMap, json['transitType']),
    );

Map<String, dynamic> _$BoardingPassToJson(BoardingPass instance) =>
    <String, dynamic>{
      if (instance.auxiliaryFields case final value?) 'auxiliaryFields': value,
      if (instance.backFields case final value?) 'backFields': value,
      if (instance.headerFields case final value?) 'headerFields': value,
      if (instance.primaryFields case final value?) 'primaryFields': value,
      if (instance.secondaryFields case final value?) 'secondaryFields': value,
      'transitType': _$TransitTypeEnumMap[instance.transitType]!,
    };

const _$TransitTypeEnumMap = {
  TransitType.air: 'PKTransitTypeAir',
  TransitType.boat: 'PKTransitTypeBoat',
  TransitType.bus: 'PKTransitTypeBus',
  TransitType.generic: 'PKTransitTypeGeneric',
  TransitType.train: 'PKTransitTypeTrain',
};

Coupon _$CouponFromJson(Map<String, dynamic> json) => Coupon(
      auxiliaryFields: (json['auxiliaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      backFields: (json['backFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      headerFields: (json['headerFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      primaryFields: (json['primaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      secondaryFields: (json['secondaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$CouponToJson(Coupon instance) => <String, dynamic>{
      if (instance.auxiliaryFields case final value?) 'auxiliaryFields': value,
      if (instance.backFields case final value?) 'backFields': value,
      if (instance.headerFields case final value?) 'headerFields': value,
      if (instance.primaryFields case final value?) 'primaryFields': value,
      if (instance.secondaryFields case final value?) 'secondaryFields': value,
    };

EventTicket _$EventTicketFromJson(Map<String, dynamic> json) => EventTicket(
      auxiliaryFields: (json['auxiliaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      backFields: (json['backFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      headerFields: (json['headerFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      primaryFields: (json['primaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      secondaryFields: (json['secondaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      ux: json['ux'] as String?,
    );

Map<String, dynamic> _$EventTicketToJson(EventTicket instance) =>
    <String, dynamic>{
      if (instance.auxiliaryFields case final value?) 'auxiliaryFields': value,
      if (instance.backFields case final value?) 'backFields': value,
      if (instance.headerFields case final value?) 'headerFields': value,
      if (instance.primaryFields case final value?) 'primaryFields': value,
      if (instance.secondaryFields case final value?) 'secondaryFields': value,
      if (instance.ux case final value?) 'ux': value,
    };

Generic _$GenericFromJson(Map<String, dynamic> json) => Generic(
      auxiliaryFields: (json['auxiliaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      backFields: (json['backFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      headerFields: (json['headerFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      primaryFields: (json['primaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      secondaryFields: (json['secondaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$GenericToJson(Generic instance) => <String, dynamic>{
      if (instance.auxiliaryFields case final value?) 'auxiliaryFields': value,
      if (instance.backFields case final value?) 'backFields': value,
      if (instance.headerFields case final value?) 'headerFields': value,
      if (instance.primaryFields case final value?) 'primaryFields': value,
      if (instance.secondaryFields case final value?) 'secondaryFields': value,
    };

StoreCard _$StoreCardFromJson(Map<String, dynamic> json) => StoreCard(
      auxiliaryFields: (json['auxiliaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      backFields: (json['backFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      headerFields: (json['headerFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      primaryFields: (json['primaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
      secondaryFields: (json['secondaryFields'] as List<dynamic>?)
          ?.map((e) => PassFieldContent.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$StoreCardToJson(StoreCard instance) => <String, dynamic>{
      if (instance.auxiliaryFields case final value?) 'auxiliaryFields': value,
      if (instance.backFields case final value?) 'backFields': value,
      if (instance.headerFields case final value?) 'headerFields': value,
      if (instance.primaryFields case final value?) 'primaryFields': value,
      if (instance.secondaryFields case final value?) 'secondaryFields': value,
    };
