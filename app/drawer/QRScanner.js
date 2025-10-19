import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner'; // You must install this library
import { useNavigation, useRoute } from '@react-navigation/native'; // Used for navigation and getting params

export default function QRScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  const navigation = useNavigation();
  const route = useRoute(); // <-- This is where 'route' comes from

  // 1. Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // 2. Handle the scan result
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    // Validate and extract the table number (e.g., if QR data is 'TABLE-101', you might parse it)
    const scannedTableNumber = data; // Assuming the QR code data is the table number

    // Get the callback function from navigation params
    const { onScanSuccess } = route.params; 

    // Execute the callback and pass the table number to Cart.js
    if (onScanSuccess) {
        onScanSuccess(scannedTableNumber); // <--- The core logic from the snippet is here
    }

    // Navigate back to the cart screen
    navigation.goBack();
  };
  
  // 3. Render logic for permission and scanner UI
  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Optional: Add an overlay or a button to re-scan */}
      {scanned && (
        <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
});