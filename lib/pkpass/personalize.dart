import 'package:json_annotation/json_annotation.dart';

part 'personalize.g.dart';

/// A class representing the personalization information for a rewards pass.
@JsonSerializable(includeIfNull: false)
class Personalize {
  /// Creates a new instance of the [Personalize] class.
  /// The [description] and [requiredPersonalizationFields] parameters are required.
  Personalize({
    required this.description,
    required this.requiredPersonalizationFields,
    this.termsAndConditions,
  });

  /// A brief description of the program for a pass that appears on the signup sheet, under the personalization logo.
  @JsonKey(name: 'description')
  final String description;

  /// An array that identifies the signup data required from the user the system shows on the generated signup form.
  @JsonKey(name: 'requiredPersonalizationFields')
  final List<String> requiredPersonalizationFields;

  /// A description of the program’s terms and conditions.
  /// This string can contain HTML link tags to external content.
  @JsonKey(name: 'termsAndConditions')
  final String? termsAndConditions;

  /// Creates a copy of this [Personalize] but with the given fields replaced with the new values.
  Personalize copyWith({
    String? description,
    List<String>? requiredPersonalizationFields,
    String? termsAndConditions,
  }) {
    return Personalize(
      description: description ?? this.description,
      requiredPersonalizationFields:
          requiredPersonalizationFields ?? this.requiredPersonalizationFields,
      termsAndConditions: termsAndConditions ?? this.termsAndConditions,
    );
  }

  /// Converts this [Personalize] instance to a JSON map.
  Map<String, dynamic> toJson() => _$PersonalizeToJson(this);

  /// Creates a new [Personalize] instance from a JSON map.
  factory Personalize.fromJson(Map<String, dynamic> json) =>
      _$PersonalizeFromJson(json);
}
