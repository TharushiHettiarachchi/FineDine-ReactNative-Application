import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  ActivityIndicator, Image, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection, query, where, getDocs, doc,
  getDoc, deleteDoc, addDoc, Timestamp, writeBatch, orderBy, limit
} from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { db, database } from '../../firebaseConfig';
import Alerts from '../../components/Alerts';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ButtonGroups from '../../components/ButtonGroup';
import { router, useLocalSearchParams } from 'expo-router';
import useTrayListener from '../../hooks/useTrayListener';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [tableNumber, setTableNumber] = useState('');

  const { table } = useLocalSearchParams();
  const { tray1, tray2, tray3, trayCount } = useTrayListener();

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      fetchCartItems();
    }, [])
  );

  useEffect(() => {
    if (table) {
      setTableNumber(String(table));
      Alert.alert(
        "Confirm Order",
        `Place order for Table ${table}?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Place Order", onPress: () => handleCheckout(String(table)) }
        ]
      );
    }
  }, [table]);

  // Fetch cart items for the logged-in user
  const fetchCartItems = async () => {
    setIsLoading(true);
    try {
      const userJSON = await AsyncStorage.getItem('user');
      if (!userJSON) {
        showAlert('User not logged in');
        setIsLoading(false);
        return;
      }

      const user = JSON.parse(userJSON);
      const userId = user.uid || user.id || user.userId;
      if (!userId) {
        showAlert('User ID not found');
        setIsLoading(false);
        return;
      }

      const q = query(collection(db, 'cart'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const data = await Promise.all(
        querySnapshot.docs.map(async (docItem) => {
          const item = docItem.data();
          const productRef = doc(db, 'foods', item.productId);
          const productSnap = await getDoc(productRef);

          let product = {};
          if (productSnap.exists()) product = productSnap.data();

          return {
            cartDocId: docItem.id,
            id: item.productId,
            name: product.name || 'Unknown Product',
            imageUrl: product.imageUrl || null,
            fullPortionPrice: parseFloat(product.fullPortionPrice || 0),
            halfPortionPrice: parseFloat(product.halfPortionPrice || 0),
            full: item.fullPortionQty || 0,
            half: item.halfPortionQty || 0,
          };
        })
      );

      setItems(data);
    } catch (err) {
      console.error("Error fetching cart:", err);
      showAlert('Failed to fetch cart items');
    } finally {
      setIsLoading(false);
    }
  };

  const getTotal = () => {
    return items
      .reduce((total, item) => {
        const fullTotal = item.full * item.fullPortionPrice;
        const halfTotal = item.half * item.halfPortionPrice;
        return total + fullTotal + halfTotal;
      }, 0)
      .toFixed(2);
  };

  const handleRemoveItem = async (cartDocId) => {
    try {
      await deleteDoc(doc(db, 'cart', cartDocId));
      setItems((prevItems) => prevItems.filter((item) => item.cartDocId !== cartDocId));
      showAlert('Item removed from cart');
    } catch (err) {
      console.error(err);
      showAlert('Failed to remove item');
    }
  };

  // Update trays in Realtime Database
  const updateTrays = async () => {
    try {
      const ordersCol = collection(db, 'orders');
      const q = query(
        ordersCol,
        where('status', '==', 'Pending'),
        orderBy('orderDate', 'asc'),
        limit(3)
      );
      const querySnapshot = await getDocs(q);

      const pendingOrders = [];
      querySnapshot.forEach(doc => pendingOrders.push(doc.data()));
      pendingOrders.sort((a, b) => a.tableNumber - b.tableNumber);

      const trayData = {
        tray1: parseInt(pendingOrders[0]?.tableNumber || 0, 10),
        tray2: parseInt(pendingOrders[1]?.tableNumber || 0, 10),
        tray3: parseInt(pendingOrders[2]?.tableNumber || 0, 10),
      };
      const count = [trayData.tray1, trayData.tray2, trayData.tray3].filter(t => t !== 0).length;

      await Promise.all([
        set(ref(database, 'trays/tray1'), trayData.tray1),
        set(ref(database, 'trays/tray2'), trayData.tray2),
        set(ref(database, 'trays/tray3'), trayData.tray3),
        set(ref(database, 'trays/trayCount'), count)
      ]);
    } catch (error) {
      console.error('Error updating trays after checkout:', error);
    }
  };

  const handleCheckout = async (tableNo = tableNumber) => {
    if (!tableNo || !tableNo.trim()) {
      showAlert('Invalid table number.');
      return;
    }
    if (items.length === 0) {
      showAlert('Your cart is empty!');
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
      const userId = user.uid || user.id || user.userId;
      if (!userId) {
        showAlert('User ID not found');
        setIsLoading(false);
        return;
      }

      const orderData = {
        userId,
        tableNumber: parseInt(tableNo, 10),
        orderDate: Timestamp.now(),
        items: items.map(item => ({
          productId: item.id,
          fullPortionQty: item.full,
          halfPortionQty: item.half,
          fullPortionPrice: item.fullPortionPrice,
          halfPortionPrice: item.halfPortionPrice,
        })),
        totalAmount: parseFloat(getTotal()),
        status: 'Pending',
      };

      // Save order
      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      // Clear cart
      const batch = writeBatch(db);
      items.forEach(item => {
        const cartDocRef = doc(db, 'cart', item.cartDocId);
        batch.delete(cartDocRef);
      });
      await batch.commit();

      // Reset state
      setTableNumber('');
      setItems([]);
      showAlert(`Order placed successfully! Order ID: ${orderRef.id}`);

      // Update trays immediately
      updateTrays();

    } catch (error) {
      console.error(error);
      showAlert('Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
      )}
      <View style={styles.itemDetailsContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetails}>Full: {item.full} x Rs.{item.fullPortionPrice}</Text>
        <Text style={styles.itemDetails}>Half: {item.half} x Rs.{item.halfPortionPrice}</Text>
        <Text style={styles.itemPrice}>
          Total: Rs. {(item.full * item.fullPortionPrice + item.half * item.halfPortionPrice).toFixed(2)}
        </Text>
      </View>
      <Pressable
        style={styles.iconButton}
        onPress={() =>
          Alert.alert(
            'Remove Item',
            'Are you sure you want to remove this item from the cart?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Remove', style: 'destructive', onPress: () => handleRemoveItem(item.cartDocId) },
            ]
          )
        }
      >
        <Icon name="delete" size={28} color="#FFA726" />
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFA726" />
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.cartDocId}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.emptyText}>No items in cart.</Text>}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: Rs. {getTotal()}</Text>
            <ButtonGroups Label="Scan Table and Place Order" functionToDo={() => router.push("/drawer/qrScan")} />
          </View>
        </>
      )}
      <Alerts visible={alertVisible} message={alertMessage} onClose={() => setAlertVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  itemDetailsContainer: { flex: 1 },
  itemName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  itemDetails: { fontSize: 14, color: '#555' },
  itemPrice: { marginTop: 6, fontSize: 15, fontWeight: '600', color: '#000' },
  iconButton: { marginLeft: 12, padding: 4 },
  totalContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#888', textAlign: 'center', marginTop: 50 },
});
