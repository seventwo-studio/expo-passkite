import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  createPassBuilder,
  createPass,
  PassType,
  BarcodeFormat,
  addPassToWallet,
  canAddPasses,
  isPassLibraryAvailable,
  containsPass,
  onPassAdded,
  onPassRemoved,
} from 'expo-passkite';

// Sample pass identifiers - replace with your own for real testing
const SAMPLE_PASS_TYPE_ID = 'pass.com.example.passkite';
const SAMPLE_TEAM_ID = 'XXXXXXXXXX';
const SAMPLE_SERIAL = `DEMO-${Date.now()}`;

export default function App() {
  const [isLibraryAvailable, setIsLibraryAvailable] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [passExists, setPassExists] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [generatedPassBase64, setGeneratedPassBase64] = useState<string | null>(null);

  // Check wallet availability on mount
  useEffect(() => {
    checkWalletStatus();
  }, []);

  // Subscribe to pass events
  useEffect(() => {
    const addedSub = onPassAdded((event) => {
      setLastEvent(`Pass Added: ${event.passTypeIdentifier} / ${event.serialNumber}`);
      checkPassExists();
    });

    const removedSub = onPassRemoved((event) => {
      setLastEvent(`Pass Removed: ${event.passTypeIdentifier} / ${event.serialNumber}`);
      checkPassExists();
    });

    return () => {
      addedSub.remove();
      removedSub.remove();
    };
  }, []);

  const checkWalletStatus = async () => {
    try {
      const available = await isPassLibraryAvailable();
      setIsLibraryAvailable(available);

      const canAddResult = await canAddPasses();
      setCanAdd(canAddResult);
    } catch (error) {
      console.error('Error checking wallet status:', error);
    }
  };

  const checkPassExists = async () => {
    try {
      const exists = await containsPass(SAMPLE_PASS_TYPE_ID, SAMPLE_SERIAL);
      setPassExists(exists);
    } catch (error) {
      console.error('Error checking pass existence:', error);
    }
  };

  const generateSamplePass = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build a sample store card pass
      const builder = createPassBuilder()
        .setIdentifiers({
          passTypeIdentifier: SAMPLE_PASS_TYPE_ID,
          serialNumber: SAMPLE_SERIAL,
          teamIdentifier: SAMPLE_TEAM_ID,
        })
        .setOrganization({
          organizationName: 'Passkite Demo',
          description: 'Demo Store Card',
          logoText: 'DEMO',
        })
        .setPassType(PassType.StoreCard)
        .setColors({
          backgroundColor: 'rgb(60, 65, 76)',
          foregroundColor: 'rgb(255, 255, 255)',
          labelColor: 'rgb(198, 202, 211)',
        })
        .addHeaderField({
          key: 'points',
          label: 'POINTS',
          value: '1,250',
        })
        .addPrimaryField({
          key: 'name',
          label: 'MEMBER',
          value: 'John Appleseed',
        })
        .addSecondaryField({
          key: 'memberSince',
          label: 'MEMBER SINCE',
          value: '2024',
        })
        .addSecondaryField({
          key: 'level',
          label: 'LEVEL',
          value: 'Gold',
        })
        .addAuxiliaryField({
          key: 'balance',
          label: 'BALANCE',
          value: '$50.00',
        })
        .addBackField({
          key: 'terms',
          label: 'Terms & Conditions',
          value: 'This is a demo pass created with expo-passkite. It is for testing purposes only.',
        })
        .addBarcode({
          format: BarcodeFormat.QR,
          message: `https://example.com/pass/${SAMPLE_SERIAL}`,
          altText: SAMPLE_SERIAL,
        })
        .setRelevantDate(new Date())
        .setSemanticTags({
          membershipProgramName: 'Passkite Rewards',
          membershipProgramNumber: SAMPLE_SERIAL,
        });

      const { passData, images } = builder.build();

      // Create the pass (without signing for demo - won't be valid for Apple Wallet)
      const pass = createPass(passData, images);

      // Generate as base64 (skip signature since we don't have certificates)
      const base64 = await pass.generateBase64({ skipSignature: true });
      setGeneratedPassBase64(base64);

      Alert.alert(
        'Pass Generated',
        `Generated pass with serial: ${SAMPLE_SERIAL}\n\nNote: This is an unsigned demo pass. To add to wallet, you need valid Apple signing certificates.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error generating pass:', error);
      Alert.alert('Error', `Failed to generate pass: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToWallet = useCallback(async () => {
    if (!generatedPassBase64) {
      Alert.alert('No Pass', 'Please generate a pass first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await addPassToWallet(generatedPassBase64);

      if (result.success) {
        Alert.alert('Success', 'Pass added to wallet!');
        checkPassExists();
      } else {
        Alert.alert('Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error adding to wallet:', error);
      Alert.alert('Error', `Failed to add to wallet: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, [generatedPassBase64]);

  const renderStatus = (label: string, value: boolean | null) => {
    let statusText = 'Checking...';
    let statusColor = '#888';

    if (value === true) {
      statusText = 'Yes';
      statusColor = '#4CAF50';
    } else if (value === false) {
      statusText = 'No';
      statusColor = '#F44336';
    }

    return (
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>{label}</Text>
        <Text style={[styles.statusValue, { color: statusColor }]}>{statusText}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>expo-passkite</Text>
        <Text style={styles.subtitle}>Test Example</Text>

        {/* Wallet Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet Status</Text>
          {renderStatus('Pass Library Available', isLibraryAvailable)}
          {renderStatus('Can Add Passes', canAdd)}
          {renderStatus('Demo Pass Exists', passExists)}

          <TouchableOpacity style={styles.button} onPress={checkWalletStatus}>
            <Text style={styles.buttonText}>Refresh Status</Text>
          </TouchableOpacity>
        </View>

        {/* Pass Generation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pass Generation</Text>
          <Text style={styles.info}>
            Generate a sample store card pass. Note: Without valid Apple signing certificates,
            the pass cannot be added to a real wallet.
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={generateSamplePass}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Generate Sample Pass</Text>
            )}
          </TouchableOpacity>

          {generatedPassBase64 && (
            <View style={styles.passInfo}>
              <Text style={styles.passInfoText}>
                ✓ Pass generated ({Math.round(generatedPassBase64.length / 1024)}KB)
              </Text>
            </View>
          )}
        </View>

        {/* Add to Wallet Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add to Wallet</Text>
          <Text style={styles.info}>
            {Platform.OS === 'ios'
              ? 'Tap to add the generated pass to Apple Wallet.'
              : Platform.OS === 'android'
              ? 'Tap to add the pass to Google Wallet.'
              : 'Wallet integration is not available on web.'}
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              styles.walletButton,
              !generatedPassBase64 && styles.buttonDisabled,
            ]}
            onPress={addToWallet}
            disabled={isLoading || !generatedPassBase64}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {Platform.OS === 'ios' ? 'Add to Apple Wallet' : 'Add to Google Wallet'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Events Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Events</Text>
          <Text style={styles.info}>
            Pass added/removed events will appear here.
          </Text>
          {lastEvent ? (
            <View style={styles.eventBox}>
              <Text style={styles.eventText}>{lastEvent}</Text>
            </View>
          ) : (
            <Text style={styles.noEvents}>No events yet</Text>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Pass Type ID:</Text>
            <Text style={styles.configValue}>{SAMPLE_PASS_TYPE_ID}</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Team ID:</Text>
            <Text style={styles.configValue}>{SAMPLE_TEAM_ID}</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Serial:</Text>
            <Text style={styles.configValue}>{SAMPLE_SERIAL}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  statusLabel: {
    fontSize: 14,
    color: '#ccc',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  info: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#2a2a4a',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#4a69bd',
  },
  walletButton: {
    backgroundColor: '#000',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  passInfo: {
    backgroundColor: '#1e3a1e',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  passInfoText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  eventBox: {
    backgroundColor: '#2a2a4a',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  eventText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  noEvents: {
    color: '#666',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
  },
  configRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  configLabel: {
    fontSize: 13,
    color: '#888',
    width: 100,
  },
  configValue: {
    fontSize: 13,
    color: '#ccc',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
