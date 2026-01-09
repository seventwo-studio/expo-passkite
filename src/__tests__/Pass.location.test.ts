import JSZip from "jszip";
import { createPass, type Pass } from "../Pass";
import { createPassBuilder } from "../PassBuilder";
import type { Beacon, Location, PassData } from "../types";

describe("Pass Location and Beacon Edge Cases", () => {
	const minimalPassData: PassData = {
		formatVersion: 1,
		passTypeIdentifier: "pass.com.example.test",
		serialNumber: "TEST-001",
		teamIdentifier: "ABCD1234",
		organizationName: "Test Organization",
		description: "Test Pass",
	};

	// Helper function to create a builder with required fields
	const createValidBuilder = () => {
		return createPassBuilder()
			.setIdentifiers({
				passTypeIdentifier: "pass.com.example.test",
				serialNumber: "TEST-001",
				teamIdentifier: "ABCD1234",
			})
			.setOrganization({
				organizationName: "Test Corp",
				description: "Test Pass",
			});
	};

	// Helper to extract pass.json from generated pass
	const extractPassJson = async (pass: Pass): Promise<PassData> => {
		const buffer = await pass.generate({ skipSignature: true });
		const zip = await JSZip.loadAsync(buffer);
		const passJsonFile = zip.file("pass.json");
		const passJsonContent = await passJsonFile?.async("string");
		return JSON.parse(passJsonContent ?? "{}");
	};

	describe("Location Boundary Values", () => {
		describe("Latitude Boundaries", () => {
			it("should accept minimum latitude value (-90)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: -90, longitude: 0 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations).toHaveLength(1);
				expect(parsed.locations?.[0].latitude).toBe(-90);
			});

			it("should accept maximum latitude value (90)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 90, longitude: 0 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].latitude).toBe(90);
			});

			it("should accept latitude value at equator (0)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: 0 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].latitude).toBe(0);
			});

			it("should accept slightly negative latitude near zero (-0.0001)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: -0.0001, longitude: 0 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].latitude).toBe(-0.0001);
			});

			it("should accept high-precision latitude values", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 37.7749295123456, longitude: -122.4194155 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].latitude).toBe(37.7749295123456);
			});

			it("should handle latitude slightly below boundary (-89.999999)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: -89.999999, longitude: 0 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].latitude).toBe(-89.999999);
			});

			it("should handle latitude slightly above boundary (89.999999)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 89.999999, longitude: 0 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].latitude).toBe(89.999999);
			});
		});

		describe("Longitude Boundaries", () => {
			it("should accept minimum longitude value (-180)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: -180 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].longitude).toBe(-180);
			});

			it("should accept maximum longitude value (180)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: 180 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].longitude).toBe(180);
			});

			it("should accept longitude at prime meridian (0)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: 0 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].longitude).toBe(0);
			});

			it("should accept high-precision longitude values", async () => {
				const highPrecisionLongitude = -122.41941551234568;
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: highPrecisionLongitude }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].longitude).toBeCloseTo(
					highPrecisionLongitude,
					10,
				);
			});

			it("should handle longitude slightly above minimum (-179.999999)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: -179.999999 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].longitude).toBe(-179.999999);
			});

			it("should handle longitude slightly below maximum (179.999999)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: 179.999999 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].longitude).toBe(179.999999);
			});
		});

		describe("Invalid Coordinates (Out of Range)", () => {
			it("should store latitude below -90 (Apple Wallet may reject)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: -91, longitude: 0 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				// The library stores the value; validation happens at Apple Wallet level
				expect(parsed.locations?.[0].latitude).toBe(-91);
			});

			it("should store latitude above 90 (Apple Wallet may reject)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 91, longitude: 0 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].latitude).toBe(91);
			});

			it("should store longitude below -180 (Apple Wallet may reject)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: -181 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].longitude).toBe(-181);
			});

			it("should store longitude above 180 (Apple Wallet may reject)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: 181 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].longitude).toBe(181);
			});

			it("should store extreme latitude values (Apple Wallet may reject)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 1000, longitude: 0 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].latitude).toBe(1000);
			});

			it("should store extreme longitude values (Apple Wallet may reject)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: -1000 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].longitude).toBe(-1000);
			});
		});

		describe("Altitude Edge Cases", () => {
			it("should accept zero altitude", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: 0, altitude: 0 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].altitude).toBe(0);
			});

			it("should accept negative altitude (below sea level)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 31.5, longitude: 35.5, altitude: -430 }], // Dead Sea
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].altitude).toBe(-430);
			});

			it("should accept very negative altitude", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: 0, altitude: -11000 }], // Mariana Trench depth
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].altitude).toBe(-11000);
			});

			it("should accept very high altitude (Mount Everest)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 27.9881, longitude: 86.925, altitude: 8848 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].altitude).toBe(8848);
			});

			it("should accept extreme altitude values (satellite orbit)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: 0, altitude: 35786000 }], // Geostationary orbit in meters
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].altitude).toBe(35786000);
			});

			it("should accept floating-point altitude", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: 0, altitude: 100.5 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].altitude).toBe(100.5);
			});

			it("should handle undefined altitude (optional field)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: 0 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].altitude).toBeUndefined();
			});
		});

		describe("relevantText with Special Characters", () => {
			it("should handle relevantText with emoji", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [
						{ latitude: 0, longitude: 0, relevantText: "Welcome! 🎉🎊" },
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].relevantText).toBe("Welcome! 🎉🎊");
			});

			it("should handle relevantText with unicode characters", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [
						{ latitude: 0, longitude: 0, relevantText: "日本語テキスト" },
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].relevantText).toBe("日本語テキスト");
			});

			it("should handle relevantText with special HTML characters", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [
						{
							latitude: 0,
							longitude: 0,
							relevantText: '<script>alert("test")</script>',
						},
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].relevantText).toBe(
					'<script>alert("test")</script>',
				);
			});

			it("should handle relevantText with quotes and backslashes", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [
						{
							latitude: 0,
							longitude: 0,
							relevantText: 'He said "Hello" with a \\ backslash',
						},
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].relevantText).toBe(
					'He said "Hello" with a \\ backslash',
				);
			});

			it("should handle relevantText with newlines and tabs", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [
						{ latitude: 0, longitude: 0, relevantText: "Line1\nLine2\tTabbed" },
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].relevantText).toBe("Line1\nLine2\tTabbed");
			});

			it("should handle empty relevantText", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: 0, relevantText: "" }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].relevantText).toBe("");
			});

			it("should handle very long relevantText", async () => {
				const longText = "A".repeat(1000);
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: 0, relevantText: longText }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].relevantText).toBe(longText);
				expect(parsed.locations?.[0].relevantText?.length).toBe(1000);
			});

			it("should handle relevantText with RTL characters (Arabic)", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 0, longitude: 0, relevantText: "مرحبا بك" }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].relevantText).toBe("مرحبا بك");
			});

			it("should handle relevantText with mixed RTL and LTR", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [
						{ latitude: 0, longitude: 0, relevantText: "Hello שלום World" },
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].relevantText).toBe("Hello שלום World");
			});
		});

		describe("Multiple Locations", () => {
			it("should handle the maximum recommended locations (10)", async () => {
				const locations: Location[] = Array.from({ length: 10 }, (_, i) => ({
					latitude: i * 10 - 45,
					longitude: i * 36 - 180,
					relevantText: `Location ${i + 1}`,
				}));

				const passData: PassData = {
					...minimalPassData,
					locations,
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations).toHaveLength(10);
				expect(parsed.locations?.[0].relevantText).toBe("Location 1");
				expect(parsed.locations?.[9].relevantText).toBe("Location 10");
			});

			it("should handle more than recommended locations (Apple Wallet limit)", async () => {
				// Apple Wallet has a limit but we should be able to pass data through
				const locations: Location[] = Array.from({ length: 20 }, (_, i) => ({
					latitude: i,
					longitude: i,
				}));

				const passData: PassData = {
					...minimalPassData,
					locations,
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations).toHaveLength(20);
			});

			it("should handle single location", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [{ latitude: 37.7749, longitude: -122.4194 }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations).toHaveLength(1);
			});

			it("should preserve order of multiple locations", async () => {
				const locations: Location[] = [
					{ latitude: 10, longitude: 20 },
					{ latitude: 30, longitude: 40 },
					{ latitude: 50, longitude: 60 },
				];

				const passData: PassData = {
					...minimalPassData,
					locations,
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations?.[0].latitude).toBe(10);
				expect(parsed.locations?.[1].latitude).toBe(30);
				expect(parsed.locations?.[2].latitude).toBe(50);
			});
		});

		describe("Empty Locations Array", () => {
			it("should handle empty locations array", async () => {
				const passData: PassData = {
					...minimalPassData,
					locations: [],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations).toEqual([]);
			});

			it("should handle undefined locations", async () => {
				const passData: PassData = {
					...minimalPassData,
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.locations).toBeUndefined();
			});
		});
	});

	describe("Beacon Edge Cases", () => {
		describe("Beacon UUID Formats", () => {
			it("should handle uppercase UUID with dashes", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [{ proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0" }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].proximityUUID).toBe(
					"E2C56DB5-DFFB-48D2-B060-D0F5A71096E0",
				);
			});

			it("should handle lowercase UUID with dashes", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [{ proximityUUID: "e2c56db5-dffb-48d2-b060-d0f5a71096e0" }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].proximityUUID).toBe(
					"e2c56db5-dffb-48d2-b060-d0f5a71096e0",
				);
			});

			it("should handle mixed-case UUID with dashes", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [{ proximityUUID: "E2c56dB5-DffB-48D2-b060-D0F5a71096e0" }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].proximityUUID).toBe(
					"E2c56dB5-DffB-48D2-b060-D0F5a71096e0",
				);
			});

			it("should handle UUID without dashes", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [{ proximityUUID: "E2C56DB5DFFB48D2B060D0F5A71096E0" }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].proximityUUID).toBe(
					"E2C56DB5DFFB48D2B060D0F5A71096E0",
				);
			});

			it("should handle lowercase UUID without dashes", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [{ proximityUUID: "e2c56db5dffb48d2b060d0f5a71096e0" }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].proximityUUID).toBe(
					"e2c56db5dffb48d2b060d0f5a71096e0",
				);
			});

			it("should handle UUID with curly braces (Windows format)", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [
						{ proximityUUID: "{E2C56DB5-DFFB-48D2-B060-D0F5A71096E0}" },
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				// Library passes through the value as-is
				expect(parsed.beacons?.[0].proximityUUID).toBe(
					"{E2C56DB5-DFFB-48D2-B060-D0F5A71096E0}",
				);
			});

			it("should handle UUID urn format", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [
						{ proximityUUID: "urn:uuid:e2c56db5-dffb-48d2-b060-d0f5a71096e0" },
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].proximityUUID).toBe(
					"urn:uuid:e2c56db5-dffb-48d2-b060-d0f5a71096e0",
				);
			});

			it("should handle all zeros UUID", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [{ proximityUUID: "00000000-0000-0000-0000-000000000000" }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].proximityUUID).toBe(
					"00000000-0000-0000-0000-000000000000",
				);
			});

			it("should handle all Fs UUID (max value)", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [{ proximityUUID: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF" }],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].proximityUUID).toBe(
					"FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
				);
			});
		});

		describe("Beacon Major/Minor Boundary Values", () => {
			it("should accept major value of 0", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [
						{ proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0", major: 0 },
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].major).toBe(0);
			});

			it("should accept major value of 65535 (max uint16)", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [
						{
							proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0",
							major: 65535,
						},
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].major).toBe(65535);
			});

			it("should accept minor value of 0", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [
						{ proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0", minor: 0 },
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].minor).toBe(0);
			});

			it("should accept minor value of 65535 (max uint16)", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [
						{
							proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0",
							minor: 65535,
						},
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].minor).toBe(65535);
			});

			it("should accept both major and minor at maximum values", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [
						{
							proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0",
							major: 65535,
							minor: 65535,
						},
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].major).toBe(65535);
				expect(parsed.beacons?.[0].minor).toBe(65535);
			});

			it("should accept both major and minor at zero", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [
						{
							proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0",
							major: 0,
							minor: 0,
						},
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].major).toBe(0);
				expect(parsed.beacons?.[0].minor).toBe(0);
			});

			it("should handle major without minor", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [
						{
							proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0",
							major: 100,
						},
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].major).toBe(100);
				expect(parsed.beacons?.[0].minor).toBeUndefined();
			});

			it("should handle minor without major", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [
						{
							proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0",
							minor: 200,
						},
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].major).toBeUndefined();
				expect(parsed.beacons?.[0].minor).toBe(200);
			});

			it("should store major value above 65535 (Apple Wallet may reject)", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [
						{
							proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0",
							major: 65536,
						},
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				// Library passes through; validation is at Apple Wallet level
				expect(parsed.beacons?.[0].major).toBe(65536);
			});

			it("should store negative major value (Apple Wallet may reject)", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [
						{
							proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0",
							major: -1,
						},
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].major).toBe(-1);
			});
		});

		describe("Beacon relevantText Edge Cases", () => {
			it("should handle relevantText with emoji", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [
						{
							proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0",
							relevantText: "You are near the store! 🏪",
						},
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].relevantText).toBe(
					"You are near the store! 🏪",
				);
			});

			it("should handle empty relevantText", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [
						{
							proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0",
							relevantText: "",
						},
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].relevantText).toBe("");
			});

			it("should handle very long relevantText", async () => {
				const longText = "B".repeat(500);
				const passData: PassData = {
					...minimalPassData,
					beacons: [
						{
							proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0",
							relevantText: longText,
						},
					],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].relevantText).toBe(longText);
			});
		});

		describe("Multiple Beacons", () => {
			it("should handle multiple beacons", async () => {
				const beacons: Beacon[] = [
					{
						proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0",
						major: 1,
						minor: 1,
					},
					{
						proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E1",
						major: 2,
						minor: 2,
					},
					{
						proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E2",
						major: 3,
						minor: 3,
					},
				];

				const passData: PassData = {
					...minimalPassData,
					beacons,
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons).toHaveLength(3);
			});

			it("should handle maximum recommended beacons (10)", async () => {
				const beacons: Beacon[] = Array.from({ length: 10 }, (_, i) => ({
					proximityUUID: `E2C56DB5-DFFB-48D2-B060-D0F5A7109${i.toString().padStart(3, "0")}`,
					major: i,
					minor: i * 10,
				}));

				const passData: PassData = {
					...minimalPassData,
					beacons,
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons).toHaveLength(10);
			});

			it("should preserve order of beacons", async () => {
				const beacons: Beacon[] = [
					{ proximityUUID: "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA", major: 1 },
					{ proximityUUID: "BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB", major: 2 },
					{ proximityUUID: "CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCCCCCC", major: 3 },
				];

				const passData: PassData = {
					...minimalPassData,
					beacons,
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons?.[0].major).toBe(1);
				expect(parsed.beacons?.[1].major).toBe(2);
				expect(parsed.beacons?.[2].major).toBe(3);
			});
		});

		describe("Empty Beacons Array", () => {
			it("should handle empty beacons array", async () => {
				const passData: PassData = {
					...minimalPassData,
					beacons: [],
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons).toEqual([]);
			});

			it("should handle undefined beacons", async () => {
				const passData: PassData = {
					...minimalPassData,
				};

				const pass = createPass(passData);
				const parsed = await extractPassJson(pass);

				expect(parsed.beacons).toBeUndefined();
			});
		});
	});

	describe("maxDistance Edge Cases", () => {
		it("should handle maxDistance of 0", async () => {
			const passData: PassData = {
				...minimalPassData,
				maxDistance: 0,
			};

			const pass = createPass(passData);
			const parsed = await extractPassJson(pass);

			expect(parsed.maxDistance).toBe(0);
		});

		it("should handle very small maxDistance (1 meter)", async () => {
			const passData: PassData = {
				...minimalPassData,
				maxDistance: 1,
			};

			const pass = createPass(passData);
			const parsed = await extractPassJson(pass);

			expect(parsed.maxDistance).toBe(1);
		});

		it("should handle typical maxDistance values (500 meters)", async () => {
			const passData: PassData = {
				...minimalPassData,
				maxDistance: 500,
			};

			const pass = createPass(passData);
			const parsed = await extractPassJson(pass);

			expect(parsed.maxDistance).toBe(500);
		});

		it("should handle large maxDistance (100km)", async () => {
			const passData: PassData = {
				...minimalPassData,
				maxDistance: 100000,
			};

			const pass = createPass(passData);
			const parsed = await extractPassJson(pass);

			expect(parsed.maxDistance).toBe(100000);
		});

		it("should handle very large maxDistance", async () => {
			const passData: PassData = {
				...minimalPassData,
				maxDistance: 40075000, // Earth's circumference in meters
			};

			const pass = createPass(passData);
			const parsed = await extractPassJson(pass);

			expect(parsed.maxDistance).toBe(40075000);
		});

		it("should handle floating-point maxDistance", async () => {
			const passData: PassData = {
				...minimalPassData,
				maxDistance: 100.5,
			};

			const pass = createPass(passData);
			const parsed = await extractPassJson(pass);

			expect(parsed.maxDistance).toBe(100.5);
		});

		it("should store negative maxDistance (Apple Wallet may reject)", async () => {
			const passData: PassData = {
				...minimalPassData,
				maxDistance: -100,
			};

			const pass = createPass(passData);
			const parsed = await extractPassJson(pass);

			// Library passes through; validation is at Apple Wallet level
			expect(parsed.maxDistance).toBe(-100);
		});

		it("should handle undefined maxDistance (use default)", async () => {
			const passData: PassData = {
				...minimalPassData,
			};

			const pass = createPass(passData);
			const parsed = await extractPassJson(pass);

			expect(parsed.maxDistance).toBeUndefined();
		});
	});

	describe("PassBuilder Location and Beacon Methods", () => {
		describe("addLocation via builder", () => {
			it("should add location with boundary latitude values via builder", () => {
				const builder = createValidBuilder();
				builder.addLocation({ latitude: -90, longitude: 0 });
				builder.addLocation({ latitude: 90, longitude: 0 });
				builder.addLocation({ latitude: 0, longitude: 0 });

				const { passData } = builder.build();

				expect(passData.locations).toHaveLength(3);
				expect(passData.locations?.[0].latitude).toBe(-90);
				expect(passData.locations?.[1].latitude).toBe(90);
				expect(passData.locations?.[2].latitude).toBe(0);
			});

			it("should add location with boundary longitude values via builder", () => {
				const builder = createValidBuilder();
				builder.addLocation({ latitude: 0, longitude: -180 });
				builder.addLocation({ latitude: 0, longitude: 180 });

				const { passData } = builder.build();

				expect(passData.locations?.[0].longitude).toBe(-180);
				expect(passData.locations?.[1].longitude).toBe(180);
			});

			it("should add location with all optional properties via builder", () => {
				const builder = createValidBuilder();
				builder.addLocation({
					latitude: 37.7749,
					longitude: -122.4194,
					altitude: 16,
					relevantText: "Welcome to San Francisco! 🌉",
				});

				const { passData } = builder.build();

				expect(passData.locations?.[0].altitude).toBe(16);
				expect(passData.locations?.[0].relevantText).toBe(
					"Welcome to San Francisco! 🌉",
				);
			});
		});

		describe("addBeacon via builder", () => {
			it("should add beacon with boundary major/minor values via builder", () => {
				const builder = createValidBuilder();
				builder.addBeacon({
					proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E0",
					major: 0,
					minor: 0,
				});
				builder.addBeacon({
					proximityUUID: "E2C56DB5-DFFB-48D2-B060-D0F5A71096E1",
					major: 65535,
					minor: 65535,
				});

				const { passData } = builder.build();

				expect(passData.beacons).toHaveLength(2);
				expect(passData.beacons?.[0].major).toBe(0);
				expect(passData.beacons?.[0].minor).toBe(0);
				expect(passData.beacons?.[1].major).toBe(65535);
				expect(passData.beacons?.[1].minor).toBe(65535);
			});

			it("should add beacon with lowercase UUID via builder", () => {
				const builder = createValidBuilder();
				builder.addBeacon({
					proximityUUID: "e2c56db5-dffb-48d2-b060-d0f5a71096e0",
				});

				const { passData } = builder.build();

				expect(passData.beacons?.[0].proximityUUID).toBe(
					"e2c56db5-dffb-48d2-b060-d0f5a71096e0",
				);
			});
		});

		describe("setMaxDistance via builder", () => {
			it("should set maxDistance to zero via builder", () => {
				const builder = createValidBuilder();
				builder.setMaxDistance(0);

				const { passData } = builder.build();

				expect(passData.maxDistance).toBe(0);
			});

			it("should set large maxDistance via builder", () => {
				const builder = createValidBuilder();
				builder.setMaxDistance(100000);

				const { passData } = builder.build();

				expect(passData.maxDistance).toBe(100000);
			});
		});

		describe("chaining location and beacon methods", () => {
			it("should support chaining multiple location and beacon calls", () => {
				const { passData } = createValidBuilder()
					.addLocation({ latitude: 0, longitude: 0 })
					.addLocation({ latitude: 1, longitude: 1 })
					.addBeacon({ proximityUUID: "UUID1" })
					.addBeacon({ proximityUUID: "UUID2" })
					.setMaxDistance(500)
					.build();

				expect(passData.locations).toHaveLength(2);
				expect(passData.beacons).toHaveLength(2);
				expect(passData.maxDistance).toBe(500);
			});
		});
	});

	describe("Combined Location and Beacon Edge Cases", () => {
		it("should handle pass with both locations and beacons at extremes", async () => {
			const passData: PassData = {
				...minimalPassData,
				locations: [
					{
						latitude: -90,
						longitude: -180,
						altitude: -11000,
						relevantText: "Extreme point 1",
					},
					{
						latitude: 90,
						longitude: 180,
						altitude: 35786000,
						relevantText: "Extreme point 2",
					},
				],
				beacons: [
					{
						proximityUUID: "00000000-0000-0000-0000-000000000000",
						major: 0,
						minor: 0,
					},
					{
						proximityUUID: "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
						major: 65535,
						minor: 65535,
					},
				],
				maxDistance: 0,
			};

			const pass = createPass(passData);
			const parsed = await extractPassJson(pass);

			expect(parsed.locations).toHaveLength(2);
			expect(parsed.beacons).toHaveLength(2);
			expect(parsed.locations?.[0].latitude).toBe(-90);
			expect(parsed.locations?.[1].altitude).toBe(35786000);
			expect(parsed.beacons?.[0].major).toBe(0);
			expect(parsed.beacons?.[1].minor).toBe(65535);
		});

		it("should handle pass with many locations and beacons with special characters", async () => {
			const locations: Location[] = Array.from({ length: 5 }, (_, i) => ({
				latitude: i * 18 - 36,
				longitude: i * 36 - 72,
				relevantText: `Location ${i + 1} with 日本語 and emojis 🎉`,
			}));

			const beacons: Beacon[] = Array.from({ length: 5 }, (_, i) => ({
				proximityUUID: `E2C56DB5-DFFB-48D2-B060-D0F5A7109${i.toString().padStart(3, "0")}`,
				major: i * 1000,
				minor: i * 100,
				relevantText: `Beacon ${i + 1} with عربي and emojis 🏪`,
			}));

			const passData: PassData = {
				...minimalPassData,
				locations,
				beacons,
			};

			const pass = createPass(passData);
			const parsed = await extractPassJson(pass);

			expect(parsed.locations).toHaveLength(5);
			expect(parsed.beacons).toHaveLength(5);
			expect(parsed.locations?.[0].relevantText).toContain("日本語");
			expect(parsed.beacons?.[0].relevantText).toContain("عربي");
		});
	});
});
