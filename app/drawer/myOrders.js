import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Alerts from '../../components/Alerts';
import ButtonGroups from '../../components/ButtonGroup';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
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

      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('orderDate', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const ordersData = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const order = docSnapshot.data();

          const itemsWithNames = await Promise.all(
            (order.items || []).map(async (item) => {
              try {
                const productDoc = await getDoc(doc(db, 'foods', item.productId));
                const productData = productDoc.exists() ? productDoc.data() : {};
                return {
                  ...item,
                  name: productData.name || 'Unknown Item',
                  imageUrl: productData.imageUrl || null,
                  fullPortionQty: item.fullPortionQty || 0,
                  halfPortionQty: item.halfPortionQty || 0,
                  fullPortionPrice: parseFloat(productData.fullPortionPrice) || 0,
                  halfPortionPrice: parseFloat(productData.halfPortionPrice) || 0,
                };
              } catch {
                return {
                  ...item,
                  name: 'Unknown Item',
                  imageUrl: null,
                  fullPortionQty: item.fullPortionQty || 0,
                  halfPortionQty: item.halfPortionQty || 0,
                  fullPortionPrice: 0,
                  halfPortionPrice: 0,
                };
              }
            })
          );

          const totalAmount = itemsWithNames.reduce(
            (sum, i) => sum + i.fullPortionQty * i.fullPortionPrice + i.halfPortionQty * i.halfPortionPrice,
            0
          );

          return {
            id: docSnapshot.id,
            orderDate: order.orderDate?.toDate?.() || new Date(),
            items: itemsWithNames,
            totalAmount,
            status: order.status || 'Unknown',
          };
        })
      );

      setOrders(ordersData);
    } catch (error) {
      console.error(error);
      showAlert('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQtyChange = (orderId, itemIndex, type, value) => {
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedItems = [...order.items];
          updatedItems[itemIndex][type] = Math.max(0, parseInt(value) || 0);

          const updatedTotal = updatedItems.reduce(
            (sum, i) => sum + i.fullPortionQty * i.fullPortionPrice + i.halfPortionQty * i.halfPortionPrice,
            0
          );

          return { ...order, items: updatedItems, totalAmount: updatedTotal };
        }
        return order;
      })
    );
  };

  const saveOrderChanges = async (order) => {
    try {
      const allZero = order.items.every(
        (i) => i.fullPortionQty === 0 && i.halfPortionQty === 0
      );

      const orderRef = doc(db, 'orders', order.id);

      if (allZero) {
        await deleteDoc(orderRef);
        showAlert('Order deleted because all quantities are zero.');
        setOrders((prevOrders) => prevOrders.filter((o) => o.id !== order.id));
      } else {
        await updateDoc(orderRef, {
          items: order.items,
        });
        showAlert('Order updated successfully!');
      }

      setEditingOrderId(null);
    } catch (error) {
      console.error(error);
      showAlert('Failed to update order');
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderId}>Order ID: {item.id}</Text>
      <Text style={styles.orderDate}>{item.orderDate.toLocaleString()}</Text>
      <Text style={styles.orderStatus}>Status: {item.status}</Text>
      <Text style={styles.orderTotal}>Total: Rs. {item.totalAmount.toFixed(2)}</Text>

      <View style={styles.itemsContainer}>
        {item.items.length === 0 ? (
          <Text style={styles.noItemsText}>No items in this order.</Text>
        ) : (
          item.items.map((orderItem, idx) => (
            <View key={idx} style={styles.orderItemRow}>
              {orderItem.imageUrl ? (
                <Image source={{ uri: orderItem.imageUrl }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>No Image</Text>
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.productNameText}>{orderItem.name}</Text>

                {editingOrderId === item.id ? (
                  <>
                    <View style={styles.qtyRow}>
                      <Text style={{ fontWeight: '600' }}>Full:</Text>
                      <TextInput
                        style={styles.qtyInput}
                        keyboardType="number-pad"
                        value={orderItem.fullPortionQty?.toString() || '0'}
                        onChangeText={(value) => handleQtyChange(item.id, idx, 'fullPortionQty', value)}
                      />
                    </View>
                    <View style={styles.qtyRow}>
                      <Text style={{ fontWeight: '600' }}>Half:</Text>
                      <TextInput
                        style={styles.qtyInput}
                        keyboardType="number-pad"
                        value={orderItem.halfPortionQty?.toString() || '0'}
                        onChangeText={(value) => handleQtyChange(item.id, idx, 'halfPortionQty', value)}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.qtyText}>
                      Full: {orderItem.fullPortionQty} x Rs.{(orderItem.fullPortionPrice || 0).toFixed(2)}
                    </Text>
                    <Text style={styles.qtyText}>
                      Half: {orderItem.halfPortionQty} x Rs.{(orderItem.halfPortionPrice || 0).toFixed(2)}
                    </Text>
                  </>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {item.status === 'Pending' && (
        <View style={styles.buttonsRow}>
          {editingOrderId === item.id ? (
            <ButtonGroups
              Label="Save Changes"
              functionToDo={() => saveOrderChanges(item)}
            />
          ) : (
            <ButtonGroups
              Label="Edit"
              functionToDo={() => setEditingOrderId(item.id)}
            />
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#FFA726" style={{ marginTop: 40 }} />
      ) : orders.length === 0 ? (
        <Text style={styles.noOrdersText}>You have not placed any orders yet.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <Alerts
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  list: { paddingBottom: 20 },
  orderCard: { backgroundColor: '#FFF3E0', borderRadius: 10, padding: 16, marginBottom: 16 },
  orderId: { fontSize: 13, fontWeight: '500', color: '#555', marginBottom: 4 },
  orderDate: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  orderStatus: { marginTop: 6, fontSize: 14, color: '#FFA726', fontWeight: '600' },
  orderTotal: { marginTop: 6, fontSize: 15, fontWeight: 'bold', color: '#000' },
  itemsContainer: { marginTop: 12 },
  orderItemRow: { flexDirection: 'row', backgroundColor: '#FFE0B2', padding: 10, borderRadius: 6, marginBottom: 8, alignItems: 'center' },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  imagePlaceholder: { width: 60, height: 60, borderRadius: 8, marginRight: 10, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderText: { fontSize: 10, color: '#666' },
  itemInfo: { flex: 1 },
  productNameText: { fontSize: 14, fontWeight: '600', color: '#333' },
  qtyText: { fontSize: 13, color: '#555', marginVertical: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  qtyInput: { borderWidth: 1, borderColor: '#ccc', width: 90, height: 45, marginLeft: 10, paddingHorizontal: 12, borderRadius: 6, fontSize: 18, textAlign: 'center' },
  noItemsText: { fontStyle: 'italic', color: '#777' },
  noOrdersText: { marginTop: 50, fontSize: 16, textAlign: 'center', color: '#888' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
});
