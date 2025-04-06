// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'relevant_date.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RelevantDate _$RelevantDateFromJson(Map<String, dynamic> json) => RelevantDate(
      relevantDate: json['relevantDate'] as String?,
      startDate: json['startDate'] as String?,
      endDate: json['endDate'] as String?,
    );

Map<String, dynamic> _$RelevantDateToJson(RelevantDate instance) =>
    <String, dynamic>{
      if (instance.relevantDate case final value?) 'relevantDate': value,
      if (instance.startDate case final value?) 'startDate': value,
      if (instance.endDate case final value?) 'endDate': value,
    };
