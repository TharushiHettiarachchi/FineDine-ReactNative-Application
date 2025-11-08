import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import ButtonGroups from '../../components/ButtonGroup';
export default function QrScan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const router = useRouter();

  // ✅ Re-enable scanning every time this screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setIsScanning(true);
      return () => setIsScanning(false);
    }, [])
  );

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  const handleBarcodeScanned = ({ data }) => {
    if (!isScanning) return;
    setIsScanning(false); // temporarily disable to prevent double triggers

    console.log("Scanned Table Number:", data);

    if (!data || isNaN(data)) {
      Alert.alert('Invalid QR Code', 'Please scan a valid table QR code.', [
        { text: 'Try Again', onPress: () => setIsScanning(true) },
      ]);
      return;
    }

    // ✅ Navigate back to Cart and pass the table number
    router.replace({
      pathname: '/drawer/cart',
      params: { table: String(data) },
    });
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFA726" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>
          Camera permission is required to scan QR codes.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.overlay}>
        <Text style={styles.instruction}>Scan the Table QR Code</Text>

       
        <ButtonGroups Label="X Cancel" functionToDo={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  permissionText: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 16 },
  permissionButton: {
    backgroundColor: '#FFA726',
    padding: 12,
    borderRadius: 8,
  },
  permissionButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  overlay: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  instruction: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowRadius: 4,
  },
  cancelButton: {
    flexDirection: 'row',
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: { color: '#fff', fontSize: 16, marginLeft: 8, fontWeight: 'bold' },
});
