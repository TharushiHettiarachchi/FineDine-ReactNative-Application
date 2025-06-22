import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function CompletedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const ordersQuery = query(collection(db, 'orders'), where('status', '==', 'Completed'));
      const orderSnapshot = await getDocs(ordersQuery);

      const ordersData = await Promise.all(
        orderSnapshot.docs.map(async (docSnap) => {
          const order = docSnap.data();

          const userRef = doc(db, 'user', order.userId);
          const userDoc = await getDoc(userRef);
          const userName = userDoc.exists() ? `${userDoc.data().firstName} ${userDoc.data().lastName}` : 'Unknown';

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
            totalAmount: order.totalAmount,
            items,
            orderDate: order.orderDate.toDate().toLocaleString(),
          };
        })
      );

      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching completed orders:', error);
    } finally {
      setLoading(false);
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
        <Text style={styles.noOrdersText}>No completed orders.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.orderCard}>
          <View style={styles.headerRow}>
            <Text style={styles.customer}>{item.userName}</Text>
            <Text style={styles.date}>{item.orderDate}</Text>
          </View>
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
        </View>
      )}
    />
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
    backgroundColor: '#f0f0f0',
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
    marginBottom: 8,
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
  divider: {
    height: 1,
    backgroundColor: '#ccc',
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
});
