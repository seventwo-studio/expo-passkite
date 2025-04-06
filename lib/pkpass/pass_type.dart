import 'package:json_annotation/json_annotation.dart';

/// Enum representing the different types of passes available.
///
/// The available pass types are:
///
/// - `boardingPass`: Represents a boarding pass for travel.
/// - `coupon`: Represents a coupon for discounts or offers.
/// - `eventTicket`: Represents a ticket for an event.
/// - `storeCard`: Represents a store card for loyalty programs.
/// - `generic`: Represents a generic pass type.
enum PassType {
  @JsonValue('boarding_pass')
  boardingPass,
  @JsonValue('coupon')
  coupon,
  @JsonValue('event_ticket')
  eventTicket,
  @JsonValue('store_card')
  storeCard,
  @JsonValue('generic')
  generic,
}
