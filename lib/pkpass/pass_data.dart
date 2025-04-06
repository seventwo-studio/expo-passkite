import 'package:json_annotation/json_annotation.dart';
import 'package:passkite/pkpass/pass_fields.dart';

import 'barcode.dart';
import 'beacon.dart';
import 'location.dart';
import 'nfc.dart';
import 'relevant_date.dart';
import 'semantic_tags.dart';

part 'pass_data.g.dart';

@JsonSerializable(includeIfNull: false)
class PassData {
  PassData({
    this.appLaunchURL,
    this.associatedStoreIdentifiers,
    this.authenticationToken,
    this.backgroundColor,
    this.barcodes,
    this.beacons,
    this.boardingPass,
    this.coupon,
    required this.description,
    this.eventTicket,
    this.expirationDate,
    this.foregroundColor,
    this.formatVersion = 1,
    this.generic,
    this.groupingIdentifier,
    this.labelColor,
    this.locations,
    this.logoText,
    this.maxDistance,
    this.nfc,
    required this.organizationName,
    required this.passTypeIdentifier,
    this.relevantDate,
    this.relevantDates,
    this.semantics,
    required this.serialNumber,
    this.sharingProhibited,
    this.storeCard,
    this.suppressStripShine,
    required this.teamIdentifier,
    this.userInfo,
    this.voided,
    this.webServiceURL,
  });

  /// A URL the system passes to the associated app from associatedStoreIdentifiers during launch.
  @JsonKey(name: 'appLaunchURL')
  final String? appLaunchURL;

  /// An array of App Store identifiers for apps associated with the pass.
  @JsonKey(name: 'associatedStoreIdentifiers')
  final List<int>? associatedStoreIdentifiers;

  /// The authentication token to use with the web service in the webServiceURL key.
  @JsonKey(name: 'authenticationToken')
  final String? authenticationToken;

  /// A background color for the pass, specified as a CSS-style RGB triple.
  @JsonKey(name: 'backgroundColor')
  final String? backgroundColor;

  /// An array of objects that represent possible barcodes on a pass.
  @JsonKey(name: 'barcodes')
  final List<Barcode>? barcodes;

  /// An array of objects that represents the identity of Bluetooth Low Energy beacons the system uses to show a relevant pass.
  @JsonKey(name: 'beacons')
  final List<Beacon>? beacons;

  /// An object that contains the information for a boarding pass.
  @JsonKey(name: 'boardingPass')
  final BoardingPass? boardingPass;

  /// An object that contains the information for a coupon.
  @JsonKey(name: 'coupon')
  final Coupon? coupon;

  /// (Required) A short description that iOS accessibility technologies use for a pass.
  @JsonKey(name: 'description')
  final String description;

  /// An object that contains the information for an event ticket.
  @JsonKey(name: 'eventTicket')
  final EventTicket? eventTicket;

  /// The date and time the pass expires.
  @JsonKey(name: 'expirationDate')
  final String? expirationDate;

  /// A foreground color for the pass, specified as a CSS-style RGB triple.
  @JsonKey(name: 'foregroundColor')
  final String? foregroundColor;

  /// (Required) The version of the file format. The value must be 1.
  @JsonKey(name: 'formatVersion')
  final int formatVersion;

  /// An object that contains the information for a generic pass.
  @JsonKey(name: 'generic')
  final Generic? generic;

  /// An identifier the system uses to group related boarding passes or event tickets.
  @JsonKey(name: 'groupingIdentifier')
  final String? groupingIdentifier;

  /// A color for the label text of the pass, specified as a CSS-style RGB triple.
  @JsonKey(name: 'labelColor')
  final String? labelColor;

  /// An array of up to 10 objects that represent geographic locations the system uses to show a relevant pass.
  @JsonKey(name: 'locations')
  final List<Location>? locations;

  /// The text to display next to the logo on the pass.
  @JsonKey(name: 'logoText')
  final String? logoText;

  /// The maximum distance, in meters, from a location in the locations array at which the pass is relevant.
  @JsonKey(name: 'maxDistance')
  final int? maxDistance;

  /// An object that contains the information to use for Value Added Service Protocol transactions.
  @JsonKey(name: 'nfc')
  final NFC? nfc;

  /// (Required) The name of the organization.
  @JsonKey(name: 'organizationName')
  final String organizationName;

  /// (Required) The pass type identifier that's registered with Apple.
  @JsonKey(name: 'passTypeIdentifier')
  final String passTypeIdentifier;

  /// The date and time when the pass becomes relevant as a W3C timestamp.
  @JsonKey(name: 'relevantDate')
  final String? relevantDate;

  /// An array of objects that contain multiple relevant dates or date ranges for the pass.
  /// This is the newer iOS 17+ alternative to the single relevantDate field.
  /// Each entry can have either a single relevantDate or a startDate and endDate.
  @JsonKey(name: 'relevantDates')
  final List<RelevantDate>? relevantDates;

  /// An object that contains machine-readable metadata the system uses to offer a pass and suggest related actions.
  @JsonKey(name: 'semantics')
  final SemanticTags? semantics;

  /// (Required) An alphanumeric serial number. The combination of the serial number and pass type identifier must be unique for each pass.
  @JsonKey(name: 'serialNumber')
  final String serialNumber;

  /// A Boolean value that controls whether to show the Share button on the back of a pass.
  @JsonKey(name: 'sharingProhibited')
  final bool? sharingProhibited;

  /// An object that contains the information for a store card.
  @JsonKey(name: 'storeCard')
  final StoreCard? storeCard;

  /// A Boolean value that controls whether to display the strip image without a shine effect.
  @JsonKey(name: 'suppressStripShine')
  final bool? suppressStripShine;

  /// (Required) The Team ID for the Apple Developer Program account that registered the pass type identifier.
  @JsonKey(name: 'teamIdentifier')
  final String teamIdentifier;

  /// A JSON dictionary that contains any custom information for companion apps.
  @JsonKey(name: 'userInfo')
  final Map<String, dynamic>? userInfo;

  /// A Boolean value that indicates that the pass is void.
  @JsonKey(name: 'voided')
  final bool? voided;

  /// The URL for a web service that you use to update or personalize the pass.
  @JsonKey(name: 'webServiceURL')
  final String? webServiceURL;

  factory PassData.fromJson(Map<String, dynamic> json) =>
      _$PassDataFromJson(json);
  Map<String, dynamic> toJson() => _$PassDataToJson(this);
}
