import 'package:json_annotation/json_annotation.dart';

part 'beacon.g.dart';

/// A class representing a Bluetooth Low Energy beacon in a PkPass.
@JsonSerializable(includeIfNull: false)
class Beacon {
  /// Creates a new instance of the [Beacon] class.
  /// The [proximityUUID] parameter is required.
  Beacon({
    required this.proximityUUID,
    this.major,
    this.minor,
    this.relevantText,
  });

  /// The unique identifier of a Bluetooth Low Energy location beacon.
  @JsonKey(name: 'proximityUUID')
  final String proximityUUID;

  /// The major identifier of a Bluetooth Low Energy location beacon.
  @JsonKey(name: 'major')
  final int? major;

  /// The minor identifier of a Bluetooth Low Energy location beacon.
  @JsonKey(name: 'minor')
  final int? minor;

  /// The text to display on the lock screen when the pass is relevant.
  /// For example, a description of a nearby location, such as “Store nearby on 1st and Main”.
  @JsonKey(name: 'relevantText')
  final String? relevantText;

  /// Creates a copy of this [Beacon] but with the given fields replaced with the new values.
  Beacon copyWith({
    String? proximityUUID,
    int? major,
    int? minor,
    String? relevantText,
  }) {
    return Beacon(
      proximityUUID: proximityUUID ?? this.proximityUUID,
      major: major ?? this.major,
      minor: minor ?? this.minor,
      relevantText: relevantText ?? this.relevantText,
    );
  }

  /// Converts this [Beacon] instance to a JSON map.
  Map<String, dynamic> toJson() => _$BeaconToJson(this);

  /// Creates a new [Beacon] instance from a JSON map.
  factory Beacon.fromJson(Map<String, dynamic> json) => _$BeaconFromJson(json);
}
