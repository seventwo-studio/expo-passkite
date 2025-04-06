// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'semantic_tags.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SemanticTags _$SemanticTagsFromJson(Map<String, dynamic> json) => SemanticTags(
      airlineCode: json['airlineCode'] as String?,
      artistIDs: (json['artistIDs'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      awayTeamAbbreviation: json['awayTeamAbbreviation'] as String?,
      awayTeamLocation: json['awayTeamLocation'] as String?,
      awayTeamName: json['awayTeamName'] as String?,
      balance: json['balance'] == null
          ? null
          : SemanticTagCurrencyAmount.fromJson(
              json['balance'] as Map<String, dynamic>),
      boardingGroup: json['boardingGroup'] as String?,
      boardingSequenceNumber: json['boardingSequenceNumber'] as String?,
      carNumber: json['carNumber'] as String?,
      confirmationNumber: json['confirmationNumber'] as String?,
      currentArrivalDate: json['currentArrivalDate'] as String?,
      currentBoardingDate: json['currentBoardingDate'] as String?,
      currentDepartureDate: json['currentDepartureDate'] as String?,
      departureAirportCode: json['departureAirportCode'] as String?,
      departureAirportName: json['departureAirportName'] as String?,
      departureGate: json['departureGate'] as String?,
      departureLocation: json['departureLocation'] == null
          ? null
          : SemanticTagLocation.fromJson(
              json['departureLocation'] as Map<String, dynamic>),
      departureLocationDescription:
          json['departureLocationDescription'] as String?,
      departurePlatform: json['departurePlatform'] as String?,
      departureStationName: json['departureStationName'] as String?,
      departureTerminal: json['departureTerminal'] as String?,
      destinationAirportCode: json['destinationAirportCode'] as String?,
      destinationAirportName: json['destinationAirportName'] as String?,
      destinationGate: json['destinationGate'] as String?,
      destinationLocation: json['destinationLocation'] == null
          ? null
          : SemanticTagLocation.fromJson(
              json['destinationLocation'] as Map<String, dynamic>),
      destinationLocationDescription:
          json['destinationLocationDescription'] as String?,
      destinationPlatform: json['destinationPlatform'] as String?,
      destinationStationName: json['destinationStationName'] as String?,
      destinationTerminal: json['destinationTerminal'] as String?,
      duration: (json['duration'] as num?)?.toInt(),
      eventEndDate: json['eventEndDate'] as String?,
      eventName: json['eventName'] as String?,
      eventStartDate: json['eventStartDate'] as String?,
      eventType: $enumDecodeNullable(_$PKEventTypeEnumMap, json['eventType']),
      flightCode: json['flightCode'] as String?,
      flightNumber: (json['flightNumber'] as num?)?.toInt(),
      genre: json['genre'] as String?,
      homeTeamAbbreviation: json['homeTeamAbbreviation'] as String?,
      homeTeamLocation: json['homeTeamLocation'] as String?,
      homeTeamName: json['homeTeamName'] as String?,
      leagueAbbreviation: json['leagueAbbreviation'] as String?,
      leagueName: json['leagueName'] as String?,
      membershipProgramName: json['membershipProgramName'] as String?,
      membershipProgramNumber: json['membershipProgramNumber'] as String?,
      originalArrivalDate: json['originalArrivalDate'] as String?,
      originalBoardingDate: json['originalBoardingDate'] as String?,
      originalDepartureDate: json['originalDepartureDate'] as String?,
      passengerName: json['passengerName'] == null
          ? null
          : SemanticTagPersonNameComponents.fromJson(
              json['passengerName'] as Map<String, dynamic>),
      performerNames: (json['performerNames'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      priorityStatus: json['priorityStatus'] as String?,
      seats: (json['seats'] as List<dynamic>?)
          ?.map((e) => SemanticTagSeat.fromJson(e as Map<String, dynamic>))
          .toList(),
      securityScreening: json['securityScreening'] as String?,
      silenceRequested: json['silenceRequested'] as bool?,
      sportName: json['sportName'] as String?,
      totalPrice: json['totalPrice'] == null
          ? null
          : SemanticTagCurrencyAmount.fromJson(
              json['totalPrice'] as Map<String, dynamic>),
      transitProvider: json['transitProvider'] as String?,
      transitStatus: json['transitStatus'] as String?,
      transitStatusReason: json['transitStatusReason'] as String?,
      vehicleName: json['vehicleName'] as String?,
      vehicleNumber: json['vehicleNumber'] as String?,
      vehicleType: json['vehicleType'] as String?,
      venueEntrance: json['venueEntrance'] as String?,
      venueLocation: json['venueLocation'] == null
          ? null
          : SemanticTagLocation.fromJson(
              json['venueLocation'] as Map<String, dynamic>),
      venueName: json['venueName'] as String?,
      venuePhoneNumber: json['venuePhoneNumber'] as String?,
      venueRoom: json['venueRoom'] as String?,
      wifiAccess: (json['wifiAccess'] as List<dynamic>?)
          ?.map(
              (e) => SemanticTagWifiNetwork.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$SemanticTagsToJson(SemanticTags instance) =>
    <String, dynamic>{
      if (instance.airlineCode case final value?) 'airlineCode': value,
      if (instance.artistIDs case final value?) 'artistIDs': value,
      if (instance.awayTeamAbbreviation case final value?)
        'awayTeamAbbreviation': value,
      if (instance.awayTeamLocation case final value?)
        'awayTeamLocation': value,
      if (instance.awayTeamName case final value?) 'awayTeamName': value,
      if (instance.balance case final value?) 'balance': value,
      if (instance.boardingGroup case final value?) 'boardingGroup': value,
      if (instance.boardingSequenceNumber case final value?)
        'boardingSequenceNumber': value,
      if (instance.carNumber case final value?) 'carNumber': value,
      if (instance.confirmationNumber case final value?)
        'confirmationNumber': value,
      if (instance.currentArrivalDate case final value?)
        'currentArrivalDate': value,
      if (instance.currentBoardingDate case final value?)
        'currentBoardingDate': value,
      if (instance.currentDepartureDate case final value?)
        'currentDepartureDate': value,
      if (instance.departureAirportCode case final value?)
        'departureAirportCode': value,
      if (instance.departureAirportName case final value?)
        'departureAirportName': value,
      if (instance.departureGate case final value?) 'departureGate': value,
      if (instance.departureLocation case final value?)
        'departureLocation': value,
      if (instance.departureLocationDescription case final value?)
        'departureLocationDescription': value,
      if (instance.departurePlatform case final value?)
        'departurePlatform': value,
      if (instance.departureStationName case final value?)
        'departureStationName': value,
      if (instance.departureTerminal case final value?)
        'departureTerminal': value,
      if (instance.destinationAirportCode case final value?)
        'destinationAirportCode': value,
      if (instance.destinationAirportName case final value?)
        'destinationAirportName': value,
      if (instance.destinationGate case final value?) 'destinationGate': value,
      if (instance.destinationLocation case final value?)
        'destinationLocation': value,
      if (instance.destinationLocationDescription case final value?)
        'destinationLocationDescription': value,
      if (instance.destinationPlatform case final value?)
        'destinationPlatform': value,
      if (instance.destinationStationName case final value?)
        'destinationStationName': value,
      if (instance.destinationTerminal case final value?)
        'destinationTerminal': value,
      if (instance.duration case final value?) 'duration': value,
      if (instance.eventEndDate case final value?) 'eventEndDate': value,
      if (instance.eventName case final value?) 'eventName': value,
      if (instance.eventStartDate case final value?) 'eventStartDate': value,
      if (_$PKEventTypeEnumMap[instance.eventType] case final value?)
        'eventType': value,
      if (instance.flightCode case final value?) 'flightCode': value,
      if (instance.flightNumber case final value?) 'flightNumber': value,
      if (instance.genre case final value?) 'genre': value,
      if (instance.homeTeamAbbreviation case final value?)
        'homeTeamAbbreviation': value,
      if (instance.homeTeamLocation case final value?)
        'homeTeamLocation': value,
      if (instance.homeTeamName case final value?) 'homeTeamName': value,
      if (instance.leagueAbbreviation case final value?)
        'leagueAbbreviation': value,
      if (instance.leagueName case final value?) 'leagueName': value,
      if (instance.membershipProgramName case final value?)
        'membershipProgramName': value,
      if (instance.membershipProgramNumber case final value?)
        'membershipProgramNumber': value,
      if (instance.originalArrivalDate case final value?)
        'originalArrivalDate': value,
      if (instance.originalBoardingDate case final value?)
        'originalBoardingDate': value,
      if (instance.originalDepartureDate case final value?)
        'originalDepartureDate': value,
      if (instance.passengerName case final value?) 'passengerName': value,
      if (instance.performerNames case final value?) 'performerNames': value,
      if (instance.priorityStatus case final value?) 'priorityStatus': value,
      if (instance.seats case final value?) 'seats': value,
      if (instance.securityScreening case final value?)
        'securityScreening': value,
      if (instance.silenceRequested case final value?)
        'silenceRequested': value,
      if (instance.sportName case final value?) 'sportName': value,
      if (instance.totalPrice case final value?) 'totalPrice': value,
      if (instance.transitProvider case final value?) 'transitProvider': value,
      if (instance.transitStatus case final value?) 'transitStatus': value,
      if (instance.transitStatusReason case final value?)
        'transitStatusReason': value,
      if (instance.vehicleName case final value?) 'vehicleName': value,
      if (instance.vehicleNumber case final value?) 'vehicleNumber': value,
      if (instance.vehicleType case final value?) 'vehicleType': value,
      if (instance.venueEntrance case final value?) 'venueEntrance': value,
      if (instance.venueLocation case final value?) 'venueLocation': value,
      if (instance.venueName case final value?) 'venueName': value,
      if (instance.venuePhoneNumber case final value?)
        'venuePhoneNumber': value,
      if (instance.venueRoom case final value?) 'venueRoom': value,
      if (instance.wifiAccess case final value?) 'wifiAccess': value,
    };

const _$PKEventTypeEnumMap = {
  PKEventType.generic: 'PKEventTypeGeneric',
  PKEventType.livePerformance: 'PKEventTypeLivePerformance',
  PKEventType.movie: 'PKEventTypeMovie',
  PKEventType.sports: 'PKEventTypeSports',
  PKEventType.conference: 'PKEventTypeConference',
  PKEventType.convention: 'PKEventTypeConvention',
  PKEventType.workshop: 'PKEventTypeWorkshop',
  PKEventType.socialGathering: 'PKEventTypeSocialGathering',
};
