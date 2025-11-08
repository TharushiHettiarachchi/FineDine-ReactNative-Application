import React, { useLayoutEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useFonts } from 'expo-font';
import ButtonGroups from '../../components/ButtonGroup';
import IncrementGroups from '../../components/IncrementGroups';
import Alerts from '../../components/Alerts';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebaseConfig';

export default function SingleProductView() {
  const { product } = useLocalSearchParams();
  const item = JSON.parse(product);
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    Nunito: require('../../assets/fonts/Nunito.ttf'),
  });

  const [portions, setPortions] = useState({ full: 0, half: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };

  const fullPrice = parseFloat(item.fullPortionPrice || '0');
  const halfPrice = parseFloat(item.halfPortionPrice || '0');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: item.category,
      headerStyle: { backgroundColor: '#FFA726' },
      headerTintColor: '#000',
      headerTitleStyle: {
        fontFamily: 'Nunito',
        fontWeight: 'bold',
      },
    });
  }, [navigation, item.category]);

  const updatePortion = useCallback((type, operation) => {
    setPortions((prev) => ({
      ...prev,
      [type]: operation === 'increment' ? prev[type] + 1 : Math.max(0, prev[type] - 1),
    }));
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (portions.full === 0 && portions.half === 0) {
      showAlert('Please select at least one portion');
      return;
    }

    setIsLoading(true);

    try {
      const userJSON = await AsyncStorage.getItem('user');
      if (!userJSON) {
        showAlert('User not logged in');
        setIsLoading(false);
        return;
      }

      const user = JSON.parse(userJSON);
      let userId = user.uid || user.id || user.userId;

      if (!userId) {
        if (!user.mobile) {
          showAlert('User mobile number is missing');
          setIsLoading(false);
          return;
        }

        const q = query(collection(db, 'user'), where('mobile', '==', user.mobile.trim()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          showAlert('No user found with this mobile number');
          setIsLoading(false);
          return;
        }

        userId = querySnapshot.docs[0].id;
      }

      if (!item.id) {
        showAlert('Product ID is missing');
        setIsLoading(false);
        return;
      }

      const cartDocRef = doc(db, 'cart', `${userId}_${item.id}`);
      const cartDocSnap = await getDoc(cartDocRef);

      if (cartDocSnap.exists()) {
        await updateDoc(cartDocRef, {
          fullPortionQty: increment(portions.full),
          halfPortionQty: increment(portions.half),
          updatedAt: new Date(),
        });
      } else {
        await setDoc(cartDocRef, {
          userId,
          productId: item.id,
          fullPortionQty: portions.full,
          halfPortionQty: portions.half,
          addedAt: new Date(),
          updatedAt: new Date(),
        });
      }

      showAlert('Added to cart successfully!');
      setPortions({ full: 0, half: 0 });
    } catch (error) {
      console.error('Error adding to cart:', error);
      showAlert(error.message || 'Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  }, [portions, item.id]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFA726" />
        </View>
      )}

      <Image source={{ uri: item.imageUrl }} style={styles.image} />

      <View style={styles.nameRow}>
        <Text style={styles.name}>{item.name}</Text>
        {(item.isVegetarian || item['is vegetarian']) && (
          <View style={styles.vegLabel}>
            <Text style={styles.vegText}>VEG</Text>
          </View>
        )}
      </View>

      <Text style={styles.category}>{item.category}</Text>

      <Text style={styles.description}>
        {item.description || 'No description available.'}
      </Text>

      <View style={styles.priceRow}>
        <Text style={styles.priceText}>Full Portion Rs. {fullPrice.toFixed(2)}</Text>
        <Text style={styles.priceText}>Half Portion Rs. {halfPrice.toFixed(2)}</Text>
      </View>

      <Text style={styles.subheading}>Order Options</Text>
      <View style={styles.divider} />

      <View style={styles.orderRow}>
        <Text style={styles.orderLabel}>Full Portion</Text>
        <Text style={styles.orderPrice}>Rs. {(portions.full * fullPrice).toFixed(2)}</Text>
        <IncrementGroups
          value={portions.full}
          onIncrement={() => updatePortion('full', 'increment')}
          onDecrement={() => updatePortion('full', 'decrement')}
        />
      </View>

      <View style={styles.orderRow}>
        <Text style={styles.orderLabel}>Half Portion</Text>
        <Text style={styles.orderPrice}>Rs. {(portions.half * halfPrice).toFixed(2)}</Text>
        <IncrementGroups
          value={portions.half}
          onIncrement={() => updatePortion('half', 'increment')}
          onDecrement={() => updatePortion('half', 'decrement')}
        />
      </View>

      <ButtonGroups Label="Add To Cart" functionToDo={handleAddToCart} />

      <View style={styles.blank}></View>

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
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.5)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blank: {
    height: 20,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Nunito',
    color: '#333',
  },
  vegLabel: {
    backgroundColor: '#2E7D32',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 5,
    marginLeft: 8,
  },
  vegText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  category: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Nunito',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#444',
    fontFamily: 'Nunito',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Nunito',
    marginTop: 0,
    marginBottom: 8,
    alignSelf: 'flex-start',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    width: '100%',
    marginVertical: 15,
  },
  priceRow: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  priceText: {
    fontSize: 16,
    fontFamily: 'Nunito',
    fontWeight: '600',
    color: '#444',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  orderLabel: {
    fontSize: 16,
    fontFamily: 'Nunito',
    flex: 1.2,
    color: '#222',
  },
  orderPrice: {
    fontSize: 16,
    fontFamily: 'Nunito',
    flex: 1,
    textAlign: 'center',
    color: '#000',
  },
});
