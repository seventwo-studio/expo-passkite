import 'dart:io';
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:passkite/pkpass/barcode.dart';
import 'package:passkite/pkpass/image.dart';
import 'package:passkite/pkpass/pass.dart';
import 'package:passkite/pkpass/pass_data.dart';
import 'package:passkite/pkpass/pass_field_content.dart';
import 'package:passkite/pkpass/pass_fields.dart';
import 'package:passkite/pkpass/personalize.dart';

void main() {
  group('Pass Generation Tests', () {
    late PassData basePassData;
    late String testCertificatePath;
    late String testPrivateKeyPath;
    late String testCertificatePem;
    late String testPrivateKeyPem;

    setUp(() {
      basePassData = PassData(
        description: 'Test Pass',
        organizationName: 'Test Organization',
        passTypeIdentifier: 'pass.com.example.test',
        serialNumber: '1234567890',
        teamIdentifier: 'ABCDE12345',
      );

      // These paths should be updated with actual test certificate and key paths
      testCertificatePath = 'test/certificates/test.pem';
      testPrivateKeyPath = 'test/certificates/test_key.pem';

      // For testing, we'll use dummy certificate and key data
      testCertificatePem =
          '-----BEGIN CERTIFICATE-----\nTEST\n-----END CERTIFICATE-----';
      testPrivateKeyPem =
          '-----BEGIN PRIVATE KEY-----\nTEST\n-----END PRIVATE KEY-----';
    });

    test('Generate basic generic pass', () {
      final pass = Pass(
        data: basePassData,
      );

      final passBytes = pass.generate(
        certificatePem: null,
        privateKeyPem: null,
      );
      expect(passBytes, isNotNull);
      expect(passBytes!.length, greaterThan(0));

      // Write to file for manual verification
      final file = File('test_generic_pass.pkpass');
      file.writeAsBytesSync(passBytes);
      print('Generic pass written to ${file.path}');
    });

    test('Generate boarding pass with all fields', () {
      final boardingPassData = PassData(
        description: basePassData.description,
        organizationName: basePassData.organizationName,
        passTypeIdentifier: basePassData.passTypeIdentifier,
        serialNumber: basePassData.serialNumber,
        teamIdentifier: basePassData.teamIdentifier,
        boardingPass: BoardingPass(
          transitType: TransitType.air,
          primaryFields: [
            PassFieldContent(
              key: 'departure',
              label: 'Departure',
              value: 'San Francisco',
            ),
            PassFieldContent(
              key: 'arrival',
              label: 'Arrival',
              value: 'New York',
            ),
          ],
          secondaryFields: [
            PassFieldContent(
              key: 'flight',
              label: 'Flight',
              value: 'AA123',
            ),
          ],
          auxiliaryFields: [
            PassFieldContent(
              key: 'gate',
              label: 'Gate',
              value: 'A12',
            ),
          ],
          backFields: [
            PassFieldContent(
              key: 'terms',
              label: 'Terms',
              value: 'Please arrive 2 hours before departure',
            ),
          ],
        ),
      );

      final pass = Pass(
        data: boardingPassData,
      );

      final passBytes = pass.generate(
        certificatePem: null,
        privateKeyPem: null,
      );
      expect(passBytes, isNotNull);
      expect(passBytes!.length, greaterThan(0));

      final file = File('test_boarding_pass.pkpass');
      file.writeAsBytesSync(passBytes);
      print('Boarding pass written to ${file.path}');
    });

    test('Generate coupon pass with barcode', () {
      final couponPassData = PassData(
        description: basePassData.description,
        organizationName: basePassData.organizationName,
        passTypeIdentifier: basePassData.passTypeIdentifier,
        serialNumber: basePassData.serialNumber,
        teamIdentifier: basePassData.teamIdentifier,
        coupon: Coupon(
          primaryFields: [
            PassFieldContent(
              key: 'discount',
              label: 'Discount',
              value: '20% OFF',
            ),
          ],
        ),
        barcodes: [
          Barcode(
            message: 'COUPON123',
            format: PkPassBarcodeType.qr,
            messageEncoding: 'iso-8859-1',
            altText: '20% OFF Coupon',
          ),
        ],
      );

      final pass = Pass(
        data: couponPassData,
      );

      final passBytes = pass.generate(
        certificatePem: null,
        privateKeyPem: null,
      );
      expect(passBytes, isNotNull);
      expect(passBytes!.length, greaterThan(0));

      final file = File('test_coupon_pass.pkpass');
      file.writeAsBytesSync(passBytes);
      print('Coupon pass written to ${file.path}');
    });

    test('Generate event ticket with images', () {
      // Create test images
      final logoImage = Uint8List.fromList([1, 2, 3, 4]); // Mock image data
      final thumbnailImage =
          Uint8List.fromList([5, 6, 7, 8]); // Mock image data

      final eventTicketData = PassData(
        description: basePassData.description,
        organizationName: basePassData.organizationName,
        passTypeIdentifier: basePassData.passTypeIdentifier,
        serialNumber: basePassData.serialNumber,
        teamIdentifier: basePassData.teamIdentifier,
        eventTicket: EventTicket(
          primaryFields: [
            PassFieldContent(
              key: 'event',
              label: 'Event',
              value: 'Summer Music Festival',
            ),
          ],
          secondaryFields: [
            PassFieldContent(
              key: 'date',
              label: 'Date',
              value: '2024-07-15',
            ),
          ],
        ),
      );

      final pass = Pass(
        data: eventTicketData,
        logo: PKImage(
          name: 'logo',
          images: {1: logoImage},
        ),
        thumbnail: PKImage(
          name: 'thumbnail',
          images: {1: thumbnailImage},
        ),
      );

      final passBytes = pass.generate(
        certificatePem: null,
        privateKeyPem: null,
      );
      expect(passBytes, isNotNull);
      expect(passBytes!.length, greaterThan(0));

      final file = File('test_event_ticket.pkpass');
      file.writeAsBytesSync(passBytes);
      print('Event ticket written to ${file.path}');
    });

    test('Generate store card with personalization', () {
      final storeCardData = PassData(
        description: basePassData.description,
        organizationName: basePassData.organizationName,
        passTypeIdentifier: basePassData.passTypeIdentifier,
        serialNumber: basePassData.serialNumber,
        teamIdentifier: basePassData.teamIdentifier,
        storeCard: StoreCard(
          primaryFields: [
            PassFieldContent(
              key: 'balance',
              label: 'Balance',
              value: '\$50.00',
            ),
          ],
        ),
        userInfo: {
          'personalize': Personalize(
            description: 'Join our loyalty program',
            requiredPersonalizationFields: ['name', 'email'],
            termsAndConditions: 'Terms and conditions apply',
          ).toJson(),
        },
      );

      final pass = Pass(
        data: storeCardData,
      );

      final passBytes = pass.generate(
        certificatePem: null,
        privateKeyPem: null,
      );
      expect(passBytes, isNotNull);
      expect(passBytes!.length, greaterThan(0));

      final file = File('test_store_card.pkpass');
      file.writeAsBytesSync(passBytes);
      print('Store card written to ${file.path}');
    });

    test('Pass generation with empty organization name', () {
      final invalidPassData = PassData(
        description: 'Test Pass',
        organizationName: '', // Empty organization name
        passTypeIdentifier: 'pass.com.example.test',
        serialNumber: '1234567890',
        teamIdentifier: 'ABCDE12345',
      );

      final pass = Pass(
        data: invalidPassData,
      );

      final passBytes = pass.generate(
        certificatePem: null,
        privateKeyPem: null,
      );
      expect(passBytes, isNotNull);
      expect(passBytes!.length, greaterThan(0));

      // Write to file for manual verification
      final file = File('test_empty_org_pass.pkpass');
      file.writeAsBytesSync(passBytes);
      print('Pass with empty organization name written to ${file.path}');
    });

    test('Pass generation with empty barcode message', () {
      final invalidPassData = PassData(
        description: 'Test Pass',
        organizationName: 'Test Organization',
        passTypeIdentifier: 'pass.com.example.test',
        serialNumber: '1234567890',
        teamIdentifier: 'ABCDE12345',
        barcodes: [
          Barcode(
            message: '', // Empty message
            format: PkPassBarcodeType.qr,
            messageEncoding: 'iso-8859-1',
            altText: 'Empty Barcode',
          ),
        ],
      );

      final pass = Pass(
        data: invalidPassData,
      );

      final passBytes = pass.generate(
        certificatePem: null,
        privateKeyPem: null,
      );
      expect(passBytes, isNotNull);
      expect(passBytes!.length, greaterThan(0));

      // Write to file for manual verification
      final file = File('test_empty_barcode_pass.pkpass');
      file.writeAsBytesSync(passBytes);
      print('Pass with empty barcode message written to ${file.path}');
    });

    test('Pass generation with invalid image data', () {
      final invalidImage =
          Uint8List.fromList([0, 1, 2, 3]); // Not a valid PNG image

      final invalidPassData = PassData(
        description: 'Test Pass',
        organizationName: 'Test Organization',
        passTypeIdentifier: 'pass.com.example.test',
        serialNumber: '1234567890',
        teamIdentifier: 'ABCDE12345',
      );

      final pass = Pass(
        data: invalidPassData,
        logo: PKImage(
          name: 'logo',
          images: {1: invalidImage},
        ),
      );

      final passBytes = pass.generate(
        certificatePem: null,
        privateKeyPem: null,
      );
      expect(passBytes, isNotNull);
      expect(passBytes!.length, greaterThan(0));

      // Write to file for manual verification
      final file = File('test_invalid_image_pass.pkpass');
      file.writeAsBytesSync(passBytes);
      print('Pass with invalid image data written to ${file.path}');
    });
  });
}
