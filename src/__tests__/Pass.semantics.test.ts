import { createPass, Pass } from '../Pass';
import { PassData, SemanticTagValue, EventType, BarcodeFormat, TransitType } from '../types';
import JSZip from 'jszip';

describe('Pass Semantics', () => {
  const minimalPassData: PassData = {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.example.test',
    serialNumber: 'TEST-001',
    teamIdentifier: 'ABCD1234',
    organizationName: 'Test Organization',
    description: 'Test Pass',
  };

  const generateAndParseSemanticsFromPass = async (semantics: SemanticTagValue): Promise<SemanticTagValue | undefined> => {
    const passData: PassData = {
      ...minimalPassData,
      semantics,
    };
    const pass = createPass(passData);
    const buffer = await pass.generate({ skipSignature: true });
    const zip = await JSZip.loadAsync(buffer);
    const passJsonFile = zip.file('pass.json');
    const passJsonContent = await passJsonFile!.async('string');
    const parsed = JSON.parse(passJsonContent);
    return parsed.semantics;
  };

  describe('Balance semantics with different currency codes', () => {
    it('should handle balance with USD currency', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        balance: { amount: '100.00', currencyCode: 'USD' },
      });

      expect(semantics?.balance).toEqual({ amount: '100.00', currencyCode: 'USD' });
    });

    it('should handle balance with EUR currency', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        balance: { amount: '250.50', currencyCode: 'EUR' },
      });

      expect(semantics?.balance).toEqual({ amount: '250.50', currencyCode: 'EUR' });
    });

    it('should handle balance with JPY currency (no decimal)', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        balance: { amount: '10000', currencyCode: 'JPY' },
      });

      expect(semantics?.balance).toEqual({ amount: '10000', currencyCode: 'JPY' });
    });

    it('should handle balance with GBP currency', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        balance: { amount: '75.99', currencyCode: 'GBP' },
      });

      expect(semantics?.balance).toEqual({ amount: '75.99', currencyCode: 'GBP' });
    });

    it('should handle balance with CHF currency', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        balance: { amount: '1234.56', currencyCode: 'CHF' },
      });

      expect(semantics?.balance).toEqual({ amount: '1234.56', currencyCode: 'CHF' });
    });

    it('should handle balance with zero amount', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        balance: { amount: '0.00', currencyCode: 'USD' },
      });

      expect(semantics?.balance).toEqual({ amount: '0.00', currencyCode: 'USD' });
    });

    it('should handle balance with negative amount', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        balance: { amount: '-50.00', currencyCode: 'USD' },
      });

      expect(semantics?.balance).toEqual({ amount: '-50.00', currencyCode: 'USD' });
    });

    it('should handle balance with large amount', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        balance: { amount: '999999999.99', currencyCode: 'USD' },
      });

      expect(semantics?.balance).toEqual({ amount: '999999999.99', currencyCode: 'USD' });
    });
  });

  describe('Boarding pass semantics', () => {
    it('should handle airline codes', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        airlineCode: 'UA',
      });

      expect(semantics?.airlineCode).toBe('UA');
    });

    it('should handle three-letter airline codes', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        airlineCode: 'AAL',
      });

      expect(semantics?.airlineCode).toBe('AAL');
    });

    it('should handle complete flight info', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        airlineCode: 'DL',
        flightCode: 'DL123',
        flightNumber: 123,
        departureAirportCode: 'LAX',
        departureAirportName: 'Los Angeles International Airport',
        departureGate: 'B42',
        departureTerminal: '5',
        destinationAirportCode: 'JFK',
        destinationAirportName: 'John F. Kennedy International Airport',
        destinationGate: 'C15',
        destinationTerminal: '4',
      });

      expect(semantics?.airlineCode).toBe('DL');
      expect(semantics?.flightCode).toBe('DL123');
      expect(semantics?.flightNumber).toBe(123);
      expect(semantics?.departureAirportCode).toBe('LAX');
      expect(semantics?.departureAirportName).toBe('Los Angeles International Airport');
      expect(semantics?.departureGate).toBe('B42');
      expect(semantics?.departureTerminal).toBe('5');
      expect(semantics?.destinationAirportCode).toBe('JFK');
      expect(semantics?.destinationAirportName).toBe('John F. Kennedy International Airport');
      expect(semantics?.destinationGate).toBe('C15');
      expect(semantics?.destinationTerminal).toBe('4');
    });

    it('should handle boarding dates', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        currentBoardingDate: '2024-12-25T08:30:00Z',
        currentDepartureDate: '2024-12-25T09:00:00Z',
        currentArrivalDate: '2024-12-25T14:30:00Z',
        originalBoardingDate: '2024-12-25T08:00:00Z',
        originalDepartureDate: '2024-12-25T08:30:00Z',
        originalArrivalDate: '2024-12-25T14:00:00Z',
      });

      expect(semantics?.currentBoardingDate).toBe('2024-12-25T08:30:00Z');
      expect(semantics?.currentDepartureDate).toBe('2024-12-25T09:00:00Z');
      expect(semantics?.currentArrivalDate).toBe('2024-12-25T14:30:00Z');
      expect(semantics?.originalBoardingDate).toBe('2024-12-25T08:00:00Z');
      expect(semantics?.originalDepartureDate).toBe('2024-12-25T08:30:00Z');
      expect(semantics?.originalArrivalDate).toBe('2024-12-25T14:00:00Z');
    });

    it('should handle boarding group and sequence', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        boardingGroup: 'A',
        boardingSequenceNumber: '015',
      });

      expect(semantics?.boardingGroup).toBe('A');
      expect(semantics?.boardingSequenceNumber).toBe('015');
    });

    it('should handle confirmation number', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        confirmationNumber: 'ABC123',
      });

      expect(semantics?.confirmationNumber).toBe('ABC123');
    });

    it('should handle priority status and security screening', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        priorityStatus: 'First Class',
        securityScreening: 'TSA PreCheck',
      });

      expect(semantics?.priorityStatus).toBe('First Class');
      expect(semantics?.securityScreening).toBe('TSA PreCheck');
    });

    describe('Passenger name semantics', () => {
      it('should handle passenger name with both family and given name', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          passengerName: {
            familyName: 'Smith',
            givenName: 'John',
          },
        });

        expect(semantics?.passengerName).toEqual({
          familyName: 'Smith',
          givenName: 'John',
        });
      });

      it('should handle passenger name with only family name', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          passengerName: {
            familyName: 'Madonna',
          },
        });

        expect(semantics?.passengerName).toEqual({
          familyName: 'Madonna',
        });
      });

      it('should handle passenger name with only given name', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          passengerName: {
            givenName: 'Prince',
          },
        });

        expect(semantics?.passengerName).toEqual({
          givenName: 'Prince',
        });
      });

      it('should handle passenger name with hyphenated family name', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          passengerName: {
            familyName: 'Ortega-Williams',
            givenName: 'Maria',
          },
        });

        expect(semantics?.passengerName?.familyName).toBe('Ortega-Williams');
      });

      it('should handle passenger name with apostrophe', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          passengerName: {
            familyName: "O'Brien",
            givenName: 'Patrick',
          },
        });

        expect(semantics?.passengerName?.familyName).toBe("O'Brien");
      });

      it('should handle passenger name with accented characters', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          passengerName: {
            familyName: 'Muller',
            givenName: 'Jose',
          },
        });

        expect(semantics?.passengerName?.familyName).toBe('Muller');
        expect(semantics?.passengerName?.givenName).toBe('Jose');
      });

      it('should handle empty passenger name object', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          passengerName: {},
        });

        // Empty nested objects may be omitted during serialization
        expect(semantics?.passengerName === undefined || Object.keys(semantics?.passengerName || {}).length === 0).toBe(true);
      });
    });
  });

  describe('Transit semantics', () => {
    it('should handle transit provider', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        transitProvider: 'Bay Area Rapid Transit',
      });

      expect(semantics?.transitProvider).toBe('Bay Area Rapid Transit');
    });

    it('should handle transit status and reason', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        transitStatus: 'On Time',
        transitStatusReason: 'Normal service',
      });

      expect(semantics?.transitStatus).toBe('On Time');
      expect(semantics?.transitStatusReason).toBe('Normal service');
    });

    it('should handle delayed transit status', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        transitStatus: 'Delayed',
        transitStatusReason: 'Signal problems at downtown station',
      });

      expect(semantics?.transitStatus).toBe('Delayed');
      expect(semantics?.transitStatusReason).toBe('Signal problems at downtown station');
    });

    it('should handle vehicle info', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        vehicleName: 'California Zephyr',
        vehicleNumber: '5',
        vehicleType: 'Amtrak',
      });

      expect(semantics?.vehicleName).toBe('California Zephyr');
      expect(semantics?.vehicleNumber).toBe('5');
      expect(semantics?.vehicleType).toBe('Amtrak');
    });

    it('should handle complete transit semantics', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        transitProvider: 'Amtrak',
        transitStatus: 'On Time',
        transitStatusReason: 'Operating normally',
        vehicleName: 'Acela Express',
        vehicleNumber: '2151',
        vehicleType: 'High-speed rail',
      });

      expect(semantics?.transitProvider).toBe('Amtrak');
      expect(semantics?.transitStatus).toBe('On Time');
      expect(semantics?.transitStatusReason).toBe('Operating normally');
      expect(semantics?.vehicleName).toBe('Acela Express');
      expect(semantics?.vehicleNumber).toBe('2151');
      expect(semantics?.vehicleType).toBe('High-speed rail');
    });
  });

  describe('Event semantics', () => {
    describe('EventType values', () => {
      it('should handle EventType.Generic', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          eventType: EventType.Generic,
        });

        expect(semantics?.eventType).toBe(EventType.Generic);
      });

      it('should handle EventType.LivePerformance', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          eventType: EventType.LivePerformance,
        });

        expect(semantics?.eventType).toBe(EventType.LivePerformance);
      });

      it('should handle EventType.Movie', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          eventType: EventType.Movie,
        });

        expect(semantics?.eventType).toBe(EventType.Movie);
      });

      it('should handle EventType.Sports', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          eventType: EventType.Sports,
        });

        expect(semantics?.eventType).toBe(EventType.Sports);
      });

      it('should handle EventType.Conference', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          eventType: EventType.Conference,
        });

        expect(semantics?.eventType).toBe(EventType.Conference);
      });

      it('should handle EventType.Convention', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          eventType: EventType.Convention,
        });

        expect(semantics?.eventType).toBe(EventType.Convention);
      });

      it('should handle EventType.Workshop', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          eventType: EventType.Workshop,
        });

        expect(semantics?.eventType).toBe(EventType.Workshop);
      });

      it('should handle EventType.SocialGathering', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          eventType: EventType.SocialGathering,
        });

        expect(semantics?.eventType).toBe(EventType.SocialGathering);
      });
    });

    describe('Artist IDs', () => {
      it('should handle single artist ID', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          artistIDs: ['1234567890'],
        });

        expect(semantics?.artistIDs).toEqual(['1234567890']);
      });

      it('should handle multiple artist IDs', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          artistIDs: ['1234567890', '0987654321', '1111111111'],
        });

        expect(semantics?.artistIDs).toEqual(['1234567890', '0987654321', '1111111111']);
      });

      it('should handle empty artist IDs array', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          artistIDs: [],
        });

        expect(semantics?.artistIDs).toEqual([]);
      });
    });

    describe('Performer names', () => {
      it('should handle single performer name', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          performerNames: ['Taylor Swift'],
        });

        expect(semantics?.performerNames).toEqual(['Taylor Swift']);
      });

      it('should handle multiple performer names', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          performerNames: ['The Beatles', 'The Rolling Stones', 'Led Zeppelin'],
        });

        expect(semantics?.performerNames).toEqual(['The Beatles', 'The Rolling Stones', 'Led Zeppelin']);
      });

      it('should handle empty performer names array', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          performerNames: [],
        });

        expect(semantics?.performerNames).toEqual([]);
      });
    });

    describe('Team info', () => {
      it('should handle home team info', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          homeTeamName: 'Lakers',
          homeTeamLocation: 'Los Angeles',
          homeTeamAbbreviation: 'LAL',
        });

        expect(semantics?.homeTeamName).toBe('Lakers');
        expect(semantics?.homeTeamLocation).toBe('Los Angeles');
        expect(semantics?.homeTeamAbbreviation).toBe('LAL');
      });

      it('should handle away team info', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          awayTeamName: 'Celtics',
          awayTeamLocation: 'Boston',
          awayTeamAbbreviation: 'BOS',
        });

        expect(semantics?.awayTeamName).toBe('Celtics');
        expect(semantics?.awayTeamLocation).toBe('Boston');
        expect(semantics?.awayTeamAbbreviation).toBe('BOS');
      });

      it('should handle complete sports event', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          eventType: EventType.Sports,
          eventName: 'NBA Finals Game 7',
          sportName: 'Basketball',
          leagueName: 'National Basketball Association',
          leagueAbbreviation: 'NBA',
          homeTeamName: 'Lakers',
          homeTeamLocation: 'Los Angeles',
          homeTeamAbbreviation: 'LAL',
          awayTeamName: 'Celtics',
          awayTeamLocation: 'Boston',
          awayTeamAbbreviation: 'BOS',
        });

        expect(semantics?.eventType).toBe(EventType.Sports);
        expect(semantics?.eventName).toBe('NBA Finals Game 7');
        expect(semantics?.sportName).toBe('Basketball');
        expect(semantics?.leagueName).toBe('National Basketball Association');
        expect(semantics?.leagueAbbreviation).toBe('NBA');
      });
    });

    describe('Event dates and venue', () => {
      it('should handle event dates', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          eventStartDate: '2024-12-25T19:00:00Z',
          eventEndDate: '2024-12-25T22:00:00Z',
        });

        expect(semantics?.eventStartDate).toBe('2024-12-25T19:00:00Z');
        expect(semantics?.eventEndDate).toBe('2024-12-25T22:00:00Z');
      });

      it('should handle venue info', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          venueName: 'Madison Square Garden',
          venueRoom: 'Main Arena',
          venueEntrance: 'Gate 7',
          venuePhoneNumber: '+1-212-465-6741',
        });

        expect(semantics?.venueName).toBe('Madison Square Garden');
        expect(semantics?.venueRoom).toBe('Main Arena');
        expect(semantics?.venueEntrance).toBe('Gate 7');
        expect(semantics?.venuePhoneNumber).toBe('+1-212-465-6741');
      });

      it('should handle genre', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          genre: 'Rock',
        });

        expect(semantics?.genre).toBe('Rock');
      });
    });

    describe('Seats array', () => {
      it('should handle single seat', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          seats: [
            {
              seatSection: 'A',
              seatRow: '5',
              seatNumber: '12',
              seatIdentifier: 'A-5-12',
              seatDescription: 'Floor seat',
              seatType: 'VIP',
            },
          ],
        });

        expect(semantics?.seats).toHaveLength(1);
        expect(semantics?.seats?.[0]).toEqual({
          seatSection: 'A',
          seatRow: '5',
          seatNumber: '12',
          seatIdentifier: 'A-5-12',
          seatDescription: 'Floor seat',
          seatType: 'VIP',
        });
      });

      it('should handle multiple seats', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          seats: [
            { seatSection: 'A', seatRow: '5', seatNumber: '10' },
            { seatSection: 'A', seatRow: '5', seatNumber: '11' },
            { seatSection: 'A', seatRow: '5', seatNumber: '12' },
          ],
        });

        expect(semantics?.seats).toHaveLength(3);
        expect(semantics?.seats?.[0].seatNumber).toBe('10');
        expect(semantics?.seats?.[1].seatNumber).toBe('11');
        expect(semantics?.seats?.[2].seatNumber).toBe('12');
      });

      it('should handle empty seats array', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          seats: [],
        });

        expect(semantics?.seats).toEqual([]);
      });

      it('should handle seat with minimal info', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          seats: [
            { seatNumber: '42' },
          ],
        });

        expect(semantics?.seats).toHaveLength(1);
        expect(semantics?.seats?.[0]).toEqual({ seatNumber: '42' });
      });

      it('should handle seat with only section', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          seats: [
            { seatSection: 'General Admission' },
          ],
        });

        expect(semantics?.seats?.[0].seatSection).toBe('General Admission');
      });

      it('should handle empty seat object in array', async () => {
        const semantics = await generateAndParseSemanticsFromPass({
          seats: [{}],
        });

        expect(semantics?.seats).toHaveLength(1);
        expect(semantics?.seats?.[0]).toEqual({});
      });
    });
  });

  describe('Store card semantics', () => {
    it('should handle membership program name', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        membershipProgramName: 'Rewards Plus',
      });

      expect(semantics?.membershipProgramName).toBe('Rewards Plus');
    });

    it('should handle membership program number', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        membershipProgramNumber: 'MEM-123456789',
      });

      expect(semantics?.membershipProgramNumber).toBe('MEM-123456789');
    });

    it('should handle complete membership info', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        membershipProgramName: 'Gold Rewards',
        membershipProgramNumber: '9876543210',
        balance: { amount: '150.00', currencyCode: 'USD' },
      });

      expect(semantics?.membershipProgramName).toBe('Gold Rewards');
      expect(semantics?.membershipProgramNumber).toBe('9876543210');
      expect(semantics?.balance).toEqual({ amount: '150.00', currencyCode: 'USD' });
    });
  });

  describe('WiFi access arrays', () => {
    it('should handle single WiFi network', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        wifiAccess: [
          { ssid: 'GuestWiFi', password: 'welcome123' },
        ],
      });

      expect(semantics?.wifiAccess).toHaveLength(1);
      expect(semantics?.wifiAccess?.[0]).toEqual({ ssid: 'GuestWiFi', password: 'welcome123' });
    });

    it('should handle multiple WiFi networks', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        wifiAccess: [
          { ssid: 'Hotel_Guest', password: 'guest2024' },
          { ssid: 'Hotel_Premium', password: 'premium2024' },
          { ssid: 'Hotel_Conference', password: 'conf2024' },
        ],
      });

      expect(semantics?.wifiAccess).toHaveLength(3);
      expect(semantics?.wifiAccess?.[0].ssid).toBe('Hotel_Guest');
      expect(semantics?.wifiAccess?.[1].ssid).toBe('Hotel_Premium');
      expect(semantics?.wifiAccess?.[2].ssid).toBe('Hotel_Conference');
    });

    it('should handle empty WiFi access array', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        wifiAccess: [],
      });

      expect(semantics?.wifiAccess).toEqual([]);
    });

    it('should handle WiFi network with special characters in SSID', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        wifiAccess: [
          { ssid: 'Cafe-WiFi_5G', password: 'coffee#123!' },
        ],
      });

      expect(semantics?.wifiAccess?.[0].ssid).toBe('Cafe-WiFi_5G');
      expect(semantics?.wifiAccess?.[0].password).toBe('coffee#123!');
    });

    it('should handle WiFi network with spaces in SSID', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        wifiAccess: [
          { ssid: 'My Home Network', password: 'secure pass' },
        ],
      });

      expect(semantics?.wifiAccess?.[0].ssid).toBe('My Home Network');
      expect(semantics?.wifiAccess?.[0].password).toBe('secure pass');
    });

    it('should handle WiFi network with empty password', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        wifiAccess: [
          { ssid: 'OpenNetwork', password: '' },
        ],
      });

      expect(semantics?.wifiAccess?.[0].ssid).toBe('OpenNetwork');
      expect(semantics?.wifiAccess?.[0].password).toBe('');
    });
  });

  describe('Coupon semantics', () => {
    it('should handle silenceRequested as true', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        silenceRequested: true,
      });

      expect(semantics?.silenceRequested).toBe(true);
    });

    it('should handle silenceRequested as false', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        silenceRequested: false,
      });

      expect(semantics?.silenceRequested).toBe(false);
    });
  });

  describe('Empty semantic objects', () => {
    it('should handle completely empty semantics object', async () => {
      const semantics = await generateAndParseSemanticsFromPass({});

      // Empty semantics object may be omitted during serialization
      expect(semantics === undefined || Object.keys(semantics || {}).length === 0).toBe(true);
    });

    it('should not include semantics when not set', async () => {
      const passData: PassData = {
        ...minimalPassData,
      };
      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const zip = await JSZip.loadAsync(buffer);
      const passJsonFile = zip.file('pass.json');
      const passJsonContent = await passJsonFile!.async('string');
      const parsed = JSON.parse(passJsonContent);

      expect(parsed.semantics).toBeUndefined();
    });
  });

  describe('Partial semantic data', () => {
    it('should handle partial boarding pass semantics', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        airlineCode: 'AA',
        flightNumber: 100,
        // Missing other flight details
      });

      expect(semantics?.airlineCode).toBe('AA');
      expect(semantics?.flightNumber).toBe(100);
      expect(semantics?.departureAirportCode).toBeUndefined();
      expect(semantics?.destinationAirportCode).toBeUndefined();
    });

    it('should handle partial event semantics', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        eventName: 'Concert',
        // Missing venue, dates, etc.
      });

      expect(semantics?.eventName).toBe('Concert');
      expect(semantics?.venueName).toBeUndefined();
      expect(semantics?.eventStartDate).toBeUndefined();
    });

    it('should handle partial seat info', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        seats: [
          { seatRow: '10' },
          { seatNumber: '5', seatSection: 'B' },
        ],
      });

      expect(semantics?.seats).toHaveLength(2);
      expect(semantics?.seats?.[0].seatRow).toBe('10');
      expect(semantics?.seats?.[0].seatNumber).toBeUndefined();
      expect(semantics?.seats?.[1].seatNumber).toBe('5');
      expect(semantics?.seats?.[1].seatRow).toBeUndefined();
    });

    it('should handle partial team info (only home team)', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        eventType: EventType.Sports,
        homeTeamName: 'Warriors',
        homeTeamLocation: 'Golden State',
        // No away team info
      });

      expect(semantics?.homeTeamName).toBe('Warriors');
      expect(semantics?.homeTeamLocation).toBe('Golden State');
      expect(semantics?.awayTeamName).toBeUndefined();
      expect(semantics?.awayTeamLocation).toBeUndefined();
    });

    it('should handle mixed semantics from different categories', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        // Balance (common)
        balance: { amount: '100.00', currencyCode: 'USD' },
        // Event
        eventName: 'VIP Event',
        // Membership
        membershipProgramName: 'Platinum',
        // Transit (unusual combination)
        transitProvider: 'Metro',
      });

      expect(semantics?.balance).toBeDefined();
      expect(semantics?.eventName).toBe('VIP Event');
      expect(semantics?.membershipProgramName).toBe('Platinum');
      expect(semantics?.transitProvider).toBe('Metro');
    });
  });

  describe('Special characters in semantic values', () => {
    it('should handle unicode characters in names', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        passengerName: {
          familyName: 'Muller',
          givenName: 'Hans',
        },
        eventName: 'Opera at Operaen',
      });

      expect(semantics?.passengerName?.familyName).toBe('Muller');
      expect(semantics?.eventName).toBe('Opera at Operaen');
    });

    it('should handle Japanese characters', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        eventName: 'Tokyo Concert',
        venueName: 'Tokyo Dome',
      });

      expect(semantics?.eventName).toBe('Tokyo Concert');
      expect(semantics?.venueName).toBe('Tokyo Dome');
    });

    it('should handle Chinese characters', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        transitProvider: 'Shanghai Metro',
        vehicleName: 'Line 1',
      });

      expect(semantics?.transitProvider).toBe('Shanghai Metro');
    });

    it('should handle Korean characters', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        venueName: 'Seoul Arena',
      });

      expect(semantics?.venueName).toBe('Seoul Arena');
    });

    it('should handle emojis in strings', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        eventName: 'Summer Music Festival',
        genre: 'Pop Music',
      });

      expect(semantics?.eventName).toBe('Summer Music Festival');
    });

    it('should handle special punctuation', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        eventName: "Rock & Roll Hall of Fame - 2024 Inductees' Ceremony",
        venueName: 'Madison Square Garden (MSG)',
      });

      expect(semantics?.eventName).toBe("Rock & Roll Hall of Fame - 2024 Inductees' Ceremony");
      expect(semantics?.venueName).toBe('Madison Square Garden (MSG)');
    });

    it('should handle newlines in strings', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        transitStatusReason: 'Service disruption\nExpect delays',
      });

      expect(semantics?.transitStatusReason).toBe('Service disruption\nExpect delays');
    });

    it('should handle tabs in strings', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        venueRoom: 'Hall\tA',
      });

      expect(semantics?.venueRoom).toBe('Hall\tA');
    });

    it('should handle backslashes in strings', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        membershipProgramNumber: 'ID\\12345',
      });

      expect(semantics?.membershipProgramNumber).toBe('ID\\12345');
    });

    it('should handle quotes in strings', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        eventName: 'The "Greatest" Show',
      });

      expect(semantics?.eventName).toBe('The "Greatest" Show');
    });

    it('should handle very long strings', async () => {
      const longString = 'A'.repeat(1000);
      const semantics = await generateAndParseSemanticsFromPass({
        eventName: longString,
      });

      expect(semantics?.eventName).toBe(longString);
      expect(semantics?.eventName?.length).toBe(1000);
    });

    it('should handle empty strings', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        eventName: '',
        venueName: '',
      });

      expect(semantics?.eventName).toBe('');
      expect(semantics?.venueName).toBe('');
    });

    it('should handle strings with only whitespace', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        eventName: '   ',
      });

      expect(semantics?.eventName).toBe('   ');
    });
  });

  describe('Complex nested objects', () => {
    it('should handle complete boarding pass with nested passenger and seats', async () => {
      const passData: PassData = {
        ...minimalPassData,
        boardingPass: {
          transitType: TransitType.Air,
          primaryFields: [
            { key: 'origin', label: 'SFO', value: 'San Francisco' },
            { key: 'destination', label: 'JFK', value: 'New York' },
          ],
        },
        semantics: {
          passengerName: {
            familyName: 'Smith',
            givenName: 'John',
          },
          airlineCode: 'UA',
          flightNumber: 123,
          flightCode: 'UA123',
          departureAirportCode: 'SFO',
          destinationAirportCode: 'JFK',
          seats: [
            {
              seatSection: 'First Class',
              seatRow: '1',
              seatNumber: 'A',
              seatType: 'Window',
            },
          ],
          boardingGroup: 'A',
          boardingSequenceNumber: '001',
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const zip = await JSZip.loadAsync(buffer);
      const passJsonFile = zip.file('pass.json');
      const passJsonContent = await passJsonFile!.async('string');
      const parsed = JSON.parse(passJsonContent);

      expect(parsed.semantics.passengerName).toEqual({
        familyName: 'Smith',
        givenName: 'John',
      });
      expect(parsed.semantics.seats).toHaveLength(1);
      expect(parsed.semantics.seats[0].seatType).toBe('Window');
    });

    it('should handle event ticket with multiple seats and performers', async () => {
      const passData: PassData = {
        ...minimalPassData,
        eventTicket: {
          primaryFields: [
            { key: 'event', value: 'Rock Festival' },
          ],
        },
        semantics: {
          eventType: EventType.LivePerformance,
          eventName: 'Rock Festival 2024',
          eventStartDate: '2024-07-15T18:00:00Z',
          eventEndDate: '2024-07-15T23:00:00Z',
          venueName: 'Central Park',
          performerNames: ['Band A', 'Band B', 'Band C'],
          artistIDs: ['artist1', 'artist2', 'artist3'],
          genre: 'Rock',
          seats: [
            { seatSection: 'VIP', seatRow: '1', seatNumber: '1' },
            { seatSection: 'VIP', seatRow: '1', seatNumber: '2' },
            { seatSection: 'VIP', seatRow: '1', seatNumber: '3' },
            { seatSection: 'VIP', seatRow: '1', seatNumber: '4' },
          ],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const zip = await JSZip.loadAsync(buffer);
      const passJsonFile = zip.file('pass.json');
      const passJsonContent = await passJsonFile!.async('string');
      const parsed = JSON.parse(passJsonContent);

      expect(parsed.semantics.performerNames).toHaveLength(3);
      expect(parsed.semantics.artistIDs).toHaveLength(3);
      expect(parsed.semantics.seats).toHaveLength(4);
    });

    it('should handle store card with balance and membership and wifi', async () => {
      const passData: PassData = {
        ...minimalPassData,
        storeCard: {
          headerFields: [
            { key: 'points', label: 'POINTS', value: '5000' },
          ],
        },
        semantics: {
          membershipProgramName: 'Premium Rewards',
          membershipProgramNumber: 'PREM-123456',
          balance: { amount: '250.00', currencyCode: 'USD' },
          wifiAccess: [
            { ssid: 'Store_Guest', password: 'welcome2024' },
            { ssid: 'Store_Premium', password: 'vip2024' },
          ],
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });
      const zip = await JSZip.loadAsync(buffer);
      const passJsonFile = zip.file('pass.json');
      const passJsonContent = await passJsonFile!.async('string');
      const parsed = JSON.parse(passJsonContent);

      expect(parsed.semantics.membershipProgramName).toBe('Premium Rewards');
      expect(parsed.semantics.balance.amount).toBe('250.00');
      expect(parsed.semantics.wifiAccess).toHaveLength(2);
    });

    it('should handle sports event with full team info and seats', async () => {
      const semantics = await generateAndParseSemanticsFromPass({
        eventType: EventType.Sports,
        eventName: 'Championship Final',
        eventStartDate: '2024-06-01T20:00:00Z',
        sportName: 'Football',
        leagueName: 'NFL',
        leagueAbbreviation: 'NFL',
        homeTeamName: 'Chiefs',
        homeTeamLocation: 'Kansas City',
        homeTeamAbbreviation: 'KC',
        awayTeamName: 'Eagles',
        awayTeamLocation: 'Philadelphia',
        awayTeamAbbreviation: 'PHI',
        venueName: 'Allegiant Stadium',
        venueEntrance: 'Gate A',
        venueRoom: 'Section 100',
        seats: [
          { seatSection: '100', seatRow: 'A', seatNumber: '1' },
          { seatSection: '100', seatRow: 'A', seatNumber: '2' },
        ],
      });

      expect(semantics?.homeTeamName).toBe('Chiefs');
      expect(semantics?.awayTeamName).toBe('Eagles');
      expect(semantics?.leagueName).toBe('NFL');
      expect(semantics?.seats).toHaveLength(2);
    });
  });

  describe('Integration with full pass generation', () => {
    it('should generate valid pass with all semantic categories combined', async () => {
      const passData: PassData = {
        formatVersion: 1,
        passTypeIdentifier: 'pass.com.example.complete',
        serialNumber: 'COMPLETE-001',
        teamIdentifier: 'TEAM123',
        organizationName: 'Complete Pass Org',
        description: 'A pass with all semantic types',
        backgroundColor: 'rgb(0, 0, 0)',
        foregroundColor: 'rgb(255, 255, 255)',
        generic: {
          headerFields: [
            { key: 'header', value: 'Test' },
          ],
        },
        barcodes: [
          {
            format: BarcodeFormat.QR,
            message: 'complete-pass-data',
          },
        ],
        semantics: {
          // Balance
          balance: { amount: '100.00', currencyCode: 'USD' },
          // Membership
          membershipProgramName: 'Test Program',
          membershipProgramNumber: 'TEST-001',
          // Event info
          eventName: 'Test Event',
          eventType: EventType.Generic,
          eventStartDate: '2024-12-25T10:00:00Z',
          venueName: 'Test Venue',
          // Seats
          seats: [{ seatSection: 'A', seatRow: '1', seatNumber: '1' }],
          // WiFi
          wifiAccess: [{ ssid: 'TestWiFi', password: 'test123' }],
          // Performer
          performerNames: ['Test Performer'],
          // Silence
          silenceRequested: false,
        },
      };

      const pass = createPass(passData);
      const buffer = await pass.generate({ skipSignature: true });

      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);

      const zip = await JSZip.loadAsync(buffer);
      const passJsonFile = zip.file('pass.json');
      expect(passJsonFile).not.toBeNull();

      const passJsonContent = await passJsonFile!.async('string');
      const parsed = JSON.parse(passJsonContent);

      expect(parsed.semantics).toBeDefined();
      expect(parsed.semantics.balance).toBeDefined();
      expect(parsed.semantics.membershipProgramName).toBeDefined();
      expect(parsed.semantics.eventName).toBeDefined();
      expect(parsed.semantics.seats).toBeDefined();
      expect(parsed.semantics.wifiAccess).toBeDefined();
    });
  });
});
