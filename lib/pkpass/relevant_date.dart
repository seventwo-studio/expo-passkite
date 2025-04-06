import 'package:json_annotation/json_annotation.dart';

part 'relevant_date.g.dart';

/// A class representing a relevant date or date range for a pass.
/// This can be either a single date or a date range with start and end dates.
@JsonSerializable(includeIfNull: false)
class RelevantDate {
  /// Creates a new instance of the [RelevantDate] class.
  /// Either [relevantDate] or both [startDate] and [endDate] must be provided.
  RelevantDate({
    this.relevantDate,
    this.startDate,
    this.endDate,
  }) : assert(
          (relevantDate != null) || (startDate != null && endDate != null),
          'Either relevantDate or both startDate and endDate must be provided',
        );

  /// A single relevant date in ISO 8601 format.
  @JsonKey(name: 'relevantDate')
  final String? relevantDate;

  /// The start date of a date range in ISO 8601 format.
  @JsonKey(name: 'startDate')
  final String? startDate;

  /// The end date of a date range in ISO 8601 format.
  @JsonKey(name: 'endDate')
  final String? endDate;

  /// Converts this [RelevantDate] instance to a JSON map.
  Map<String, dynamic> toJson() => _$RelevantDateToJson(this);

  /// Creates a new [RelevantDate] instance from a JSON map.
  factory RelevantDate.fromJson(Map<String, dynamic> json) =>
      _$RelevantDateFromJson(json);
}
