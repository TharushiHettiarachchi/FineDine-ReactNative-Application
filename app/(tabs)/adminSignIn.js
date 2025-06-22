import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { router } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from "react";
import InputGroups from '../../components/InputGroups';
import ButtonGroups from '../../components/ButtonGroup';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from "firebase/firestore";
import Alerts from '../../components/Alerts';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminSignIn() {
  const [getMobile, setMobile] = useState("");
  const [getPassword, setPassword] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [loaded, error] = useFonts({
    'AoboshiOne-Regular': require("../../assets/fonts/AoboshiOne-Regular.ttf"),
  });


  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            style={styles.image}
            source={require('../../assets/images/icon_black.png')}
            contentFit="cover"
            transition={1000}
          />
        </View>

        <View style={styles.secondView}>
          <Text style={styles.signInheader}>Admin Login</Text>

          <View style={styles.inputgroupsView}>
            <InputGroups Label={"Mobile Number"} mode={"tel"} securityType={false} functionToDo={(text) => setMobile(text)} />
            <InputGroups Label={"Password"} mode={"text"} securityType={true} functionToDo={(text) => setPassword(text)} />
          </View>

          <View style={styles.inputgroupsView1}>
            <ButtonGroups Label={"Sign In"} functionToDo={async () => {
              if (!getMobile || !getPassword) {
                setAlertMessage("Please fill in both fields.");
                setAlertVisible(true);
                return;
              }

              try {
                const q = query(
                  collection(db, "admin"),
                  where("mobile", "==", getMobile),
                  where("password", "==", getPassword)
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                 
                
                  router.replace("adminDrawer/dashboard");
                } else {
                  setAlertMessage("Invalid mobile or password.");
                  setAlertVisible(true);
                }
              } catch (error) {
                setAlertMessage("Error signing in: " + error.message);
                setAlertVisible(true);
              }
            }} />
          </View>
        </View>
      </View>

      <Alerts
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFB22C',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    width: 220,
    height: 240,
  },
  image: {
    width: 280,
    height: 220,
  },
  signInheader: {
    height: 80,
    marginTop: 10,
    alignSelf: "center",
    fontSize: 40,
    fontFamily: "AoboshiOne-Regular",
  },
  secondView: {
    width: "100%",
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#FFFFFF",
  },
  inputgroupsView: {
    width: "100%",
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputgroupsView1: {
    width: "100%",
    alignItems: 'center',
    justifyContent: 'center',
  },
});
