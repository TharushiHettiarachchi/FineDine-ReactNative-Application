import { useEffect, useState } from 'react';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CustomDrawerContent(props) {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    imageUri: null,
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userJSON = await AsyncStorage.getItem('user');
        if (userJSON) {
          const parsedUser = JSON.parse(userJSON);
          setUser({
            firstName: parsedUser.firstName || 'Admin',
            lastName: parsedUser.lastName || 'Account',
            mobile: parsedUser.mobile || '0766365130',
            imageUri: parsedUser.imageUrl || null,
          });
        }
      } catch (e) {
        console.error('Failed to load user data:', e);
      }
    };

    loadUserData();
  }, []);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={{ backgroundColor: '#FFA726', width: "100%", padding: 20, alignItems: 'center' }}>
        <Image
          source={
            user.imageUri
              ? { uri: user.imageUri }
              : require('../assets/images/user.jpg')
          }
          style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }}
        />
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={{ fontSize: 14 }}>{user.mobile}</Text>
      </View>

      <View style={{ flex: 1, paddingTop: 20, backgroundColor: '#ffffff' }}>
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
  );
}
