import { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { database, db } from '../../firebaseConfig';
import { Audio } from 'expo-av';

export default function useTrayListener() {
  const [tray1, setTray1] = useState(0);
  const [tray2, setTray2] = useState(0);
  const [tray3, setTray3] = useState(0);
  const [trayCount, setTrayCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const traysRef = ref(database, 'trays');
    const ordersStatusRef = ref(database, 'orders/served');

    const unsubTray1 = onValue(ref(database, 'trays/tray1'), snapshot => {
      if (snapshot.exists()) setTray1(snapshot.val());
    });
    const unsubTray2 = onValue(ref(database, 'trays/tray2'), snapshot => {
      if (snapshot.exists()) setTray2(snapshot.val());
    });
    const unsubTray3 = onValue(ref(database, 'trays/tray3'), snapshot => {
      if (snapshot.exists()) setTray3(snapshot.val());
    });
    const unsubTrayCount = onValue(ref(database, 'trays/trayCount'), snapshot => {
      if (snapshot.exists()) setTrayCount(snapshot.val());
    });

    // Handle when an order is served
    const unsubServed = onValue(ordersStatusRef, async snapshot => {
      if (!snapshot.exists()) return;
      const served = snapshot.val();
      if (served === true) {
        setLoading(true);
        try {
          // Reset trays first
          await set(traysRef, { tray1: 0, tray2: 0, tray3: 0, trayCount: 0 });

          // Fetch next 3 pending orders
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

          // ✅ Play notification sound
          const { sound } = await Audio.Sound.createAsync(
            require('../../assets/ding.wav') // You’ll add this file next
          );
          await sound.playAsync();

          // Update state
          setTray1(trayData.tray1);
          setTray2(trayData.tray2);
          setTray3(trayData.tray3);
          setTrayCount(count);

          // Reset 'served' flag
          setTimeout(async () => {
            await set(ordersStatusRef, false);
            setLoading(false);
          }, 800);
        } catch (error) {
          console.error('Error updating trays:', error);
          setLoading(false);
        }
      }
    });

    return () => {
      unsubTray1();
      unsubTray2();
      unsubTray3();
      unsubTrayCount();
      unsubServed();
    };
  }, []);

  return { tray1, tray2, tray3, trayCount, loading };
}
