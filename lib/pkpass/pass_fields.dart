import 'package:json_annotation/json_annotation.dart';

import 'pass_field_content.dart';

part 'pass_fields.g.dart';

/// A class representing the groups of fields that display information on the front and back of a pass.
@JsonSerializable(includeIfNull: false)
class PassFields {
  /// Creates a new instance of the [PassFields] class.
  PassFields({
    this.auxiliaryFields,
    this.backFields,
    this.headerFields,
    this.primaryFields,
    this.secondaryFields,
  });

  /// An object that represents the fields that display additional information on the front of a pass.
  @JsonKey(name: 'auxiliaryFields')
  final List<PassFieldContent>? auxiliaryFields;

  /// An object that represents the fields that display information on the back of a pass.
  @JsonKey(name: 'backFields')
  final List<PassFieldContent>? backFields;

  /// An object that represents the fields that display information at the top of a pass.
  @JsonKey(name: 'headerFields')
  final List<PassFieldContent>? headerFields;

  /// An object that represents the fields that display the most important information on a pass.
  @JsonKey(name: 'primaryFields')
  final List<PassFieldContent>? primaryFields;

  /// An object that represents the fields that display supporting information on the front of a pass.
  @JsonKey(name: 'secondaryFields')
  final List<PassFieldContent>? secondaryFields;

  /// Converts this [PassFields] instance to a JSON map.
  Map<String, dynamic> toJson() => _$PassFieldsToJson(this);

  /// Creates a new [PassFields] instance from a JSON map.
  factory PassFields.fromJson(Map<String, dynamic> json) =>
      _$PassFieldsFromJson(json);
}

@JsonEnum()
enum TransitType {
  @JsonValue('PKTransitTypeAir')
  air,
  @JsonValue('PKTransitTypeBoat')
  boat,
  @JsonValue('PKTransitTypeBus')
  bus,
  @JsonValue('PKTransitTypeGeneric')
  generic,
  @JsonValue('PKTransitTypeTrain')
  train,
}

@JsonSerializable(includeIfNull: false)
class BoardingPass extends PassFields {
  BoardingPass({
    super.auxiliaryFields,
    super.backFields,
    super.headerFields,
    super.primaryFields,
    super.secondaryFields,
    required this.transitType,
  });

  /// The type of transit for a boarding pass.
  /// Possible values: PKTransitTypeAir, PKTransitTypeBoat, PKTransitTypeBus, PKTransitTypeGeneric, PKTransitTypeTrain
  final TransitType transitType;

  /// Converts this [BoardingPass] instance to a JSON map.
  @override
  Map<String, dynamic> toJson() => _$BoardingPassToJson(this);

  /// Creates a new [BoardingPass] instance from a JSON map.
  factory BoardingPass.fromJson(Map<String, dynamic> json) =>
      _$BoardingPassFromJson(json);
}

@JsonSerializable(includeIfNull: false)
class Coupon extends PassFields {
  Coupon({
    super.auxiliaryFields,
    super.backFields,
    super.headerFields,
    super.primaryFields,
    super.secondaryFields,
  });

  /// Converts this [Coupon] instance to a JSON map.
  @override
  Map<String, dynamic> toJson() => _$CouponToJson(this);

  /// Creates a new [Coupon] instance from a JSON map.
  factory Coupon.fromJson(Map<String, dynamic> json) => _$CouponFromJson(json);
}

@JsonSerializable(includeIfNull: false)
class EventTicket extends PassFields {
  EventTicket({
    super.auxiliaryFields,
    super.backFields,
    super.headerFields,
    super.primaryFields,
    super.secondaryFields,
    this.ux,
  });

  /// The user experience style for the event ticket.
  /// Set to "POSTER" for full-width poster-style event tickets introduced in iOS 17.
  @JsonKey(name: 'ux')
  final String? ux;

  /// Converts this [EventTicket] instance to a JSON map.
  @override
  Map<String, dynamic> toJson() => _$EventTicketToJson(this);

  /// Creates a new [EventTicket] instance from a JSON map.
  factory EventTicket.fromJson(Map<String, dynamic> json) =>
      _$EventTicketFromJson(json);
}

@JsonSerializable(includeIfNull: false)
class Generic extends PassFields {
  Generic({
    super.auxiliaryFields,
    super.backFields,
    super.headerFields,
    super.primaryFields,
    super.secondaryFields,
  });

  /// Converts this [Generic] instance to a JSON map.
  @override
  Map<String, dynamic> toJson() => _$GenericToJson(this);

  /// Creates a new [Generic] instance from a JSON map.
  factory Generic.fromJson(Map<String, dynamic> json) =>
      _$GenericFromJson(json);
}

@JsonSerializable(includeIfNull: false)
class StoreCard extends PassFields {
  StoreCard({
    super.auxiliaryFields,
    super.backFields,
    super.headerFields,
    super.primaryFields,
    super.secondaryFields,
  });

  /// Converts this [StoreCard] instance to a JSON map.
  @override
  Map<String, dynamic> toJson() => _$StoreCardToJson(this);

  /// Creates a new [StoreCard] instance from a JSON map.
  factory StoreCard.fromJson(Map<String, dynamic> json) =>
      _$StoreCardFromJson(json);
}
