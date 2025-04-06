import 'package:json_annotation/json_annotation.dart';
import 'semantic_tag_type.dart';

part 'semantic_tags.g.dart';

/// An object that contains machine-readable metadata the system uses to offer a pass and suggest related actions.
@JsonSerializable(includeIfNull: false)
class SemanticTags {
  /// The IATA airline code, such as “EX” for flightCode “EX123”. Use this key only for airline boarding passes.
  @JsonKey(name: 'airlineCode')
  final String? airlineCode;

  /// An array of the Apple Music persistent ID for each artist performing at the event, in decreasing order of significance.
  /// Use this key for any type of event ticket.
  @JsonKey(name: 'artistIDs')
  final List<String>? artistIDs;

  /// The unique abbreviation of the away team’s name. Use this key only for a sports event ticket.
  @JsonKey(name: 'awayTeamAbbreviation')
  final String? awayTeamAbbreviation;

  /// The home location of the away team. Use this key only for a sports event ticket.
  @JsonKey(name: 'awayTeamLocation')
  final String? awayTeamLocation;

  /// The name of the away team. Use this key only for a sports event ticket.
  @JsonKey(name: 'awayTeamName')
  final String? awayTeamName;

  /// The current balance redeemable with the pass. Use this key only for a store card pass.
  @JsonKey(name: 'balance')
  final SemanticTagCurrencyAmount? balance;

  /// A group number for boarding. Use this key for any type of boarding pass.
  @JsonKey(name: 'boardingGroup')
  final String? boardingGroup;

  /// A sequence number for boarding. Use this key for any type of boarding pass.
  @JsonKey(name: 'boardingSequenceNumber')
  final String? boardingSequenceNumber;

  /// The number of the passenger car. Use this key only for a train or other rail boarding pass.
  @JsonKey(name: 'carNumber')
  final String? carNumber;

  /// A booking or reservation confirmation number. Use this key for any type of boarding pass.
  @JsonKey(name: 'confirmationNumber')
  final String? confirmationNumber;

  /// The updated date and time of arrival, if different from the originally scheduled date and time. Use this key for any type of boarding pass.
  @JsonKey(name: 'currentArrivalDate')
  final String? currentArrivalDate;

  /// The updated date and time of boarding, if different from the originally scheduled date and time. Use this key for any type of boarding pass.
  @JsonKey(name: 'currentBoardingDate')
  final String? currentBoardingDate;

  /// The updated departure date and time, if different from the originally scheduled date and time. Use this key for any type of boarding pass.
  @JsonKey(name: 'currentDepartureDate')
  final String? currentDepartureDate;

  /// The IATA airport code for the departure airport, such as “MPM” or “LHR”. Use this key only for airline boarding passes.
  @JsonKey(name: 'departureAirportCode')
  final String? departureAirportCode;

  /// The full name of the departure airport, such as “Maputo International Airport”. Use this key only for airline boarding passes.
  @JsonKey(name: 'departureAirportName')
  final String? departureAirportName;

  /// The gate number or letters of the departure gate, such as “1A”. Do not include the word “Gate.”
  @JsonKey(name: 'departureGate')
  final String? departureGate;

  /// An object that represents the geographic coordinates of the transit departure location, suitable for display on a map.
  /// Use this key for any type of boarding pass.
  @JsonKey(name: 'departureLocation')
  final SemanticTagLocation? departureLocation;

  /// A brief description of the departure location. Use this key for any type of boarding pass.
  @JsonKey(name: 'departureLocationDescription')
  final String? departureLocationDescription;

  /// The name of the departure platform, such as “A”. Don’t include the word “Platform.” Use this key only for a train or other rail boarding pass.
  @JsonKey(name: 'departurePlatform')
  final String? departurePlatform;

  /// The name of the departure station, such as “1st Street Station”. Use this key only for a train or other rail boarding pass.
  @JsonKey(name: 'departureStationName')
  final String? departureStationName;

  /// The name or letter of the departure terminal, such as “A”. Don’t include the word “Terminal.” Use this key only for airline boarding passes.
  @JsonKey(name: 'departureTerminal')
  final String? departureTerminal;

  /// The IATA airport code for the destination airport, such as “MPM” or “LHR”. Use this key only for airline boarding passes.
  @JsonKey(name: 'destinationAirportCode')
  final String? destinationAirportCode;

  /// The full name of the destination airport, such as “London Heathrow”. Use this key only for airline boarding passes.
  @JsonKey(name: 'destinationAirportName')
  final String? destinationAirportName;

  /// The gate number or letter of the destination gate, such as “1A”. Don’t include the word “Gate.” Use this key only for airline boarding passes.
  @JsonKey(name: 'destinationGate')
  final String? destinationGate;

  /// An object that represents the geographic coordinates of the transit departure location, suitable for display on a map.
  /// Use this key for any type of boarding pass.
  @JsonKey(name: 'destinationLocation')
  final SemanticTagLocation? destinationLocation;

  /// A brief description of the destination location. Use this key for any type of boarding pass.
  @JsonKey(name: 'destinationLocationDescription')
  final String? destinationLocationDescription;

  /// The name of the destination platform, such as “A”. Don’t include the word “Platform.” Use this key only for a train or other rail boarding pass.
  @JsonKey(name: 'destinationPlatform')
  final String? destinationPlatform;

  /// The name of the destination station, such as “1st Street Station”. Use this key only for a train or other rail boarding pass.
  @JsonKey(name: 'destinationStationName')
  final String? destinationStationName;

  /// The terminal name or letter of the destination terminal, such as “A”. Don’t include the word “Terminal.” Use this key only for airline boarding passes.
  @JsonKey(name: 'destinationTerminal')
  final String? destinationTerminal;

  /// The duration of the event or transit journey, in seconds. Use this key for any type of boarding pass and any type of event ticket.
  @JsonKey(name: 'duration')
  final int? duration;

  /// The date and time the event ends. Use this key for any type of event ticket.
  @JsonKey(name: 'eventEndDate')
  final String? eventEndDate;

  /// The full name of the event, such as the title of a movie. Use this key for any type of event ticket.
  @JsonKey(name: 'eventName')
  final String? eventName;

  /// The date and time the event starts. Use this key for any type of event ticket.
  @JsonKey(name: 'eventStartDate')
  final String? eventStartDate;

  /// The type of event. Use this key for any type of event ticket.
  @JsonKey(name: 'eventType')
  final PKEventType? eventType;

  /// The IATA flight code, such as “EX123”. Use this key only for airline boarding passes.
  @JsonKey(name: 'flightCode')
  final String? flightCode;

  /// The numeric portion of the IATA flight code, such as 123 for flightCode “EX123”. Use this key only for airline boarding passes.
  @JsonKey(name: 'flightNumber')
  final int? flightNumber;

  /// The genre of the performance, such as “Classical”. Use this key for any type of event ticket.
  @JsonKey(name: 'genre')
  final String? genre;

  /// The unique abbreviation of the home team’s name. Use this key only for a sports event ticket.
  @JsonKey(name: 'homeTeamAbbreviation')
  final String? homeTeamAbbreviation;

  /// The home location of the home team. Use this key only for a sports event ticket.
  @JsonKey(name: 'homeTeamLocation')
  final String? homeTeamLocation;

  /// The name of the home team. Use this key only for a sports event ticket.
  @JsonKey(name: 'homeTeamName')
  final String? homeTeamName;

  /// The abbreviated league name for a sports event. Use this key only for a sports event ticket.
  @JsonKey(name: 'leagueAbbreviation')
  final String? leagueAbbreviation;

  /// The unabbreviated league name for a sports event. Use this key only for a sports event ticket.
  @JsonKey(name: 'leagueName')
  final String? leagueName;

  /// The name of a frequent flyer or loyalty program. Use this key for any type of boarding pass.
  @JsonKey(name: 'membershipProgramName')
  final String? membershipProgramName;

  /// The ticketed passenger’s frequent flyer or loyalty number. Use this key for any type of boarding pass.
  @JsonKey(name: 'membershipProgramNumber')
  final String? membershipProgramNumber;

  /// The originally scheduled date and time of arrival. Use this key for any type of boarding pass.
  @JsonKey(name: 'originalArrivalDate')
  final String? originalArrivalDate;

  /// The originally scheduled date and time of boarding. Use this key for any type of boarding pass.
  @JsonKey(name: 'originalBoardingDate')
  final String? originalBoardingDate;

  /// The originally scheduled date and time of departure. Use this key for any type of boarding pass.
  @JsonKey(name: 'originalDepartureDate')
  final String? originalDepartureDate;

  /// An object that represents the name of the passenger. Use this key for any type of boarding pass.
  @JsonKey(name: 'passengerName')
  final SemanticTagPersonNameComponents? passengerName;

  /// An array of the full names of the performers and opening acts at the event, in decreasing order of significance. Use this key for any type of event ticket.
  @JsonKey(name: 'performerNames')
  final List<String>? performerNames;

  /// The priority status the ticketed passenger holds, such as “Gold” or “Silver”. Use this key for any type of boarding pass.
  @JsonKey(name: 'priorityStatus')
  final String? priorityStatus;

  /// An array of objects that represent the details for each seat at an event or on a transit journey. Use this key for any type of boarding pass or event ticket.
  @JsonKey(name: 'seats')
  final List<SemanticTagSeat>? seats;

  /// The type of security screening for the ticketed passenger, such as “Priority”. Use this key for any type of boarding pass.
  @JsonKey(name: 'securityScreening')
  final String? securityScreening;

  /// A Boolean value that determines whether the user’s device remains silent during an event or transit journey. Use this key for any type of boarding pass or event ticket.
  @JsonKey(name: 'silenceRequested')
  final bool? silenceRequested;

  /// The commonly used name of the sport. Use this key only for a sports event ticket.
  @JsonKey(name: 'sportName')
  final String? sportName;

  /// The total price for the pass. Use this key for any pass type.
  @JsonKey(name: 'totalPrice')
  final SemanticTagCurrencyAmount? totalPrice;

  /// The name of the transit company. Use this key for any type of boarding pass.
  @JsonKey(name: 'transitProvider')
  final String? transitProvider;

  /// A brief description of the current boarding status for the vessel, such as “On Time” or “Delayed”. Use this key for any type of boarding pass.
  @JsonKey(name: 'transitStatus')
  final String? transitStatus;

  /// A brief description that explains the reason for the current transitStatus, such as “Thunderstorms”. Use this key for any type of boarding pass.
  @JsonKey(name: 'transitStatusReason')
  final String? transitStatusReason;

  /// The name of the vehicle to board, such as the name of a boat. Use this key for any type of boarding pass.
  @JsonKey(name: 'vehicleName')
  final String? vehicleName;

  /// The identifier of the vehicle to board, such as the aircraft registration number or train number. Use this key for any type of boarding pass.
  @JsonKey(name: 'vehicleNumber')
  final String? vehicleNumber;

  /// A brief description of the type of vehicle to board, such as the model and manufacturer of a plane or the class of a boat. Use this key for any type of boarding pass.
  @JsonKey(name: 'vehicleType')
  final String? vehicleType;

  /// The full name of the entrance, such as “Gate A”, to use to gain access to the ticketed event. Use this key for any type of event ticket.
  @JsonKey(name: 'venueEntrance')
  final String? venueEntrance;

  /// An object that represents the geographic coordinates of the venue. Use this key for any type of event ticket.
  @JsonKey(name: 'venueLocation')
  final SemanticTagLocation? venueLocation;

  /// The full name of the venue. Use this key for any type of event ticket.
  @JsonKey(name: 'venueName')
  final String? venueName;

  /// The phone number for enquiries about the venue’s ticketed event. Use this key for any type of event ticket.
  @JsonKey(name: 'venuePhoneNumber')
  final String? venuePhoneNumber;

  /// The full name of the room where the ticketed event is to take place. Use this key for any type of event ticket.
  @JsonKey(name: 'venueRoom')
  final String? venueRoom;

  /// An array of objects that represent the WiFi networks associated with the event; for example, the network name and password associated with a developer conference. Use this key for any type of pass.
  @JsonKey(name: 'wifiAccess')
  final List<SemanticTagWifiNetwork>? wifiAccess;

  SemanticTags({
    this.airlineCode,
    this.artistIDs,
    this.awayTeamAbbreviation,
    this.awayTeamLocation,
    this.awayTeamName,
    this.balance,
    this.boardingGroup,
    this.boardingSequenceNumber,
    this.carNumber,
    this.confirmationNumber,
    this.currentArrivalDate,
    this.currentBoardingDate,
    this.currentDepartureDate,
    this.departureAirportCode,
    this.departureAirportName,
    this.departureGate,
    this.departureLocation,
    this.departureLocationDescription,
    this.departurePlatform,
    this.departureStationName,
    this.departureTerminal,
    this.destinationAirportCode,
    this.destinationAirportName,
    this.destinationGate,
    this.destinationLocation,
    this.destinationLocationDescription,
    this.destinationPlatform,
    this.destinationStationName,
    this.destinationTerminal,
    this.duration,
    this.eventEndDate,
    this.eventName,
    this.eventStartDate,
    this.eventType,
    this.flightCode,
    this.flightNumber,
    this.genre,
    this.homeTeamAbbreviation,
    this.homeTeamLocation,
    this.homeTeamName,
    this.leagueAbbreviation,
    this.leagueName,
    this.membershipProgramName,
    this.membershipProgramNumber,
    this.originalArrivalDate,
    this.originalBoardingDate,
    this.originalDepartureDate,
    this.passengerName,
    this.performerNames,
    this.priorityStatus,
    this.seats,
    this.securityScreening,
    this.silenceRequested,
    this.sportName,
    this.totalPrice,
    this.transitProvider,
    this.transitStatus,
    this.transitStatusReason,
    this.vehicleName,
    this.vehicleNumber,
    this.vehicleType,
    this.venueEntrance,
    this.venueLocation,
    this.venueName,
    this.venuePhoneNumber,
    this.venueRoom,
    this.wifiAccess,
  });

  factory SemanticTags.fromJson(Map<String, dynamic> json) =>
      _$SemanticTagsFromJson(json);
  Map<String, dynamic> toJson() => _$SemanticTagsToJson(this);
}
