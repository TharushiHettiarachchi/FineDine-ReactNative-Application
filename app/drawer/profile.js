import React, { useState, useEffect } from 'react';
import { Button, Image, View, StyleSheet, Pressable, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputGroups from '../../components/InputGroups';
import ButtonGroups from '../../components/ButtonGroup';

export default function Profile() {
  const [image, setImage] = useState(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');

  useEffect(() => {

    const loadUserData = async () => {
      try {
        const userJSON = await AsyncStorage.getItem('user');
        if (userJSON) {
          const user = JSON.parse(userJSON);
          setFirstName(user.firstName || '');
          setLastName(user.lastName || '');
          setMobile(user.mobile || '');
          setImage(user.imageUrl || null);
        }
      } catch (e) {
        console.error('Failed to load user data:', e);
      }
    };

    loadUserData();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const displayImage = image ? { uri: image } : require('../../assets/images/user.jpg');

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Pressable onPress={pickImage}>
          <Image source={displayImage} style={styles.image} />
        </Pressable>
        <Text style={styles.text1}>Registered on 2025-10-12</Text>

        <InputGroups
          Label={"First Name"}
          mode={"text"}
          securityType={false}
          inputValue={firstName}
          functionToDo={setFirstName}
        />

        <InputGroups
          Label={"Last Name"}
          mode={"text"}
          securityType={false}
          inputValue={lastName}
          functionToDo={setLastName}
        />

        <InputGroups
          Label={"Mobile Number"}
          mode={"tel"}
          securityType={false}
          inputValue={mobile}
          functionToDo={setMobile}
        />

        <View style={styles.inputgroupsView1}>
          <ButtonGroups Label={"Update"} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text1: {
    marginBottom: 20,
    color: "#FFA726",
    fontWeight: "bold",
  },
  image: {
    marginBottom: 10,
    width: 150,
    height: 150,
    borderRadius: 90,
  },
  scrollView: {
    backgroundColor: "white",
  },
  inputgroupsView1: {
    marginTop: 20,
    width: "100%",
    alignItems: 'center',
    justifyContent: 'center',
  },
});
