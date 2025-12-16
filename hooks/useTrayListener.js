import { useEffect, useState } from 'react';
import { ref, onValue, set, update } from 'firebase/database';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { database, db } from '../firebaseConfig';

export default function useTrayListener() {
  const [tray1, setTray1] = useState(0);
  const [tray2, setTray2] = useState(0);
  const [tray3, setTray3] = useState(0);
  const [trayCount, setTrayCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const traysRef = ref(database, 'trays');
    const ordersStatusRef = ref(database, 'orders/served');
    const hasServedRef = ref(database, 'robot/has_served');

    const tray1Ref = ref(database, 'trays/tray1');
    const tray2Ref = ref(database, 'trays/tray2');
    const tray3Ref = ref(database, 'trays/tray3');
    const trayCountRef = ref(database, 'trays/trayCount');

    // -----------------------------
    // ⭐ NEW FUNCTION — robot/has_served logic
    // -----------------------------
    const updateHasServed = (t1, t2, t3) => {
      if (t1 === 0 && t2 === 0 && t3 === 0) {
        set(hasServedRef, false);
      } else {
        set(hasServedRef, true);
      }
    };

    // -----------------------------
    // 🔥 Tray Listeners (with has_served auto-update)
    // -----------------------------
    const unsubTray1 = onValue(tray1Ref, snapshot => {
      const val = snapshot.exists() ? Number(snapshot.val()) : 0;
      setTray1(val);
      updateHasServed(val, tray2, tray3);
    });

    const unsubTray2 = onValue(tray2Ref, snapshot => {
      const val = snapshot.exists() ? Number(snapshot.val()) : 0;
      setTray2(val);
      updateHasServed(tray1, val, tray3);
    });

    const unsubTray3 = onValue(tray3Ref, snapshot => {
      const val = snapshot.exists() ? Number(snapshot.val()) : 0;
      setTray3(val);
      updateHasServed(tray1, tray2, val);
    });

    const unsubTrayCount = onValue(trayCountRef, snapshot => {
      if (snapshot.exists()) setTrayCount(snapshot.val());
    });

    // -----------------------------
    // 🔥 When order is served (orders/served = true)
    // -----------------------------
    const unsubServed = onValue(ordersStatusRef, async snapshot => {
      if (!snapshot.exists()) return;
      const served = snapshot.val();

      if (served === true) {
        setLoading(true);

        try {
          // Reset trays to zero
          await set(traysRef, { tray1: 0, tray2: 0, tray3: 0, trayCount: 0 });

          // Robot is now empty → set has_served = false
          await set(hasServedRef, false);

          // Load next 3 pending orders from Firestore
          const q = query(
            collection(db, 'orders'),
            where('status', '==', 'Pending'),
            orderBy('orderDate', 'asc'),
            limit(3)
          );

          const querySnapshot = await getDocs(q);
          const pendingOrders = [];
          querySnapshot.forEach(doc => pendingOrders.push(doc.data()));

          // Sort by table number
          pendingOrders.sort((a, b) => a.tableNumber - b.tableNumber);

          const trayData = {
            tray1: parseInt(pendingOrders[0]?.tableNumber || 0, 10),
            tray2: parseInt(pendingOrders[1]?.tableNumber || 0, 10),
            tray3: parseInt(pendingOrders[2]?.tableNumber || 0, 10),
          };

          const count = [trayData.tray1, trayData.tray2, trayData.tray3].filter(n => n !== 0).length;

          // Update Realtime DB trays
          await Promise.all([
            set(tray1Ref, trayData.tray1),
            set(tray2Ref, trayData.tray2),
            set(tray3Ref, trayData.tray3),
            set(trayCountRef, count)
          ]);

          // Update state
          setTray1(trayData.tray1);
          setTray2(trayData.tray2);
          setTray3(trayData.tray3);
          setTrayCount(count);

          // Update robot/has_served based on new trays
          updateHasServed(trayData.tray1, trayData.tray2, trayData.tray3);

          // Reset served flag
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
