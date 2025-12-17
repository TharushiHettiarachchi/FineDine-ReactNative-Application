import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MotiView } from 'moti';
import { collection, getDocs } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { database, db } from '../../firebaseConfig';
import useTrayListener from '../../hooks/useTrayListener';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const [batteryPercentage, setBatteryPercentage] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [todaysRevenue, setTodaysRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [hasServed, setHasServed] = useState(false);

  const { tray1, tray2, tray3, trayCount, loading } = useTrayListener();

  const emergencyShownRef = useRef(false);
  const lowBatteryShownRef = useRef(false);

 
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "user"));
        setTotalUsers(usersSnapshot.size);

        const ordersSnapshot = await getDocs(collection(db, "orders"));
        setTotalOrders(ordersSnapshot.size);

        let revenue = 0;
        const today = new Date();

        ordersSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.orderDate) {
            const orderDate =
              typeof data.orderDate.toDate === "function"
                ? data.orderDate.toDate()
                : new Date(data.orderDate);

            if (
              orderDate.getDate() === today.getDate() &&
              orderDate.getMonth() === today.getMonth() &&
              orderDate.getFullYear() === today.getFullYear()
            ) {
              revenue += Number(data.totalAmount) || 0;
            }
          }
        });

        setTodaysRevenue(revenue);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);


  useEffect(() => {
    const batteryRef = ref(database, "Battery/Charge");

    const unsubscribeBattery = onValue(batteryRef, snapshot => {
      if (snapshot.exists()) {
        setBatteryPercentage(snapshot.val());
      }
    });

    return () => unsubscribeBattery();
  }, []);

  
  useEffect(() => {
    const servedRef = ref(database, "robot/has_served");

    const unsubscribeServed = onValue(servedRef, snapshot => {
      if (snapshot.exists()) {
        setHasServed(snapshot.val());
      }
    });

    return () => unsubscribeServed();
  }, []);

  
  useEffect(() => {
    const emergencyRef = ref(database, "robot/emergency");

    const unsubscribeEmergency = onValue(emergencyRef, snapshot => {
      if (snapshot.exists() && snapshot.val() === true) {
        if (!emergencyShownRef.current) {
          emergencyShownRef.current = true;

          Alert.alert(
            "EMERGENCY ALERT",
            "Robot emergency detected!\nPlease stop operations immediately.",
            [{ text: "OK" }],
            { cancelable: false }
          );
        }
      } else {
        emergencyShownRef.current = false;
      }
    });

    return () => unsubscribeEmergency();
  }, []);

  
  useEffect(() => {
    if (batteryPercentage < 20 && hasServed) {
      if (!lowBatteryShownRef.current) {
        lowBatteryShownRef.current = true;

        Alert.alert(
          "Low Battery Warning",
          "Robot has low battery.\nPlease serve customers using a human waiter.",
          [{ text: "OK" }],
          { cancelable: false }
        );
      }
    } else {
      lowBatteryShownRef.current = false;
    }
  }, [batteryPercentage, hasServed]);

  const cardData = [
    { title: 'Registered Users', value: totalUsers, gif: require('../../assets/users.gif') },
    { title: "Today's Revenue", value: `Rs. ${todaysRevenue}.00`, gif: require('../../assets/money.gif') },
    { title: 'Total Orders', value: totalOrders, gif: require('../../assets/orders.gif') },
    { title: 'Robot Battery', value: `${batteryPercentage}%`, gif: require('../../assets/battery.gif') },
    { title: 'Tray 1 Table', value: tray1, gif: require('../../assets/trays.gif'), isTray: true },
    { title: 'Tray 2 Table', value: tray2, gif: require('../../assets/trays.gif'), isTray: true },
    { title: 'Tray 3 Table', value: tray3, gif: require('../../assets/trays.gif'), isTray: true },
    { title: 'Tray Count', value: trayCount, gif: require('../../assets/trays.gif'), isTray: true },
  ];

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {cardData.map((item, index) => (
          <MotiView
            key={index}
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 150, type: 'timing', duration: 600 }}
            style={styles.card}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardValue}>
                {item.isTray && loading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  item.value
                )}
              </Text>
            </View>
            <Image source={item.gif} style={styles.gif} />
          </MotiView>
        ))}
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  scrollView: { backgroundColor: '#fff7f0' },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  card: {
    width: width * 0.9,
    backgroundColor: '#fff1d2',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 0,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardLeft: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
    marginTop: 5,
  },
  gif: { width: 50, height: 50, marginLeft: 10 },
});
