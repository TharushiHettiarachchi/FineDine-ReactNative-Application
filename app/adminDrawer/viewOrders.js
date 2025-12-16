import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Alerts from '../../components/Alerts';

export default function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };

  useEffect(() => {
    const ordersQuery = query(collection(db, 'orders'), where('status', '==', 'Pending'));

    const unsubscribe = onSnapshot(ordersQuery, async (orderSnapshot) => {
      try {
        const ordersData = await Promise.all(
          orderSnapshot.docs.map(async (docSnap) => {
            const order = docSnap.data();

            const userRef = doc(db, 'user', order.userId);
            const userDoc = await getDoc(userRef);
            const userName = userDoc.exists()
              ? `${userDoc.data().firstName} ${userDoc.data().lastName}`
              : 'Unknown';

            const items = await Promise.all(
              order.items.map(async (item) => {
                const productRef = doc(db, 'foods', item.productId);
                const productDoc = await getDoc(productRef);
                const productName = productDoc.exists() ? productDoc.data().name : 'Unknown Food';

                return {
                  productName,
                  fullPortionQty: item.fullPortionQty,
                  halfPortionQty: item.halfPortionQty,
                };
              })
            );

            return {
              id: docSnap.id,
              userName,
              tableNumber: order.tableNumber || 'N/A',
              totalAmount: order.totalAmount,
              items,
              orderDate: order.orderDate.toDate(),
            };
          })
        );

        const sortedOrders = ordersData.sort((a, b) => a.orderDate - b.orderDate);
        const formattedOrders = sortedOrders.map((order) => ({
          ...order,
          orderDate: order.orderDate.toLocaleString(),
        }));

        setOrders(formattedOrders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        showAlert('Failed to fetch orders.');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const completeOrder = async (orderId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'Completed',
      });
      showAlert('Order marked as completed.');
    } catch (error) {
      console.error('Error completing order:', error);
      showAlert('Failed to complete the order.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFB22C" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noOrdersText}>No pending orders.</Text>
        <Alerts visible={alertVisible} message={alertMessage} onClose={() => setAlertVisible(false)} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fefefe' }}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.headerRow}>
              <Text style={styles.customer}>{item.userName}</Text>
              <Text style={styles.date}>{item.orderDate}</Text>
            </View>
            <Text style={styles.tableNumber}>Table: {item.tableNumber}</Text>

            <View style={styles.divider} />
            {item.items.map((product, idx) => (
              <View key={idx} style={styles.productItem}>
                <Text style={styles.productText}>{product.productName}</Text>
                {product.fullPortionQty > 0 && (
                  <Text style={styles.portionText}>Full Portion x {product.fullPortionQty}</Text>
                )}
                {product.halfPortionQty > 0 && (
                  <Text style={styles.portionText}>Half Portion x {product.halfPortionQty}</Text>
                )}
              </View>
            ))}
            <Text style={styles.total}>Total: Rs. {item.totalAmount}</Text>
            <TouchableOpacity style={styles.button} onPress={() => completeOrder(item.id)}>
              <Text style={styles.buttonText}>Complete Order</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Alerts visible={alertVisible} message={alertMessage} onClose={() => setAlertVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fefefe',
  },
  noOrdersText: {
    fontSize: 16,
    color: '#999',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    margin: 10,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  customer: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  tableNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  productItem: {
    marginBottom: 8,
  },
  productText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#444',
  },
  portionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  total: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#FFA726',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FFB22C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
