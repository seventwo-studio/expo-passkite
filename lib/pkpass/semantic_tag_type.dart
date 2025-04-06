import 'package:json_annotation/json_annotation.dart';

part 'semantic_tag_type.g.dart';

/// A class representing an amount of money and its currency code.
@JsonSerializable(includeIfNull: false)
class SemanticTagCurrencyAmount {
  /// Creates a new instance of the [SemanticTagCurrencyAmount] class.
  /// The [amount] and [currencyCode] parameters are required.
  SemanticTagCurrencyAmount({
    required this.amount,
    required this.currencyCode,
  });

  /// The amount of money.
  @JsonKey(name: 'amount')
  final String amount;

  /// The currency code for the amount.
  @JsonKey(name: 'currencyCode')
  final String currencyCode;

  /// Converts this [SemanticTagCurrencyAmount] instance to a JSON map.
  Map<String, dynamic> toJson() => _$SemanticTagCurrencyAmountToJson(this);

  /// Creates a new [SemanticTagCurrencyAmount] instance from a JSON map.
  factory SemanticTagCurrencyAmount.fromJson(Map<String, dynamic> json) =>
      _$SemanticTagCurrencyAmountFromJson(json);
}

/// A class representing the coordinates of a location.
@JsonSerializable(includeIfNull: false)
class SemanticTagLocation {
  /// Creates a new instance of the [SemanticTagLocation] class.
  /// The [latitude] and [longitude] parameters are required.
  SemanticTagLocation({
    required this.latitude,
    required this.longitude,
  });

  /// The latitude, in degrees.
  @JsonKey(name: 'latitude')
  final double latitude;

  /// The longitude, in degrees.
  @JsonKey(name: 'longitude')
  final double longitude;

  /// Converts this [SemanticTagLocation] instance to a JSON map.
  Map<String, dynamic> toJson() => _$SemanticTagLocationToJson(this);

  /// Creates a new [SemanticTagLocation] instance from a JSON map.
  factory SemanticTagLocation.fromJson(Map<String, dynamic> json) =>
      _$SemanticTagLocationFromJson(json);
}

/// A class representing the parts of a person’s name.
@JsonSerializable(includeIfNull: false)
class SemanticTagPersonNameComponents {
  /// Creates a new instance of the [SemanticTagPersonNameComponents] class.
  /// The [familyName] and [givenName] parameters are required.
  SemanticTagPersonNameComponents({
    required this.familyName,
    required this.givenName,
    this.middleName,
    this.namePrefix,
    this.nameSuffix,
    this.nickname,
    this.phoneticRepresentation,
  });

  /// The person’s family name or last name.
  @JsonKey(name: 'familyName')
  final String familyName;

  /// The person’s given name; also called the forename or first name in some countries.
  @JsonKey(name: 'givenName')
  final String givenName;

  /// The person’s middle name.
  @JsonKey(name: 'middleName')
  final String? middleName;

  /// The prefix for the person’s name, such as “Dr”.
  @JsonKey(name: 'namePrefix')
  final String? namePrefix;

  /// The suffix for the person’s name, such as “Junior”.
  @JsonKey(name: 'nameSuffix')
  final String? nameSuffix;

  /// The person’s nickname.
  @JsonKey(name: 'nickname')
  final String? nickname;

  /// The phonetic representation of the person’s name.
  @JsonKey(name: 'phoneticRepresentation')
  final String? phoneticRepresentation;

  /// Converts this [SemanticTagPersonNameComponents] instance to a JSON map.
  Map<String, dynamic> toJson() =>
      _$SemanticTagPersonNameComponentsToJson(this);

  /// Creates a new [SemanticTagPersonNameComponents] instance from a JSON map.
  factory SemanticTagPersonNameComponents.fromJson(Map<String, dynamic> json) =>
      _$SemanticTagPersonNameComponentsFromJson(json);
}

/// A class representing the identification of a seat for a transit journey or an event.
@JsonSerializable(includeIfNull: false)
class SemanticTagSeat {
  /// Creates a new instance of the [SemanticTagSeat] class.
  /// The [seatDescription], [seatIdentifier], [seatNumber], [seatRow], [seatSection], and [seatType] parameters are optional.
  SemanticTagSeat({
    this.seatDescription,
    this.seatIdentifier,
    this.seatNumber,
    this.seatRow,
    this.seatSection,
    this.seatType,
  });

  /// A description of the seat, such as “A flat bed seat”.
  @JsonKey(name: 'seatDescription')
  final String? seatDescription;

  /// The identifier code for the seat.
  @JsonKey(name: 'seatIdentifier')
  final String? seatIdentifier;

  /// The number of the seat.
  @JsonKey(name: 'seatNumber')
  final String? seatNumber;

  /// The row that contains the seat.
  @JsonKey(name: 'seatRow')
  final String? seatRow;

  /// The section that contains the seat.
  @JsonKey(name: 'seatSection')
  final String? seatSection;

  /// The type of seat, such as “Reserved seating”.
  @JsonKey(name: 'seatType')
  final String? seatType;

  /// Converts this [SemanticTagSeat] instance to a JSON map.
  Map<String, dynamic> toJson() => _$SemanticTagSeatToJson(this);

  /// Creates a new [SemanticTagSeat] instance from a JSON map.
  factory SemanticTagSeat.fromJson(Map<String, dynamic> json) =>
      _$SemanticTagSeatFromJson(json);
}

/// A class representing the information required to connect to a WiFi network.
@JsonSerializable(includeIfNull: false)
class SemanticTagWifiNetwork {
  /// Creates a new instance of the [SemanticTagWifiNetwork] class.
  /// The [password] and [ssid] parameters are required.
  SemanticTagWifiNetwork({
    required this.password,
    required this.ssid,
  });

  /// The password for the WiFi network.
  @JsonKey(name: 'password')
  final String password;

  /// The name for the WiFi network.
  @JsonKey(name: 'ssid')
  final String ssid;

  /// Converts this [SemanticTagWifiNetwork] instance to a JSON map.
  Map<String, dynamic> toJson() => _$SemanticTagWifiNetworkToJson(this);

  /// Creates a new [SemanticTagWifiNetwork] instance from a JSON map.
  factory SemanticTagWifiNetwork.fromJson(Map<String, dynamic> json) =>
      _$SemanticTagWifiNetworkFromJson(json);
}

enum PKEventType {
  /// A generic event type.
  @JsonValue('PKEventTypeGeneric')
  generic,

  /// A live performance event type.
  @JsonValue('PKEventTypeLivePerformance')
  livePerformance,

  /// A movie event type.
  @JsonValue('PKEventTypeMovie')
  movie,

  /// A sports event type.
  @JsonValue('PKEventTypeSports')
  sports,

  /// A conference event type.
  @JsonValue('PKEventTypeConference')
  conference,

  /// A convention event type.
  @JsonValue('PKEventTypeConvention')
  convention,

  /// A workshop event type.
  @JsonValue('PKEventTypeWorkshop')
  workshop,

  /// A social gathering event type.
  @JsonValue('PKEventTypeSocialGathering')
  socialGathering,
}
