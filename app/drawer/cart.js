
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  addDoc,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getDatabase, ref, get, set } from 'firebase/database'; 
import Alerts from '../../components/Alerts';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [tableNumber, setTableNumber] = useState('');

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };


  useFocusEffect(
    useCallback(() => {
      fetchCartItems();
    }, [])
  );

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
          if (productSnap.exists()) {
            product = productSnap.data();
          }

          return {
            cartDocId: docItem.id,
            id: item.productId,
            name: product.name || 'Unknown Product',
            imageUrl: product.imageUrl || null,
            fullPortionPrice: parseFloat(product.fullPortionPrice || '0').toFixed(2),
            halfPortionPrice: parseFloat(product.halfPortionPrice || '0').toFixed(2),
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
        const fullTotal = item.full * parseFloat(item.fullPortionPrice);
        const halfTotal = item.half * parseFloat(item.halfPortionPrice);
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

  const confirmCheckout = () => {
    if (items.length === 0) {
      showAlert('Your cart is empty!');
      return;
    }
    setModalVisible(true);
  };

  const handleCheckout = async () => {
    if (!tableNumber.trim()) {
      showAlert('Please enter a table number.');
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
        tableNumber,
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

      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      
      const rtdb = getDatabase();
      const traysRef = ref(rtdb, 'trays');
      const snapshot = await get(traysRef);

      if (snapshot.exists()) {
        let { tray1 = 0, tray2 = 0, tray3 = 0 } = snapshot.val();
        const newTable = parseInt(tableNumber);

        let trayValues = [tray1, tray2, tray3].map(v => parseInt(v) || 0);

     
        if (trayValues.every(v => v !== 0)) {
          console.log("All trays are full, not updating.");
        } else {
       
          trayValues.push(newTable);
          trayValues = trayValues.filter(v => v !== 0).sort((a, b) => a - b);

          while (trayValues.length < 3) {
            trayValues.push(0);
          }

          await set(traysRef, {
            tray1: trayValues[0],
            tray2: trayValues[1],
            tray3: trayValues[2],
          });
        }
      } else {

        await set(traysRef, {
          tray1: parseInt(tableNumber),
          tray2: 0,
          tray3: 0,
        });
      }

  
      const batch = writeBatch(db);
      items.forEach(item => {
        const cartDocRef = doc(db, 'cart', item.cartDocId);
        batch.delete(cartDocRef);
      });
      await batch.commit();

      setItems([]);
      setTableNumber('');
      setModalVisible(false);
      showAlert(`Order placed successfully! Order ID: ${orderRef.id}`);
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
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.itemDetailsContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetails}>
          Full: {item.full} x Rs.{item.fullPortionPrice}
        </Text>
        <Text style={styles.itemDetails}>
          Half: {item.half} x Rs.{item.halfPortionPrice}
        </Text>
        <Text style={styles.itemPrice}>
          Total: Rs. {(
            item.full * parseFloat(item.fullPortionPrice) +
            item.half * parseFloat(item.halfPortionPrice)
          ).toFixed(2)}
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
            <Pressable style={styles.checkoutBtn} onPress={confirmCheckout}>
              <Text style={styles.checkoutText}>Place Order</Text>
            </Pressable>
          </View>
        </>
      )}

      {}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter Table Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Table Number"
              value={tableNumber}
              onChangeText={setTableNumber}
              keyboardType="numeric"
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={handleCheckout}>
                <Text style={styles.confirmText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Alerts
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
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
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
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
  },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  checkoutBtn: {
    backgroundColor: '#FFA726',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  emptyText: { fontSize: 16, color: '#888', textAlign: 'center', marginTop: 50 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, fontSize: 16, marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { padding: 10, marginRight: 10 },
  cancelText: { fontSize: 16, color: '#888' },
  confirmBtn: { backgroundColor: '#FFA726', padding: 12, borderRadius: 8 },
  confirmText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
});
