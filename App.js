import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import useTrayListener from './app/hooks/useTrayListener';

export default function App() {
  const { tray1, tray2, tray3, trayCount } = useTrayListener();

  return (
    <View style={styles.container}>
      <Text>Tray1: {tray1}</Text>
      <Text>Tray2: {tray2}</Text>
      <Text>Tray3: {tray3}</Text>
      <Text>Tray Count: {trayCount}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
