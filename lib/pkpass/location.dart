import 'package:json_annotation/json_annotation.dart';

part 'location.g.dart';

/// A class representing a location in a PkPass.
@JsonSerializable(includeIfNull: false)
class Location {
  /// Creates a new instance of the [Location] class.
  /// The [latitude] and [longitude] parameters are required.
  Location({
    this.altitude,
    required this.latitude,
    required this.longitude,
    this.relevantText,
  });

  /// The altitude, in meters, of the location.
  @JsonKey(name: 'altitude')
  final double? altitude;

  /// The latitude, in degrees, of the location.
  @JsonKey(name: 'latitude')
  final double latitude;

  /// The longitude, in degrees, of the location.
  @JsonKey(name: 'longitude')
  final double longitude;

  /// The text to display on the lock screen when the pass is relevant.
  /// For example, a description of a nearby location, such as “Store nearby on 1st and Main”.
  @JsonKey(name: 'relevantText')
  final String? relevantText;

  /// Creates a copy of this [Location] but with the given fields replaced with the new values.
  Location copyWith({
    double? altitude,
    double? latitude,
    double? longitude,
    String? relevantText,
  }) {
    return Location(
      altitude: altitude ?? this.altitude,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      relevantText: relevantText ?? this.relevantText,
    );
  }

  /// Converts this [Location] instance to a JSON map.
  Map<String, dynamic> toJson() => _$LocationToJson(this);

  /// Creates a new [Location] instance from a JSON map.
  factory Location.fromJson(Map<String, dynamic> json) =>
      _$LocationFromJson(json);
}
