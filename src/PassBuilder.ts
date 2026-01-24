import {
  PassData,
  PassFields,
  PassFieldContent,
  PassType,
  TransitType,
  Barcode,
  BarcodeFormat,
  Location,
  Beacon,
  NFC,
  PassImage,
  PassImageType,
  SemanticTagValue,
  Personalization,
  RelevantDate,
  UpcomingPassEvent,
  UpcomingPassEventType,
  PassURLs,
} from './types';

/**
 * Builder class for constructing pass data
 */
export class PassBuilder {
  private data: Partial<PassData> = {
    formatVersion: 1,
  };
  private images: PassImage[] = [];
  private passType: PassType = PassType.Generic;
  private fields: PassFields = {};
  private personalization?: Personalization;

  /**
   * Set required pass identifiers
   */
  setIdentifiers(options: {
    passTypeIdentifier: string;
    serialNumber: string;
    teamIdentifier: string;
  }): this {
    this.data.passTypeIdentifier = options.passTypeIdentifier;
    this.data.serialNumber = options.serialNumber;
    this.data.teamIdentifier = options.teamIdentifier;
    return this;
  }

  /**
   * Set organization info
   */
  setOrganization(options: {
    organizationName: string;
    description: string;
    logoText?: string;
  }): this {
    this.data.organizationName = options.organizationName;
    this.data.description = options.description;
    if (options.logoText) {
      this.data.logoText = options.logoText;
    }
    return this;
  }

  /**
   * Set visual appearance colors
   */
  setColors(options: {
    foregroundColor?: string;
    backgroundColor?: string;
    labelColor?: string;
  }): this {
    if (options.foregroundColor) {
      this.data.foregroundColor = options.foregroundColor;
    }
    if (options.backgroundColor) {
      this.data.backgroundColor = options.backgroundColor;
    }
    if (options.labelColor) {
      this.data.labelColor = options.labelColor;
    }
    return this;
  }

  /**
   * Set the pass type
   */
  setPassType(type: PassType, transitType?: TransitType): this {
    this.passType = type;
    if (type === PassType.BoardingPass && transitType) {
      this.fields.transitType = transitType;
    }
    return this;
  }

  /**
   * Add a barcode
   */
  addBarcode(barcode: Barcode): this {
    if (!this.data.barcodes) {
      this.data.barcodes = [];
    }
    this.data.barcodes.push({
      ...barcode,
      messageEncoding: barcode.messageEncoding || 'iso-8859-1',
    });
    return this;
  }

  /**
   * Convenience method to add a QR code
   */
  addQRCode(message: string, altText?: string): this {
    return this.addBarcode({
      format: BarcodeFormat.QR,
      message,
      altText,
    });
  }

  /**
   * Add header field
   */
  addHeaderField(field: PassFieldContent): this {
    if (!this.fields.headerFields) {
      this.fields.headerFields = [];
    }
    this.fields.headerFields.push(field);
    return this;
  }

  /**
   * Add primary field
   */
  addPrimaryField(field: PassFieldContent): this {
    if (!this.fields.primaryFields) {
      this.fields.primaryFields = [];
    }
    this.fields.primaryFields.push(field);
    return this;
  }

  /**
   * Add secondary field
   */
  addSecondaryField(field: PassFieldContent): this {
    if (!this.fields.secondaryFields) {
      this.fields.secondaryFields = [];
    }
    this.fields.secondaryFields.push(field);
    return this;
  }

  /**
   * Add auxiliary field
   */
  addAuxiliaryField(field: PassFieldContent): this {
    if (!this.fields.auxiliaryFields) {
      this.fields.auxiliaryFields = [];
    }
    this.fields.auxiliaryFields.push(field);
    return this;
  }

  /**
   * Add back field
   */
  addBackField(field: PassFieldContent): this {
    if (!this.fields.backFields) {
      this.fields.backFields = [];
    }
    this.fields.backFields.push(field);
    return this;
  }

  /**
   * Add a location for pass relevance
   */
  addLocation(location: Location): this {
    if (!this.data.locations) {
      this.data.locations = [];
    }
    this.data.locations.push(location);
    return this;
  }

  /**
   * Add a beacon for pass relevance
   */
  addBeacon(beacon: Beacon): this {
    if (!this.data.beacons) {
      this.data.beacons = [];
    }
    this.data.beacons.push(beacon);
    return this;
  }

  /**
   * Set relevant date (when pass should be suggested)
   */
  setRelevantDate(date: Date | string): this {
    if (date instanceof Date) {
      this.data.relevantDate = date.toISOString();
    } else {
      this.data.relevantDate = date;
    }
    return this;
  }

  /**
   * Set relevant date range (iOS 17+)
   */
  setRelevantDates(dates: RelevantDate[]): this {
    this.data.relevantDates = dates;
    return this;
  }

  /**
   * Set expiration date
   */
  setExpirationDate(date: Date | string): this {
    if (date instanceof Date) {
      this.data.expirationDate = date.toISOString();
    } else {
      this.data.expirationDate = date;
    }
    return this;
  }

  /**
   * Mark pass as voided
   */
  setVoided(voided: boolean): this {
    this.data.voided = voided;
    return this;
  }

  /**
   * Set web service for updates
   */
  setWebService(options: {
    webServiceURL: string;
    authenticationToken: string;
  }): this {
    this.data.webServiceURL = options.webServiceURL;
    this.data.authenticationToken = options.authenticationToken;
    return this;
  }

  /**
   * Set NFC payload
   */
  setNFC(nfc: NFC): this {
    this.data.nfc = nfc;
    return this;
  }

  /**
   * Set associated store identifiers
   */
  setAssociatedApps(options: {
    storeIdentifiers?: number[];
    appLaunchURL?: string;
  }): this {
    if (options.storeIdentifiers) {
      this.data.associatedStoreIdentifiers = options.storeIdentifiers;
    }
    if (options.appLaunchURL) {
      this.data.appLaunchURL = options.appLaunchURL;
    }
    return this;
  }

  /**
   * Set grouping identifier
   */
  setGroupingIdentifier(identifier: string): this {
    this.data.groupingIdentifier = identifier;
    return this;
  }

  /**
   * Set maximum distance for location relevance
   */
  setMaxDistance(distance: number): this {
    this.data.maxDistance = distance;
    return this;
  }

  /**
   * Set sharing prohibition
   */
  setSharingProhibited(prohibited: boolean): this {
    this.data.sharingProhibited = prohibited;
    return this;
  }

  /**
   * Set semantic tags for machine-readable metadata
   */
  setSemanticTags(tags: SemanticTagValue): this {
    this.data.semantics = tags;
    return this;
  }

  /**
   * Set user info (custom data)
   */
  setUserInfo(info: Record<string, unknown>): this {
    this.data.userInfo = info;
    return this;
  }

  /**
   * Add an image to the pass
   */
  addImage(image: PassImage): this {
    this.images.push(image);
    return this;
  }

  /**
   * Set personalization (for NFC-enabled store cards)
   */
  setPersonalization(personalization: Personalization): this {
    this.personalization = personalization;
    return this;
  }

  /**
   * Add an upcoming pass event (iOS 26+ multi-event tickets)
   */
  addUpcomingPassEvent(event: {
    identifier: string;
    displayName: string;
    eventDate: Date | string;
    isActive?: boolean;
    venuePlaceID?: string;
    additionalInfoFields?: PassFieldContent[];
    backFields?: PassFieldContent[];
    semantics?: SemanticTagValue;
  }): this {
    if (!this.data.upcomingPassInformation) {
      this.data.upcomingPassInformation = [];
    }
    const eventData: UpcomingPassEvent = {
      type: UpcomingPassEventType.Event,
      identifier: event.identifier,
      displayName: event.displayName,
      eventDate: event.eventDate instanceof Date
        ? event.eventDate.toISOString()
        : event.eventDate,
    };
    if (event.isActive !== undefined) {
      eventData.isActive = event.isActive;
    }
    if (event.venuePlaceID) {
      eventData.venuePlaceID = event.venuePlaceID;
    }
    if (event.additionalInfoFields) {
      eventData.additionalInfoFields = event.additionalInfoFields;
    }
    if (event.backFields) {
      eventData.backFields = event.backFields;
    }
    if (event.semantics) {
      eventData.semantics = event.semantics;
    }
    this.data.upcomingPassInformation.push(eventData);
    return this;
  }

  /**
   * Set URLs for pass actions (iOS 26+)
   */
  setURLs(urls: PassURLs): this {
    this.data.urls = urls;
    return this;
  }

  /**
   * Add a passenger service SSR code (iOS 26+ boarding pass badges)
   */
  addPassengerServiceSSR(ssrCode: string): this {
    if (!this.data.semantics) {
      this.data.semantics = {};
    }
    if (!this.data.semantics.passengerServiceSSRs) {
      this.data.semantics.passengerServiceSSRs = [];
    }
    this.data.semantics.passengerServiceSSRs.push(ssrCode);
    return this;
  }

  /**
   * Set custom badge fields for boarding passes (iOS 26+)
   */
  setBoardingPassBadges(badges: {
    internationalDocumentsVerifiedText?: string;
    membershipTierStatusText?: string;
    priorityStatusText?: string;
    fareClassText?: string;
  }): this {
    if (!this.data.semantics) {
      this.data.semantics = {};
    }
    if (badges.internationalDocumentsVerifiedText !== undefined) {
      this.data.semantics.internationalDocumentsVerifiedText = badges.internationalDocumentsVerifiedText;
    }
    if (badges.membershipTierStatusText !== undefined) {
      this.data.semantics.membershipTierStatusText = badges.membershipTierStatusText;
    }
    if (badges.priorityStatusText !== undefined) {
      this.data.semantics.priorityStatusText = badges.priorityStatusText;
    }
    if (badges.fareClassText !== undefined) {
      this.data.semantics.fareClassText = badges.fareClassText;
    }
    return this;
  }

  /**
   * Build the pass data object
   */
  build(): { passData: PassData; images: PassImage[]; personalization?: Personalization } {
    // Validate required fields
    if (!this.data.passTypeIdentifier) {
      throw new Error('passTypeIdentifier is required');
    }
    if (!this.data.serialNumber) {
      throw new Error('serialNumber is required');
    }
    if (!this.data.teamIdentifier) {
      throw new Error('teamIdentifier is required');
    }
    if (!this.data.organizationName) {
      throw new Error('organizationName is required');
    }
    if (!this.data.description) {
      throw new Error('description is required');
    }

    // Set the pass type fields
    const passData: PassData = {
      ...this.data as PassData,
    };

    // Add fields to the appropriate pass type
    switch (this.passType) {
      case PassType.BoardingPass:
        passData.boardingPass = this.fields;
        break;
      case PassType.Coupon:
        passData.coupon = this.fields;
        break;
      case PassType.EventTicket:
        passData.eventTicket = this.fields;
        break;
      case PassType.StoreCard:
        passData.storeCard = this.fields;
        break;
      case PassType.Generic:
      default:
        passData.generic = this.fields;
        break;
    }

    return {
      passData,
      images: this.images,
      personalization: this.personalization,
    };
  }
}

/**
 * Create a new pass builder
 */
export function createPassBuilder(): PassBuilder {
  return new PassBuilder();
}
