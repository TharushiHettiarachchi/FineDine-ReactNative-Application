import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';

export default function LogOut() {
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    const logout = async () => {
      try {
       
        await new Promise(resolve => setTimeout(resolve, 1500));
        await AsyncStorage.removeItem('user');
        router.replace('/');
      } catch (error) {
        console.error("Error during logout:", error);
      } finally {
        setIsLoggingOut(false);
      }
    };

    logout();
  }, []);

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {isLoggingOut ? (
          <>
            <ActivityIndicator size="large" color="#FFB22C" />
            <Text style={styles.text}>Logging out...</Text>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    backgroundColor: "white",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  }
});
