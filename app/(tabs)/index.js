import { Text, View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Image } from 'expo-image';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from "react";
import { router } from "expo-router";
import InputGroups from '../../components/InputGroups';
import ButtonGroups from '../../components/ButtonGroup';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; 
import Alerts from '../../components/Alerts'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [checkingUser, setCheckingUser] = useState(true);
  const [getMobile, setMobile] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const [loaded, error] = useFonts({
    'AoboshiOne-Regular': require("../../assets/fonts/AoboshiOne-Regular.ttf"),
  });

  useEffect(() => {
    const checkUserInStorage = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user !== null) {
          router.replace('drawer/home'); 
        }
      } catch (e) {
        console.error("Error checking AsyncStorage", e);
      } finally {
        setCheckingUser(false);
      }
    };
    checkUserInStorage();
  }, []);

  useEffect(() => {
    if ((loaded || error) && !checkingUser) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, checkingUser]);

  if (!loaded || checkingUser) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
              <Text style={styles.signInheader}>Sign In</Text>

              <View style={styles.inputgroupsView}>
                <InputGroups
                  Label={"Mobile Number"}
                  mode={"tel"}
                  securityType={false}
                  functionToDo={(text) => setMobile(text)}
                />
              </View>

              <View style={styles.inputgroupsView1}>
                <ButtonGroups
                  Label={"Sign In"}
                  functionToDo={async () => {
                    try {
                      const q = query(
                        collection(db, 'user'),
                        where('mobile', '==', getMobile)
                      );
                      const querySnapshot = await getDocs(q);

                      if (querySnapshot.empty) {
                        setShowAlert(true);
                      } else {
                        const userDoc = querySnapshot.docs[0];
                        const userData = userDoc.data();
                        const userWithId = { ...userData, id: userDoc.id };

                        await AsyncStorage.setItem('user', JSON.stringify(userWithId));
                        router.push('drawer/home');
                      }
                    } catch (error) {
                      console.error("Sign-in error:", error);
                    }
                  }}
                />
              </View>

              <Text style={styles.link1} onPress={() => router.push('/signUp')}>
                Don't have an account? Sign Up
              </Text>
            </View>
          </View>

          <Alerts visible={showAlert} message="Mobile number not found!" onClose={() => setShowAlert(false)} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFB22C',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    width: 220,
    height: 300,
  },
  image: {
    width: 280,
    height: 220,
  },
  signInheader: {
    height: 80,
    marginTop: 30,
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
    marginTop: 20,
    width: "100%",
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputgroupsView1: {
    marginTop: 30,
    width: "100%",
    alignItems: 'center',
    justifyContent: 'center',
  },
  link1: {
    marginTop: 5,
    color: "#808080",
  }
});
