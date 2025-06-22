import { Text, View, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Image } from 'expo-image';
import { router } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from "react";
import InputGroups from '../components/InputGroups';
import ButtonGroups from '../components/ButtonGroup';
import { db } from '../firebaseConfig';
import { collection, addDoc } from "firebase/firestore";
import Alerts from '../components/Alerts';



export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
const [alertMessage, setAlertMessage] = useState("");
  
  const [loaded, error] = useFonts(
    {
      'AoboshiOne-Regular': require("../assets/fonts/AoboshiOne-Regular.ttf"),
    }
  );

  useEffect(
    () => {
      async function checkUserIn() {

        try {
          let userJson = await AsyncStorage.getItem("user");
          if (userJson !== null) {
            router.replace("/home");
          }
        } catch (e) {

        }
      }
      checkUserIn();
    }, []
  );

  useEffect(
    () => {
      if (loaded || error) {
        SplashScreen.hideAsync();
      }
    }, [loaded, error]
  );

  if (!loaded && !error) {
    return null;
  }
  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            style={styles.image}
            source={require('../assets/images/icon_black.png')}
            contentFit="cover"
            transition={1000}
          />
        </View>
        <View style={styles.secondView}>
          <View>
            <Text style={styles.signInheader}>Sign Up</Text>
          </View>
          <View style={styles.inputgroupsView}>
            <InputGroups Label={"First Name"} mode={"text"} securityType={false} functionToDo={
              (text) => {
              setFirstName(text);
              }
            } />
             <InputGroups Label={"Last Name"} mode={"text"} securityType={false} functionToDo={
              (text) => {
           setLastName(text);
              }
            } />
             <InputGroups Label={"Mobile Number"} mode={"tel"} securityType={false} functionToDo={
              (text) => {
              setMobile(text);
              }
            } />

          </View>
          <View style={styles.inputgroupsView1}>
            <ButtonGroups Label={"Sign Up"}  functionToDo={
            async () => {
                if (!firstName || !lastName || !mobile) {
                  setAlertMessage("Please fill in all fields.");
                  setAlertVisible(true);
                  
                  return;
                }
              
                try {
                  await addDoc(collection(db, "user"), {
                    firstName,
                    lastName,
                    mobile
                  });
                  setAlertMessage("User registered!");
                  setAlertVisible(true);
                  
               
                } catch (error) {
                  setAlertMessage("Error saving data: " + error.message);
                  setAlertVisible(true);
                  
                }
              }
            }/>
          </View>
          <Text style={styles.link1} onPress={() => router.push('/')}>
      Have an account? Sign In
    </Text>
        </View>
      </View>
      <Alerts
  visible={alertVisible}
  message={alertMessage}
  onClose={() => {
    setAlertVisible(false);
    if (alertMessage === "User registered!") {
      router.replace("drawer/home");
    }
  }}
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
    height: 220
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
    backgroundColor: "#FFFFFF"
  },
  inputGroup: {
    width: "86%",
    paddingHorizontal: 10,
    height: "auto",
    paddingVertical: 8,
  },
  inputField: {
    borderColor: "#0066b2",
    borderWidth: 1,
    marginTop: 5,
    height: 40,
    borderRadius: 10,
    paddingStart: 10,
  },
  inputLabel: {
    fontSize: 16,
    color: "#0066b2",
    fontWeight: "bold"
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
  link1:{
    marginTop:5,
    color:"#808080",
    
  }



});
