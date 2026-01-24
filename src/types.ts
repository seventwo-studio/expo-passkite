/**
 * Pass type identifiers for different kinds of passes
 */
export enum PassType {
  BoardingPass = 'boardingPass',
  Coupon = 'coupon',
  EventTicket = 'eventTicket',
  StoreCard = 'storeCard',
  Generic = 'generic',
}

/**
 * Transit type for boarding passes
 */
export enum TransitType {
  Air = 'PKTransitTypeAir',
  Boat = 'PKTransitTypeBoat',
  Bus = 'PKTransitTypeBus',
  Train = 'PKTransitTypeTrain',
  Generic = 'PKTransitTypeGeneric',
}

/**
 * Barcode format types
 */
export enum BarcodeFormat {
  QR = 'PKBarcodeFormatQR',
  PDF417 = 'PKBarcodeFormatPDF417',
  Aztec = 'PKBarcodeFormatAztec',
  Code128 = 'PKBarcodeFormatCode128',
}

/**
 * Text alignment options
 */
export enum TextAlignment {
  Left = 'PKTextAlignmentLeft',
  Center = 'PKTextAlignmentCenter',
  Right = 'PKTextAlignmentRight',
  Natural = 'PKTextAlignmentNatural',
}

/**
 * Date style for formatting
 */
export enum DateStyle {
  None = 'PKDateStyleNone',
  Short = 'PKDateStyleShort',
  Medium = 'PKDateStyleMedium',
  Long = 'PKDateStyleLong',
  Full = 'PKDateStyleFull',
}

/**
 * Number style for formatting
 */
export enum NumberStyle {
  Decimal = 'PKNumberStyleDecimal',
  Percent = 'PKNumberStylePercent',
  Scientific = 'PKNumberStyleScientific',
  SpellOut = 'PKNumberStyleSpellOut',
}

/**
 * Data detector types
 */
export enum DataDetectorType {
  PhoneNumber = 'PKDataDetectorTypePhoneNumber',
  Link = 'PKDataDetectorTypeLink',
  Address = 'PKDataDetectorTypeAddress',
  CalendarEvent = 'PKDataDetectorTypeCalendarEvent',
}

/**
 * Image types used in passes
 */
export enum PassImageType {
  Background = 'background',
  Footer = 'footer',
  Icon = 'icon',
  Logo = 'logo',
  Strip = 'strip',
  Thumbnail = 'thumbnail',
  PersonalizationLogo = 'personalizationLogo',
}

/**
 * Event type for event tickets
 */
export enum EventType {
  Generic = 'PKEventTypeGeneric',
  LivePerformance = 'PKEventTypeLivePerformance',
  Movie = 'PKEventTypeMovie',
  Sports = 'PKEventTypeSports',
  Conference = 'PKEventTypeConference',
  Convention = 'PKEventTypeConvention',
  Workshop = 'PKEventTypeWorkshop',
  SocialGathering = 'PKEventTypeSocialGathering',
}

/**
 * Upcoming pass event type for iOS 26+
 */
export enum UpcomingPassEventType {
  Event = 'event',
}

/**
 * Barcode definition
 */
export interface Barcode {
  format: BarcodeFormat;
  message: string;
  messageEncoding?: string;
  altText?: string;
}

/**
 * Location for pass relevance
 */
export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  relevantText?: string;
}

/**
 * Beacon for pass relevance
 */
export interface Beacon {
  proximityUUID: string;
  major?: number;
  minor?: number;
  relevantText?: string;
}

/**
 * NFC payload configuration
 */
export interface NFC {
  message: string;
  encryptionPublicKey?: string;
  requiresAuthentication?: boolean;
}

/**
 * Pass field content (individual field in a pass)
 */
export interface PassFieldContent {
  key: string;
  value: string | number | Date;
  label?: string;
  changeMessage?: string;
  textAlignment?: TextAlignment;
  attributedValue?: string;

  // Date formatting
  dateStyle?: DateStyle;
  timeStyle?: DateStyle;
  isRelative?: boolean;
  ignoresTimeZone?: boolean;

  // Number formatting
  numberStyle?: NumberStyle;
  currencyCode?: string;

  // Data detectors
  dataDetectorTypes?: DataDetectorType[];

  // Semantic tags
  semantics?: SemanticTagValue;
}

/**
 * Pass fields structure for different pass regions
 */
export interface PassFields {
  headerFields?: PassFieldContent[];
  primaryFields?: PassFieldContent[];
  secondaryFields?: PassFieldContent[];
  auxiliaryFields?: PassFieldContent[];
  backFields?: PassFieldContent[];

  // Boarding pass specific
  transitType?: TransitType;
}

/**
 * Relevant date range (iOS 17+)
 */
export interface RelevantDate {
  startDate?: Date;
  endDate?: Date;
}

/**
 * Personalization field for user input
 */
export interface PersonalizationField {
  type: 'name' | 'postalCode' | 'emailAddress' | 'phoneNumber';
  description: string;
}

/**
 * Personalization configuration
 */
export interface Personalization {
  requiredPersonalizationFields: PersonalizationField[];
  description?: string;
  termsAndConditions?: string;
}

/**
 * Upcoming pass event for iOS 26+
 */
export interface UpcomingPassEvent {
  type: UpcomingPassEventType;
  identifier: string;
  displayName: string;
  eventDate: string;
  isActive?: boolean;
  venuePlaceID?: string;
  additionalInfoFields?: PassFieldContent[];
  backFields?: PassFieldContent[];
  semantics?: SemanticTagValue;
}

/**
 * Pass URLs for iOS 26+
 */
export interface PassURLs {
  appLaunchURL?: string;
}

/**
 * Semantic tag values for machine-readable metadata
 */
export interface SemanticTagValue {
  // Common
  balance?: { amount: string; currencyCode: string };

  // Boarding pass
  airlineCode?: string;
  boardingGroup?: string;
  boardingSequenceNumber?: string;
  confirmationNumber?: string;
  currentArrivalDate?: string;
  currentBoardingDate?: string;
  currentDepartureDate?: string;
  departureAirportCode?: string;
  departureAirportName?: string;
  departureGate?: string;
  departureTerminal?: string;
  destinationAirportCode?: string;
  destinationAirportName?: string;
  destinationGate?: string;
  destinationTerminal?: string;
  flightCode?: string;
  flightNumber?: number;
  originalArrivalDate?: string;
  originalBoardingDate?: string;
  originalDepartureDate?: string;
  passengerName?: { familyName?: string; givenName?: string };
  priorityStatus?: string;
  securityScreening?: string;

  // iOS 26+ Boarding Pass SSRs
  passengerServiceSSRs?: string[];

  // iOS 26+ Custom Badge Fields
  internationalDocumentsVerifiedText?: string;
  membershipTierStatusText?: string;
  priorityStatusText?: string;
  fareClassText?: string;

  // Transit
  transitProvider?: string;
  transitStatus?: string;
  transitStatusReason?: string;
  vehicleName?: string;
  vehicleNumber?: string;
  vehicleType?: string;

  // Event
  artistIDs?: string[];
  awayTeamAbbreviation?: string;
  awayTeamLocation?: string;
  awayTeamName?: string;
  eventEndDate?: string;
  eventName?: string;
  eventStartDate?: string;
  eventType?: EventType;
  genre?: string;
  homeTeamAbbreviation?: string;
  homeTeamLocation?: string;
  homeTeamName?: string;
  leagueAbbreviation?: string;
  leagueName?: string;
  performerNames?: string[];
  sportName?: string;
  venueEntrance?: string;
  venueName?: string;
  venuePhoneNumber?: string;
  venueRoom?: string;

  // Seat
  seats?: Array<{
    seatDescription?: string;
    seatIdentifier?: string;
    seatNumber?: string;
    seatRow?: string;
    seatSection?: string;
    seatType?: string;
  }>;

  // Store card
  membershipProgramName?: string;
  membershipProgramNumber?: string;

  // Coupon
  silenceRequested?: boolean;

  // Wifi
  wifiAccess?: Array<{
    password: string;
    ssid: string;
  }>;
}

/**
 * Image asset for pass
 */
export interface PassImage {
  type: PassImageType;
  data: Buffer | Uint8Array;
  scale?: 1 | 2 | 3;
}

/**
 * Main pass data structure
 */
export interface PassData {
  // Required fields
  formatVersion?: number;
  passTypeIdentifier: string;
  serialNumber: string;
  teamIdentifier: string;
  organizationName: string;
  description: string;

  // Visual appearance
  foregroundColor?: string;
  backgroundColor?: string;
  labelColor?: string;
  logoText?: string;

  // Web service
  webServiceURL?: string;
  authenticationToken?: string;

  // Relevance
  locations?: Location[];
  relevantDate?: string;
  relevantDates?: RelevantDate[];
  maxDistance?: number;
  beacons?: Beacon[];

  // Expiration
  expirationDate?: string;
  voided?: boolean;

  // Grouping
  groupingIdentifier?: string;

  // Associated apps
  associatedStoreIdentifiers?: number[];
  appLaunchURL?: string;

  // iOS 26+ URLs and upcoming pass information
  urls?: PassURLs;
  upcomingPassInformation?: UpcomingPassEvent[];

  // User info
  userInfo?: Record<string, unknown>;

  // NFC
  nfc?: NFC;

  // Sharing
  sharingProhibited?: boolean;

  // Barcodes
  barcodes?: Barcode[];
  barcode?: Barcode; // Legacy single barcode

  // Semantic tags
  semantics?: SemanticTagValue;

  // Pass structure (one of these must be present)
  boardingPass?: PassFields;
  coupon?: PassFields;
  eventTicket?: PassFields;
  storeCard?: PassFields;
  generic?: PassFields;
}

/**
 * Signing credentials for pass
 */
export interface SigningCredentials {
  wwdrCertificate: string | Buffer;
  signerCertificate: string | Buffer;
  signerKey: string | Buffer;
  signerKeyPassphrase?: string;
}

/**
 * Options for pass generation
 */
export interface PassGenerationOptions {
  skipSignature?: boolean;
}

/**
 * Result of adding pass to wallet
 */
export interface AddPassResult {
  success: boolean;
  error?: string;
}

/**
 * Native module interface
 */
export interface ExpoPasskiteModuleInterface {
  addPassToWallet(passData: string): Promise<AddPassResult>;
  canAddPasses(): Promise<boolean>;
  isPassLibraryAvailable(): Promise<boolean>;
  containsPass(passTypeIdentifier: string, serialNumber: string): Promise<boolean>;
}
