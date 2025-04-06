// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'personalize.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Personalize _$PersonalizeFromJson(Map<String, dynamic> json) => Personalize(
      description: json['description'] as String,
      requiredPersonalizationFields:
          (json['requiredPersonalizationFields'] as List<dynamic>)
              .map((e) => e as String)
              .toList(),
      termsAndConditions: json['termsAndConditions'] as String?,
    );

Map<String, dynamic> _$PersonalizeToJson(Personalize instance) =>
    <String, dynamic>{
      'description': instance.description,
      'requiredPersonalizationFields': instance.requiredPersonalizationFields,
      if (instance.termsAndConditions case final value?)
        'termsAndConditions': value,
    };
