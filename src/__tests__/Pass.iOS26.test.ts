import { describe, it, expect } from 'bun:test';
import { Pass, createPass } from '../Pass';
import { PassBuilder, createPassBuilder } from '../PassBuilder';
import {
  PassType,
  TransitType,
  BarcodeFormat,
  UpcomingPassEventType,
  PassData,
  UpcomingPassEvent,
  PassURLs,
  EventType,
} from '../types';
import JSZip from 'jszip';

/**
 * Comprehensive test suite for iOS 26 Apple Wallet features
 */
describe('iOS 26 Apple Wallet Features', () => {
  // Helper function to create a valid pass builder with required fields
  const createValidBuilder = () => {
    return createPassBuilder()
      .setIdentifiers({
        passTypeIdentifier: 'pass.com.example.test',
        serialNumber: 'TEST-001',
        teamIdentifier: 'ABCD1234',
      })
      .setOrganization({
        organizationName: 'Test Organization',
        description: 'Test Pass',
      });
  };

  // Helper function to extract pass.json from generated pass
  const extractPassJson = async (pass: Pass): Promise<Record<string, unknown>> => {
    const buffer = await pass.generate({ skipSignature: true });
    const zip = await JSZip.loadAsync(buffer);
    const passJsonFile = zip.file('pass.json');
    const passJsonContent = await passJsonFile!.async('string');
    return JSON.parse(passJsonContent);
  };

  // Minimal pass data for direct Pass construction
  const minimalPassData: PassData = {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.example.test',
    serialNumber: 'TEST-001',
    teamIdentifier: 'ABCD1234',
    organizationName: 'Test Organization',
    description: 'Test Pass',
  };

  describe('upcomingPassInformation', () => {
    describe('Basic Event Tests', () => {
      it('should serialize a basic single event correctly', async () => {
        const passData: PassData = {
          ...minimalPassData,
          eventTicket: {
            primaryFields: [{ key: 'event', value: 'Season Ticket' }],
          },
          upcomingPassInformation: [
            {
              type: UpcomingPassEventType.Event,
              identifier: 'game-001',
              displayName: 'Home Game vs Rivals',
              eventDate: '2026-03-15T19:00:00Z',
            },
          ],
        };

        const pass = createPass(passData);
        const parsed = await extractPassJson(pass);

        expect(parsed.upcomingPassInformation).toBeDefined();
        expect(Array.isArray(parsed.upcomingPassInformation)).toBe(true);
        expect((parsed.upcomingPassInformation as unknown[]).length).toBe(1);

        const event = (parsed.upcomingPassInformation as Record<string, unknown>[])[0];
        expect(event.type).toBe('event');
        expect(event.identifier).toBe('game-001');
        expect(event.displayName).toBe('Home Game vs Rivals');
        expect(event.eventDate).toBe('2026-03-15T19:00:00Z');
      });

      it('should serialize multiple events correctly', async () => {
        const passData: PassData = {
          ...minimalPassData,
          eventTicket: {
            primaryFields: [{ key: 'event', value: 'Season Ticket' }],
          },
          upcomingPassInformation: [
            {
              type: UpcomingPassEventType.Event,
              identifier: 'game-001',
              displayName: 'Game 1 - Opening Night',
              eventDate: '2026-03-01T19:00:00Z',
            },
            {
              type: UpcomingPassEventType.Event,
              identifier: 'game-002',
              displayName: 'Game 2 - Rivalry Week',
              eventDate: '2026-03-08T19:00:00Z',
            },
            {
              type: UpcomingPassEventType.Event,
              identifier: 'game-003',
              displayName: 'Game 3 - Championship',
              eventDate: '2026-03-15T19:00:00Z',
            },
          ],
        };

        const pass = createPass(passData);
        const parsed = await extractPassJson(pass);

        expect((parsed.upcomingPassInformation as unknown[]).length).toBe(3);
        const events = parsed.upcomingPassInformation as Record<string, unknown>[];
        expect(events[0].identifier).toBe('game-001');
        expect(events[1].identifier).toBe('game-002');
        expect(events[2].identifier).toBe('game-003');
      });

      it('should serialize event with isActive flag', async () => {
        const passData: PassData = {
          ...minimalPassData,
          eventTicket: {
            primaryFields: [{ key: 'event', value: 'Season Ticket' }],
          },
          upcomingPassInformation: [
            {
              type: UpcomingPassEventType.Event,
              identifier: 'game-001',
              displayName: 'Current Game',
              eventDate: '2026-03-01T19:00:00Z',
              isActive: true,
            },
            {
              type: UpcomingPassEventType.Event,
              identifier: 'game-002',
              displayName: 'Next Game',
              eventDate: '2026-03-08T19:00:00Z',
              isActive: false,
            },
          ],
        };

        const pass = createPass(passData);
        const parsed = await extractPassJson(pass);

        const events = parsed.upcomingPassInformation as Record<string, unknown>[];
        expect(events[0].isActive).toBe(true);
        expect(events[1].isActive).toBe(false);
      });

      it('should serialize event with venuePlaceID', async () => {
        const passData: PassData = {
          ...minimalPassData,
          eventTicket: {
            primaryFields: [{ key: 'event', value: 'Concert' }],
          },
          upcomingPassInformation: [
            {
              type: UpcomingPassEventType.Event,
              identifier: 'concert-001',
              displayName: 'Live Concert at Madison Square Garden',
              eventDate: '2026-06-15T20:00:00Z',
              venuePlaceID: 'ChIJhRwB-yFawokR5Phil-QQ3zM',
            },
          ],
        };

        const pass = createPass(passData);
        const parsed = await extractPassJson(pass);

        const event = (parsed.upcomingPassInformation as Record<string, unknown>[])[0];
        expect(event.venuePlaceID).toBe('ChIJhRwB-yFawokR5Phil-QQ3zM');
      });

      it('should serialize event with additionalInfoFields', async () => {
        const passData: PassData = {
          ...minimalPassData,
          eventTicket: {
            primaryFields: [{ key: 'event', value: 'Sports Event' }],
          },
          upcomingPassInformation: [
            {
              type: UpcomingPassEventType.Event,
              identifier: 'game-001',
              displayName: 'Championship Final',
              eventDate: '2026-04-20T18:30:00Z',
              additionalInfoFields: [
                { key: 'gate', label: 'GATE', value: 'North Entrance' },
                { key: 'section', label: 'SECTION', value: 'VIP-A' },
                { key: 'row', label: 'ROW', value: '5' },
              ],
            },
          ],
        };

        const pass = createPass(passData);
        const parsed = await extractPassJson(pass);

        const event = (parsed.upcomingPassInformation as Record<string, unknown>[])[0];
        expect(event.additionalInfoFields).toBeDefined();
        const fields = event.additionalInfoFields as Record<string, unknown>[];
        expect(fields.length).toBe(3);
        expect(fields[0].key).toBe('gate');
        expect(fields[1].key).toBe('section');
        expect(fields[2].key).toBe('row');
      });

      it('should serialize event with backFields', async () => {
        const passData: PassData = {
          ...minimalPassData,
          eventTicket: {
            primaryFields: [{ key: 'event', value: 'Theater Show' }],
          },
          upcomingPassInformation: [
            {
              type: UpcomingPassEventType.Event,
              identifier: 'show-001',
              displayName: 'Broadway Musical',
              eventDate: '2026-05-10T19:30:00Z',
              backFields: [
                { key: 'terms', label: 'Terms & Conditions', value: 'No refunds. No exchanges.' },
                { key: 'contact', label: 'Box Office', value: '+1-555-THEATER' },
              ],
            },
          ],
        };

        const pass = createPass(passData);
        const parsed = await extractPassJson(pass);

        const event = (parsed.upcomingPassInformation as Record<string, unknown>[])[0];
        expect(event.backFields).toBeDefined();
        const backFields = event.backFields as Record<string, unknown>[];
        expect(backFields.length).toBe(2);
        expect(backFields[0].key).toBe('terms');
        expect(backFields[1].key).toBe('contact');
      });

      it('should serialize event with semantics', async () => {
        const passData: PassData = {
          ...minimalPassData,
          eventTicket: {
            primaryFields: [{ key: 'event', value: 'Sports Game' }],
          },
          upcomingPassInformation: [
            {
              type: UpcomingPassEventType.Event,
              identifier: 'game-001',
              displayName: 'Lakers vs Warriors',
              eventDate: '2026-03-20T19:30:00Z',
              semantics: {
                eventName: 'Lakers vs Warriors',
                venueName: 'Crypto.com Arena',
                homeTeamName: 'Los Angeles Lakers',
                awayTeamName: 'Golden State Warriors',
                sportName: 'Basketball',
                leagueAbbreviation: 'NBA',
              },
            },
          ],
        };

        const pass = createPass(passData);
        const parsed = await extractPassJson(pass);

        const event = (parsed.upcomingPassInformation as Record<string, unknown>[])[0];
        expect(event.semantics).toBeDefined();
        const semantics = event.semantics as Record<string, unknown>;
        expect(semantics.eventName).toBe('Lakers vs Warriors');
        expect(semantics.venueName).toBe('Crypto.com Arena');
        expect(semantics.homeTeamName).toBe('Los Angeles Lakers');
        expect(semantics.awayTeamName).toBe('Golden State Warriors');
      });
    });

    describe('PassBuilder Integration', () => {
      it('should add upcoming pass event via PassBuilder', () => {
        const { passData } = createValidBuilder()
          .setPassType(PassType.EventTicket)
          .addPrimaryField({ key: 'event', value: 'Season Pass' })
          .addUpcomingPassEvent({
            identifier: 'event-001',
            displayName: 'First Event',
            eventDate: '2026-04-01T18:00:00Z',
          })
          .build();

        expect(passData.upcomingPassInformation).toBeDefined();
        expect(passData.upcomingPassInformation?.length).toBe(1);
        expect(passData.upcomingPassInformation?.[0].type).toBe(UpcomingPassEventType.Event);
        expect(passData.upcomingPassInformation?.[0].identifier).toBe('event-001');
      });

      it('should add multiple upcoming events via PassBuilder', () => {
        const { passData } = createValidBuilder()
          .setPassType(PassType.EventTicket)
          .addPrimaryField({ key: 'event', value: 'Season Pass' })
          .addUpcomingPassEvent({
            identifier: 'event-001',
            displayName: 'Event 1',
            eventDate: '2026-04-01T18:00:00Z',
          })
          .addUpcomingPassEvent({
            identifier: 'event-002',
            displayName: 'Event 2',
            eventDate: '2026-04-15T18:00:00Z',
          })
          .addUpcomingPassEvent({
            identifier: 'event-003',
            displayName: 'Event 3',
            eventDate: '2026-05-01T18:00:00Z',
          })
          .build();

        expect(passData.upcomingPassInformation?.length).toBe(3);
      });

      it('should convert Date objects to ISO strings via PassBuilder', () => {
        const eventDate = new Date('2026-06-15T20:00:00Z');
        const { passData } = createValidBuilder()
          .setPassType(PassType.EventTicket)
          .addPrimaryField({ key: 'event', value: 'Concert' })
          .addUpcomingPassEvent({
            identifier: 'concert-001',
            displayName: 'Live Concert',
            eventDate: eventDate,
          })
          .build();

        expect(passData.upcomingPassInformation?.[0].eventDate).toBe('2026-06-15T20:00:00.000Z');
      });

      it('should add event with all optional fields via PassBuilder', () => {
        const { passData } = createValidBuilder()
          .setPassType(PassType.EventTicket)
          .addPrimaryField({ key: 'event', value: 'Full Event' })
          .addUpcomingPassEvent({
            identifier: 'full-event',
            displayName: 'Complete Event Test',
            eventDate: '2026-07-20T19:00:00Z',
            isActive: true,
            venuePlaceID: 'ChIJ-test-place-id',
            additionalInfoFields: [
              { key: 'door', label: 'DOOR', value: 'VIP Entrance' },
            ],
            backFields: [
              { key: 'info', label: 'Info', value: 'Additional details' },
            ],
            semantics: {
              eventName: 'Complete Event Test',
              eventType: EventType.LivePerformance,
            },
          })
          .build();

        const event = passData.upcomingPassInformation?.[0];
        expect(event?.isActive).toBe(true);
        expect(event?.venuePlaceID).toBe('ChIJ-test-place-id');
        expect(event?.additionalInfoFields?.length).toBe(1);
        expect(event?.backFields?.length).toBe(1);
        expect(event?.semantics?.eventName).toBe('Complete Event Test');
      });
    });
  });

  describe('URLs Object', () => {
    it('should serialize URLs with appLaunchURL', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{ key: 'title', value: 'Generic Pass' }],
        },
        urls: {
          appLaunchURL: 'myapp://pass/launch?id=12345',
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      expect(parsed.urls).toBeDefined();
      expect((parsed.urls as PassURLs).appLaunchURL).toBe('myapp://pass/launch?id=12345');
    });

    it('should integrate URLs via PassBuilder setURLs', () => {
      const { passData } = createValidBuilder()
        .setPassType(PassType.Generic)
        .addPrimaryField({ key: 'title', value: 'Test Pass' })
        .setURLs({
          appLaunchURL: 'myapp://deep-link/pass',
        })
        .build();

      expect(passData.urls).toBeDefined();
      expect(passData.urls?.appLaunchURL).toBe('myapp://deep-link/pass');
    });

    it('should not include URLs when not set', () => {
      const { passData } = createValidBuilder()
        .setPassType(PassType.Generic)
        .addPrimaryField({ key: 'title', value: 'Test Pass' })
        .build();

      expect(passData.urls).toBeUndefined();
    });
  });

  describe('passengerServiceSSRs', () => {
    it('should serialize single SSR code', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{ key: 'origin', value: 'SFO' }],
        },
        semantics: {
          passengerServiceSSRs: ['WCHR'],
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      expect(parsed.semantics).toBeDefined();
      const semantics = parsed.semantics as Record<string, unknown>;
      expect(semantics.passengerServiceSSRs).toBeDefined();
      expect(Array.isArray(semantics.passengerServiceSSRs)).toBe(true);
      expect((semantics.passengerServiceSSRs as string[])[0]).toBe('WCHR');
    });

    it('should serialize multiple SSR codes', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{ key: 'origin', value: 'LAX' }],
        },
        semantics: {
          passengerServiceSSRs: ['WCHR', 'DEAF', 'SVAN'],
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      const semantics = parsed.semantics as Record<string, unknown>;
      const ssrs = semantics.passengerServiceSSRs as string[];
      expect(ssrs.length).toBe(3);
      expect(ssrs).toContain('WCHR');
      expect(ssrs).toContain('DEAF');
      expect(ssrs).toContain('SVAN');
    });

    it('should support common IATA SSR codes - WCHR (wheelchair ramp)', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{ key: 'origin', value: 'JFK' }],
        },
        semantics: {
          passengerServiceSSRs: ['WCHR'],
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      const semantics = parsed.semantics as Record<string, unknown>;
      expect((semantics.passengerServiceSSRs as string[])).toContain('WCHR');
    });

    it('should support common IATA SSR codes - WCHS (wheelchair steps)', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{ key: 'origin', value: 'ORD' }],
        },
        semantics: {
          passengerServiceSSRs: ['WCHS'],
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      const semantics = parsed.semantics as Record<string, unknown>;
      expect((semantics.passengerServiceSSRs as string[])).toContain('WCHS');
    });

    it('should support common IATA SSR codes - WCHC (wheelchair cabin)', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{ key: 'origin', value: 'DFW' }],
        },
        semantics: {
          passengerServiceSSRs: ['WCHC'],
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      const semantics = parsed.semantics as Record<string, unknown>;
      expect((semantics.passengerServiceSSRs as string[])).toContain('WCHC');
    });

    it('should support common IATA SSR codes - BLND (blind passenger)', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{ key: 'origin', value: 'SEA' }],
        },
        semantics: {
          passengerServiceSSRs: ['BLND'],
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      const semantics = parsed.semantics as Record<string, unknown>;
      expect((semantics.passengerServiceSSRs as string[])).toContain('BLND');
    });

    it('should support all common IATA accessibility codes together', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{ key: 'origin', value: 'MIA' }],
        },
        semantics: {
          passengerServiceSSRs: ['WCHR', 'WCHS', 'WCHC', 'BLND', 'DEAF', 'SVAN', 'ESAN', 'DPNA'],
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      const semantics = parsed.semantics as Record<string, unknown>;
      const ssrs = semantics.passengerServiceSSRs as string[];
      expect(ssrs.length).toBe(8);
      expect(ssrs).toContain('WCHR');
      expect(ssrs).toContain('WCHS');
      expect(ssrs).toContain('WCHC');
      expect(ssrs).toContain('BLND');
      expect(ssrs).toContain('DEAF');
      expect(ssrs).toContain('SVAN');
      expect(ssrs).toContain('ESAN');
      expect(ssrs).toContain('DPNA');
    });

    it('should integrate via PassBuilder addPassengerServiceSSR', () => {
      const { passData } = createValidBuilder()
        .setPassType(PassType.BoardingPass, TransitType.Air)
        .addPrimaryField({ key: 'origin', label: 'FROM', value: 'SFO' })
        .addPrimaryField({ key: 'destination', label: 'TO', value: 'JFK' })
        .addPassengerServiceSSR('WCHR')
        .build();

      expect(passData.semantics?.passengerServiceSSRs).toBeDefined();
      expect(passData.semantics?.passengerServiceSSRs).toContain('WCHR');
    });

    it('should add multiple SSRs via PassBuilder chaining', () => {
      const { passData } = createValidBuilder()
        .setPassType(PassType.BoardingPass, TransitType.Air)
        .addPrimaryField({ key: 'origin', label: 'FROM', value: 'LAX' })
        .addPrimaryField({ key: 'destination', label: 'TO', value: 'LHR' })
        .addPassengerServiceSSR('WCHR')
        .addPassengerServiceSSR('DEAF')
        .addPassengerServiceSSR('SVAN')
        .build();

      expect(passData.semantics?.passengerServiceSSRs?.length).toBe(3);
      expect(passData.semantics?.passengerServiceSSRs).toContain('WCHR');
      expect(passData.semantics?.passengerServiceSSRs).toContain('DEAF');
      expect(passData.semantics?.passengerServiceSSRs).toContain('SVAN');
    });
  });

  describe('Custom Badge Fields', () => {
    it('should serialize internationalDocumentsVerifiedText', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{ key: 'origin', value: 'SFO' }],
        },
        semantics: {
          internationalDocumentsVerifiedText: 'Documents Verified',
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      const semantics = parsed.semantics as Record<string, unknown>;
      expect(semantics.internationalDocumentsVerifiedText).toBe('Documents Verified');
    });

    it('should serialize membershipTierStatusText', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{ key: 'origin', value: 'JFK' }],
        },
        semantics: {
          membershipTierStatusText: 'Platinum Elite',
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      const semantics = parsed.semantics as Record<string, unknown>;
      expect(semantics.membershipTierStatusText).toBe('Platinum Elite');
    });

    it('should serialize priorityStatusText', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{ key: 'origin', value: 'ORD' }],
        },
        semantics: {
          priorityStatusText: 'Priority Boarding',
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      const semantics = parsed.semantics as Record<string, unknown>;
      expect(semantics.priorityStatusText).toBe('Priority Boarding');
    });

    it('should serialize fareClassText', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{ key: 'origin', value: 'LAX' }],
        },
        semantics: {
          fareClassText: 'Business Class',
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      const semantics = parsed.semantics as Record<string, unknown>;
      expect(semantics.fareClassText).toBe('Business Class');
    });

    it('should serialize all badge fields together', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{ key: 'origin', value: 'SFO' }],
        },
        semantics: {
          internationalDocumentsVerifiedText: 'DOCS OK',
          membershipTierStatusText: 'Gold Status',
          priorityStatusText: 'Group 1',
          fareClassText: 'First Class',
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      const semantics = parsed.semantics as Record<string, unknown>;
      expect(semantics.internationalDocumentsVerifiedText).toBe('DOCS OK');
      expect(semantics.membershipTierStatusText).toBe('Gold Status');
      expect(semantics.priorityStatusText).toBe('Group 1');
      expect(semantics.fareClassText).toBe('First Class');
    });

    it('should integrate via PassBuilder setBoardingPassBadges with full options', () => {
      const { passData } = createValidBuilder()
        .setPassType(PassType.BoardingPass, TransitType.Air)
        .addPrimaryField({ key: 'origin', label: 'FROM', value: 'SFO' })
        .addPrimaryField({ key: 'destination', label: 'TO', value: 'JFK' })
        .setBoardingPassBadges({
          internationalDocumentsVerifiedText: 'Verified',
          membershipTierStatusText: 'Platinum',
          priorityStatusText: 'Priority',
          fareClassText: 'Business',
        })
        .build();

      expect(passData.semantics?.internationalDocumentsVerifiedText).toBe('Verified');
      expect(passData.semantics?.membershipTierStatusText).toBe('Platinum');
      expect(passData.semantics?.priorityStatusText).toBe('Priority');
      expect(passData.semantics?.fareClassText).toBe('Business');
    });

    it('should integrate via PassBuilder setBoardingPassBadges with partial options', () => {
      const { passData } = createValidBuilder()
        .setPassType(PassType.BoardingPass, TransitType.Air)
        .addPrimaryField({ key: 'origin', label: 'FROM', value: 'LAX' })
        .addPrimaryField({ key: 'destination', label: 'TO', value: 'LHR' })
        .setBoardingPassBadges({
          membershipTierStatusText: 'Gold',
          fareClassText: 'Economy Plus',
        })
        .build();

      expect(passData.semantics?.membershipTierStatusText).toBe('Gold');
      expect(passData.semantics?.fareClassText).toBe('Economy Plus');
      expect(passData.semantics?.internationalDocumentsVerifiedText).toBeUndefined();
      expect(passData.semantics?.priorityStatusText).toBeUndefined();
    });
  });

  describe('Integration Tests', () => {
    it('should create a complete boarding pass with all iOS 26 features', async () => {
      const passData: PassData = {
        formatVersion: 1,
        passTypeIdentifier: 'pass.com.airline.boardingpass',
        serialNumber: 'BP-2026-001',
        teamIdentifier: 'AIRLINE123',
        organizationName: 'Example Airlines',
        description: 'Boarding Pass - SFO to JFK',
        foregroundColor: 'rgb(255, 255, 255)',
        backgroundColor: 'rgb(0, 51, 102)',
        boardingPass: {
          transitType: TransitType.Air,
          headerFields: [
            { key: 'gate', label: 'GATE', value: 'A12' },
          ],
          primaryFields: [
            { key: 'origin', label: 'SFO', value: 'San Francisco' },
            { key: 'destination', label: 'JFK', value: 'New York' },
          ],
          secondaryFields: [
            { key: 'passenger', label: 'PASSENGER', value: 'JOHN DOE' },
            { key: 'seat', label: 'SEAT', value: '12A' },
          ],
          auxiliaryFields: [
            { key: 'flight', label: 'FLIGHT', value: 'EX 1234' },
            { key: 'class', label: 'CLASS', value: 'Business' },
          ],
        },
        barcodes: [
          {
            format: BarcodeFormat.PDF417,
            message: 'M1DOE/JOHN         EABC123 SFOJFKEX 1234 123Y012A0001 100',
          },
        ],
        semantics: {
          airlineCode: 'EX',
          flightNumber: 1234,
          departureAirportCode: 'SFO',
          destinationAirportCode: 'JFK',
          passengerName: { givenName: 'JOHN', familyName: 'DOE' },
          passengerServiceSSRs: ['WCHR', 'DEAF'],
          internationalDocumentsVerifiedText: 'Passport Verified',
          membershipTierStatusText: 'Diamond Elite',
          priorityStatusText: 'Group 1 - Priority',
          fareClassText: 'Business Class',
        },
        urls: {
          appLaunchURL: 'exairlines://boarding/BP-2026-001',
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      // Verify boarding pass structure
      expect(parsed.boardingPass).toBeDefined();
      expect((parsed.boardingPass as Record<string, unknown>).transitType).toBe('PKTransitTypeAir');

      // Verify iOS 26 features
      expect(parsed.urls).toBeDefined();
      expect((parsed.urls as PassURLs).appLaunchURL).toBe('exairlines://boarding/BP-2026-001');

      const semantics = parsed.semantics as Record<string, unknown>;
      expect(semantics.passengerServiceSSRs).toContain('WCHR');
      expect(semantics.passengerServiceSSRs).toContain('DEAF');
      expect(semantics.internationalDocumentsVerifiedText).toBe('Passport Verified');
      expect(semantics.membershipTierStatusText).toBe('Diamond Elite');
      expect(semantics.priorityStatusText).toBe('Group 1 - Priority');
      expect(semantics.fareClassText).toBe('Business Class');
    });

    it('should create a season ticket with multiple upcoming events', async () => {
      const passData: PassData = {
        formatVersion: 1,
        passTypeIdentifier: 'pass.com.team.seasonticket',
        serialNumber: 'SEASON-2026',
        teamIdentifier: 'TEAM12345',
        organizationName: 'City Sports Team',
        description: '2026 Season Ticket',
        foregroundColor: 'rgb(255, 255, 255)',
        backgroundColor: 'rgb(0, 102, 51)',
        eventTicket: {
          primaryFields: [
            { key: 'holder', label: 'TICKET HOLDER', value: 'Jane Smith' },
          ],
          secondaryFields: [
            { key: 'section', label: 'SECTION', value: '100' },
            { key: 'row', label: 'ROW', value: 'A' },
            { key: 'seat', label: 'SEAT', value: '15' },
          ],
        },
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'SEASON-2026-JANE-100A15',
          },
        ],
        semantics: {
          venueName: 'City Sports Arena',
          homeTeamName: 'City Sports Team',
        },
        upcomingPassInformation: [
          {
            type: UpcomingPassEventType.Event,
            identifier: 'game-2026-01',
            displayName: 'Home Opener vs Rivals',
            eventDate: '2026-03-01T19:00:00Z',
            isActive: true,
            venuePlaceID: 'ChIJ-arena-id',
            additionalInfoFields: [
              { key: 'opponent', label: 'OPPONENT', value: 'Rivals FC' },
            ],
            semantics: {
              eventName: 'Home Opener vs Rivals',
              awayTeamName: 'Rivals FC',
              eventType: EventType.Sports,
            },
          },
          {
            type: UpcomingPassEventType.Event,
            identifier: 'game-2026-02',
            displayName: 'Derby Match vs City United',
            eventDate: '2026-03-15T15:00:00Z',
            additionalInfoFields: [
              { key: 'opponent', label: 'OPPONENT', value: 'City United' },
            ],
            semantics: {
              eventName: 'Derby Match',
              awayTeamName: 'City United',
            },
          },
          {
            type: UpcomingPassEventType.Event,
            identifier: 'game-2026-03',
            displayName: 'Championship Final',
            eventDate: '2026-04-20T18:30:00Z',
            additionalInfoFields: [
              { key: 'type', label: 'EVENT TYPE', value: 'Championship' },
            ],
          },
        ],
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      // Verify event ticket structure
      expect(parsed.eventTicket).toBeDefined();

      // Verify upcoming events
      expect(parsed.upcomingPassInformation).toBeDefined();
      const events = parsed.upcomingPassInformation as Record<string, unknown>[];
      expect(events.length).toBe(3);

      // Verify first event details
      expect(events[0].identifier).toBe('game-2026-01');
      expect(events[0].isActive).toBe(true);
      expect(events[0].venuePlaceID).toBe('ChIJ-arena-id');
      expect((events[0].semantics as Record<string, unknown>).awayTeamName).toBe('Rivals FC');

      // Verify second event
      expect(events[1].identifier).toBe('game-2026-02');
      expect(events[1].displayName).toBe('Derby Match vs City United');

      // Verify third event
      expect(events[2].identifier).toBe('game-2026-03');
      expect(events[2].displayName).toBe('Championship Final');
    });

    it('should create a pass using full PassBuilder fluent API with iOS 26 features', async () => {
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: 'pass.com.example.complete',
          serialNumber: 'COMPLETE-001',
          teamIdentifier: 'TEAM12345',
        })
        .setOrganization({
          organizationName: 'Complete Test Corp',
          description: 'Complete iOS 26 Pass Test',
          logoText: 'COMPLETE',
        })
        .setColors({
          foregroundColor: 'rgb(255, 255, 255)',
          backgroundColor: 'rgb(30, 30, 30)',
          labelColor: 'rgb(200, 200, 200)',
        })
        .setPassType(PassType.BoardingPass, TransitType.Air)
        .addHeaderField({ key: 'gate', label: 'GATE', value: 'B24' })
        .addPrimaryField({ key: 'origin', label: 'SFO', value: 'San Francisco' })
        .addPrimaryField({ key: 'destination', label: 'NRT', value: 'Tokyo Narita' })
        .addSecondaryField({ key: 'passenger', label: 'PASSENGER', value: 'JANE SMITH' })
        .addAuxiliaryField({ key: 'flight', label: 'FLIGHT', value: 'EX 789' })
        .addAuxiliaryField({ key: 'seat', label: 'SEAT', value: '1A' })
        .addBackField({ key: 'terms', label: 'Terms', value: 'Standard airline terms apply.' })
        .addBarcode({
          format: BarcodeFormat.PDF417,
          message: 'M1SMITH/JANE       EXYZ789 SFONRTEX 0789 123J001A0001 100',
          altText: 'SMITH/JANE - EX 789',
        })
        .setSemanticTags({
          airlineCode: 'EX',
          flightNumber: 789,
          departureAirportCode: 'SFO',
          destinationAirportCode: 'NRT',
          passengerName: { givenName: 'JANE', familyName: 'SMITH' },
        })
        .addPassengerServiceSSR('WCHR')
        .addPassengerServiceSSR('BLND')
        .setBoardingPassBadges({
          internationalDocumentsVerifiedText: 'ESTA Approved',
          membershipTierStatusText: 'Global Services',
          priorityStatusText: 'Pre-Board',
          fareClassText: 'Polaris First',
        })
        .setURLs({
          appLaunchURL: 'exairlines://pass/COMPLETE-001',
        })
        .setRelevantDate(new Date('2026-05-15T10:00:00Z'))
        .addLocation({
          latitude: 37.6213,
          longitude: -122.379,
          relevantText: 'You are at SFO Airport',
        });

      const { passData } = builder.build();
      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      // Verify structure
      expect(parsed.boardingPass).toBeDefined();
      expect((parsed.boardingPass as Record<string, unknown>).transitType).toBe('PKTransitTypeAir');

      // Verify URLs
      expect(parsed.urls).toBeDefined();
      expect((parsed.urls as PassURLs).appLaunchURL).toBe('exairlines://pass/COMPLETE-001');

      // Verify SSRs
      const semantics = parsed.semantics as Record<string, unknown>;
      expect(semantics.passengerServiceSSRs).toContain('WCHR');
      expect(semantics.passengerServiceSSRs).toContain('BLND');

      // Verify badges
      expect(semantics.internationalDocumentsVerifiedText).toBe('ESTA Approved');
      expect(semantics.membershipTierStatusText).toBe('Global Services');
      expect(semantics.priorityStatusText).toBe('Pre-Board');
      expect(semantics.fareClassText).toBe('Polaris First');

      // Verify standard fields still work
      expect(semantics.airlineCode).toBe('EX');
      expect(semantics.flightNumber).toBe(789);
    });
  });

  describe('Backward Compatibility', () => {
    it('should not include upcomingPassInformation when not set', async () => {
      const passData: PassData = {
        ...minimalPassData,
        eventTicket: {
          primaryFields: [{ key: 'event', value: 'Single Event' }],
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      expect(parsed.upcomingPassInformation).toBeUndefined();
    });

    it('should not include urls when not set', async () => {
      const passData: PassData = {
        ...minimalPassData,
        generic: {
          primaryFields: [{ key: 'title', value: 'Basic Pass' }],
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      expect(parsed.urls).toBeUndefined();
    });

    it('should not include passengerServiceSSRs when not set', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{ key: 'origin', value: 'SFO' }],
        },
        semantics: {
          airlineCode: 'EX',
          flightNumber: 123,
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      const semantics = parsed.semantics as Record<string, unknown>;
      expect(semantics.passengerServiceSSRs).toBeUndefined();
    });

    it('should not include badge fields when not set', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [{ key: 'origin', value: 'SFO' }],
        },
        semantics: {
          airlineCode: 'EX',
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      const semantics = parsed.semantics as Record<string, unknown>;
      expect(semantics.internationalDocumentsVerifiedText).toBeUndefined();
      expect(semantics.membershipTierStatusText).toBeUndefined();
      expect(semantics.priorityStatusText).toBeUndefined();
      expect(semantics.fareClassText).toBeUndefined();
    });

    it('should preserve existing functionality when iOS 26 features are not used', async () => {
      const passData: PassData = {
        formatVersion: 1,
        passTypeIdentifier: 'pass.com.example.legacy',
        serialNumber: 'LEGACY-001',
        teamIdentifier: 'TEAM12345',
        organizationName: 'Legacy Corp',
        description: 'Legacy Pass Without iOS 26 Features',
        foregroundColor: 'rgb(255, 255, 255)',
        backgroundColor: 'rgb(100, 100, 100)',
        storeCard: {
          headerFields: [{ key: 'points', label: 'POINTS', value: '1500' }],
          primaryFields: [{ key: 'name', label: 'MEMBER', value: 'Legacy User' }],
          secondaryFields: [
            { key: 'tier', label: 'TIER', value: 'Gold' },
            { key: 'since', label: 'MEMBER SINCE', value: '2020' },
          ],
        },
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'https://example.com/member/LEGACY-001',
            messageEncoding: 'iso-8859-1',
          },
        ],
        locations: [
          { latitude: 37.7749, longitude: -122.4194, relevantText: 'Store Location' },
        ],
        semantics: {
          membershipProgramName: 'Legacy Rewards',
          membershipProgramNumber: 'LR-12345',
        },
      };

      const pass = createPass(passData);
      const parsed = await extractPassJson(pass);

      // Verify legacy structure
      expect(parsed.formatVersion).toBe(1);
      expect(parsed.passTypeIdentifier).toBe('pass.com.example.legacy');
      expect(parsed.storeCard).toBeDefined();

      const storeCard = parsed.storeCard as Record<string, unknown>;
      expect((storeCard.headerFields as unknown[]).length).toBe(1);
      expect((storeCard.primaryFields as unknown[]).length).toBe(1);
      expect((storeCard.secondaryFields as unknown[]).length).toBe(2);

      // Verify barcodes
      expect((parsed.barcodes as unknown[]).length).toBe(1);

      // Verify locations
      expect((parsed.locations as unknown[]).length).toBe(1);

      // Verify legacy semantics
      const semantics = parsed.semantics as Record<string, unknown>;
      expect(semantics.membershipProgramName).toBe('Legacy Rewards');
      expect(semantics.membershipProgramNumber).toBe('LR-12345');

      // Verify iOS 26 features are not present
      expect(parsed.upcomingPassInformation).toBeUndefined();
      expect(parsed.urls).toBeUndefined();
      expect(semantics.passengerServiceSSRs).toBeUndefined();
      expect(semantics.internationalDocumentsVerifiedText).toBeUndefined();
      expect(semantics.membershipTierStatusText).toBeUndefined();
      expect(semantics.priorityStatusText).toBeUndefined();
      expect(semantics.fareClassText).toBeUndefined();
    });

    it('should work correctly with PassBuilder without iOS 26 features', () => {
      const { passData } = createValidBuilder()
        .setPassType(PassType.Coupon)
        .addPrimaryField({ key: 'discount', label: 'DISCOUNT', value: '25% OFF' })
        .addSecondaryField({ key: 'code', label: 'CODE', value: 'SAVE25' })
        .addBarcode({ format: BarcodeFormat.QR, message: 'COUPON-SAVE25' })
        .setExpirationDate(new Date('2026-12-31T23:59:59Z'))
        .build();

      expect(passData.coupon).toBeDefined();
      expect(passData.barcodes?.length).toBe(1);
      expect(passData.expirationDate).toBe('2026-12-31T23:59:59.000Z');

      // iOS 26 features should not be present
      expect(passData.upcomingPassInformation).toBeUndefined();
      expect(passData.urls).toBeUndefined();
      expect(passData.semantics?.passengerServiceSSRs).toBeUndefined();
    });
  });
});
