// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'pass_field_content.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PassFieldContent _$PassFieldContentFromJson(Map<String, dynamic> json) =>
    PassFieldContent(
      key: json['key'] as String,
      value: json['value'],
      attributedValue: json['attributedValue'] as String?,
      changeMessage: json['changeMessage'] as String?,
      currencyCode: json['currencyCode'] as String?,
      dataDetectorTypes: (json['dataDetectorTypes'] as List<dynamic>?)
          ?.map((e) => $enumDecode(_$PKDataDetectorTypeEnumMap, e))
          .toList(),
      dateStyle: $enumDecodeNullable(_$PKDateStyleEnumMap, json['dateStyle']),
      ignoresTimeZone: json['ignoresTimeZone'] as bool?,
      isRelative: json['isRelative'] as bool?,
      label: json['label'] as String?,
      numberStyle:
          $enumDecodeNullable(_$PKNumberStyleEnumMap, json['numberStyle']),
      textAlignment:
          $enumDecodeNullable(_$PKTextAlignmentEnumMap, json['textAlignment']),
      timeStyle: $enumDecodeNullable(_$PKDateStyleEnumMap, json['timeStyle']),
    );

Map<String, dynamic> _$PassFieldContentToJson(PassFieldContent instance) =>
    <String, dynamic>{
      if (instance.attributedValue case final value?) 'attributedValue': value,
      if (instance.changeMessage case final value?) 'changeMessage': value,
      if (instance.currencyCode case final value?) 'currencyCode': value,
      if (instance.dataDetectorTypes
              ?.map((e) => _$PKDataDetectorTypeEnumMap[e]!)
              .toList()
          case final value?)
        'dataDetectorTypes': value,
      if (_$PKDateStyleEnumMap[instance.dateStyle] case final value?)
        'dateStyle': value,
      if (instance.ignoresTimeZone case final value?) 'ignoresTimeZone': value,
      if (instance.isRelative case final value?) 'isRelative': value,
      'key': instance.key,
      if (instance.label case final value?) 'label': value,
      if (_$PKNumberStyleEnumMap[instance.numberStyle] case final value?)
        'numberStyle': value,
      if (_$PKTextAlignmentEnumMap[instance.textAlignment] case final value?)
        'textAlignment': value,
      if (_$PKDateStyleEnumMap[instance.timeStyle] case final value?)
        'timeStyle': value,
      if (instance.value case final value?) 'value': value,
    };

const _$PKDataDetectorTypeEnumMap = {
  PKDataDetectorType.phoneNumber: 'PKDataDetectorTypePhoneNumber',
  PKDataDetectorType.link: 'PKDataDetectorTypeLink',
  PKDataDetectorType.address: 'PKDataDetectorTypeAddress',
  PKDataDetectorType.calendarEvent: 'PKDataDetectorTypeCalendarEvent',
};

const _$PKDateStyleEnumMap = {
  PKDateStyle.none: 'PKDateStyleNone',
  PKDateStyle.short: 'PKDateStyleShort',
  PKDateStyle.medium: 'PKDateStyleMedium',
  PKDateStyle.long: 'PKDateStyleLong',
  PKDateStyle.full: 'PKDateStyleFull',
};

const _$PKNumberStyleEnumMap = {
  PKNumberStyle.decimal: 'PKNumberStyleDecimal',
  PKNumberStyle.percent: 'PKNumberStylePercent',
  PKNumberStyle.scientific: 'PKNumberStyleScientific',
  PKNumberStyle.spellOut: 'PKNumberStyleSpellOut',
};

const _$PKTextAlignmentEnumMap = {
  PKTextAlignment.left: 'PKTextAlignmentLeft',
  PKTextAlignment.center: 'PKTextAlignmentCenter',
  PKTextAlignment.right: 'PKTextAlignmentRight',
  PKTextAlignment.natural: 'PKTextAlignmentNatural',
};
