import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { ref, onValue } from "firebase/database";
import { database } from '../../firebaseConfig';

const { width } = Dimensions.get('window');

export default function Dashboard() {
 
  const [batteryPercentage, setBatteryPercentage] = useState(0);
  const [tray1, setTray1] = useState(0);
  const [tray2, setTray2] = useState(0);
  const [tray3, setTray3] = useState(0);

  
  const totalUsers = 120;
  const todaysRevenue = 4560;
  const totalOrders = 289;

 
  useEffect(() => {
    const batteryRef = ref(database, "Battery/Charge");
    const tray1Ref = ref(database, "trays/tray1");
    const tray2Ref = ref(database, "trays/tray2");
    const tray3Ref = ref(database, "trays/tray3");

    const unsubBattery = onValue(batteryRef, (snapshot) => {
      if (snapshot.exists()) setBatteryPercentage(snapshot.val());
    });

    const unsubTray1 = onValue(tray1Ref, (snapshot) => {
      if (snapshot.exists()) setTray1(snapshot.val());
    });

    const unsubTray2 = onValue(tray2Ref, (snapshot) => {
      if (snapshot.exists()) setTray2(snapshot.val());
    });

    const unsubTray3 = onValue(tray3Ref, (snapshot) => {
      if (snapshot.exists()) setTray3(snapshot.val());
    });

  
    return () => {
      unsubTray1();
      unsubBattery();
      unsubTray2();
      unsubTray3();
    };
  }, []);

  const cardData = [
    {
      title: 'Registered Users',
      value: totalUsers,
      gif: require('../../assets/users.gif'),
    },
    {
      title: "Today's Revenue",
      value: `Rs. ${todaysRevenue}.00`,
      gif: require('../../assets/money.gif'),
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      gif: require('../../assets/orders.gif'),
    },
    {
      title: 'Robot Battery',
      value: `${batteryPercentage}%`,
      gif: require('../../assets/battery.gif'),
    },
    {
      title: 'Tray 1 Table',
      value: tray1,
      gif: require('../../assets/orders.gif'),
    },
    {
      title: 'Tray 2 Table',
      value: tray2,
      gif: require('../../assets/orders.gif'),
    },
    {
      title: 'Tray 3 Table',
      value: tray3,
      gif: require('../../assets/orders.gif'),
    },
  ];

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {cardData.map((item, index) => (
          <MotiView
            key={index}
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              delay: index * 150,
              type: 'timing',
              duration: 600,
            }}
            style={styles.card}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardValue}>{item.value}</Text>
            </View>
            <Image source={item.gif} style={styles.gif} />
          </MotiView>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff7f0',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
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
  cardLeft: {
    flex: 1,
  },
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
  gif: {
    width: 50,
    height: 50,
    marginLeft: 10,
  },
});
