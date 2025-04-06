import 'package:json_annotation/json_annotation.dart';

part 'pass_field_content.g.dart';

/// Enum representing the possible data detector types.
enum PKDataDetectorType {
  @JsonValue('PKDataDetectorTypePhoneNumber')
  phoneNumber,
  @JsonValue('PKDataDetectorTypeLink')
  link,
  @JsonValue('PKDataDetectorTypeAddress')
  address,
  @JsonValue('PKDataDetectorTypeCalendarEvent')
  calendarEvent,
}

/// Enum representing the possible date styles.
enum PKDateStyle {
  @JsonValue('PKDateStyleNone')
  none,
  @JsonValue('PKDateStyleShort')
  short,
  @JsonValue('PKDateStyleMedium')
  medium,
  @JsonValue('PKDateStyleLong')
  long,
  @JsonValue('PKDateStyleFull')
  full,
}

/// Enum representing the possible number styles.
enum PKNumberStyle {
  @JsonValue('PKNumberStyleDecimal')
  decimal,
  @JsonValue('PKNumberStylePercent')
  percent,
  @JsonValue('PKNumberStyleScientific')
  scientific,
  @JsonValue('PKNumberStyleSpellOut')
  spellOut,
}

/// Enum representing the possible text alignments.
enum PKTextAlignment {
  @JsonValue('PKTextAlignmentLeft')
  left,
  @JsonValue('PKTextAlignmentCenter')
  center,
  @JsonValue('PKTextAlignmentRight')
  right,
  @JsonValue('PKTextAlignmentNatural')
  natural,
}

/// A class representing the information to display in a field on a pass.
@JsonSerializable(includeIfNull: false)
class PassFieldContent {
  /// Creates a new instance of the [PassFieldContent] class.
  /// The [key] and [value] parameters are required.
  PassFieldContent({
    required this.key,
    required this.value,
    this.attributedValue,
    this.changeMessage,
    this.currencyCode,
    this.dataDetectorTypes,
    this.dateStyle,
    this.ignoresTimeZone,
    this.isRelative,
    this.label,
    this.numberStyle,
    this.textAlignment,
    this.timeStyle,
  });

  /// The value of the field, including HTML markup for links.
  @JsonKey(name: 'attributedValue')
  final String? attributedValue;

  /// A format string for the alert text to display when the pass is updated.
  @JsonKey(name: 'changeMessage')
  final String? changeMessage;

  /// The currency code to use for the value of the field.
  @JsonKey(name: 'currencyCode')
  final String? currencyCode;

  /// The data detectors to apply to the value of a field on the back of the pass.
  @JsonKey(name: 'dataDetectorTypes')
  final List<PKDataDetectorType>? dataDetectorTypes;

  /// The style of the date to display in the field.
  @JsonKey(name: 'dateStyle')
  final PKDateStyle? dateStyle;

  /// A Boolean value that controls whether to ignore the time zone when displaying the date and time.
  /// If true, the system displays the date and time in the local time zone.
  /// If false or not specified, the system displays the date and time in the time zone specified in the date string.
  @JsonKey(name: 'ignoresTimeZone')
  final bool? ignoresTimeZone;

  /// A Boolean value that controls whether the date appears as a relative date.
  @JsonKey(name: 'isRelative')
  final bool? isRelative;

  /// A unique key that identifies a field in the pass.
  @JsonKey(name: 'key')
  final String key;

  /// The text for a field label.
  @JsonKey(name: 'label')
  final String? label;

  /// The style of the number to display in the field.
  @JsonKey(name: 'numberStyle')
  final PKNumberStyle? numberStyle;

  /// The alignment for the content of a field.
  @JsonKey(name: 'textAlignment')
  final PKTextAlignment? textAlignment;

  /// The style of the time displayed in the field.
  @JsonKey(name: 'timeStyle')
  final PKDateStyle? timeStyle;

  /// The value to use for the field.
  @JsonKey(name: 'value')
  final dynamic value;

  /// Converts this [PassFieldContent] instance to a JSON map.
  Map<String, dynamic> toJson() => _$PassFieldContentToJson(this);

  /// Creates a new [PassFieldContent] instance from a JSON map.
  factory PassFieldContent.fromJson(Map<String, dynamic> json) =>
      _$PassFieldContentFromJson(json);
}
