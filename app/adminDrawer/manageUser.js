import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Switch,
  Alert,
} from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function ManageUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

 
  const fetchUsers = async () => {
    try {
      const userSnapshot = await getDocs(collection(db, 'user'));
      const userList = userSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


  const toggleUserEnabled = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, 'user', userId);
      await updateDoc(userRef, { enabled: !currentStatus });
      

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, enabled: !currentStatus } : user
        )
      );
    } catch (error) {
      console.error('Error updating user status:', error);
      Alert.alert('Error', 'Failed to update user status.');
    }
  };

  const renderUser = ({ item }) => (
    <View style={styles.userRow}>
      <Image
        source={item.imageUrl ? { uri: item.imageUrl } : require('../../assets/images/user.jpg')}
        style={styles.userImage}
      />
      <Text style={styles.userName}>{item.firstName +" "+ item.lastName}</Text>
      <Switch
        value={item.enabled ?? false}
        onValueChange={() => toggleUserEnabled(item.id, item.enabled)}
        thumbColor={item.enabled ? '#FFA726' : '#FFA726'}
        trackColor={{ false: '#C0C0C0', true: '#ffedd3' }}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading users...</Text>
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No users found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={users}
      keyExtractor={item => item.id}
      renderItem={renderUser}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    elevation: 1,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
    marginRight: 15,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
