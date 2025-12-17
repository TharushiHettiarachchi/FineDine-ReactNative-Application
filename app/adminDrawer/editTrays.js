import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
} from "react-native";
import { database } from "../../firebaseConfig";
import { ref, onValue, update } from "firebase/database";

export default function EditTrays() {
  
  const [tray1, setTray1] = useState("");
  const [tray2, setTray2] = useState("");
  const [tray3, setTray3] = useState("");

  const [served, setServed] = useState(false);
  const [hasServed, setHasServed] = useState(false);
  const [hasEmergency, setHasEmergency] = useState(false);
  const [charging, setCharging] = useState(false);

 
  const [ultraLeft, setUltraLeft] = useState("");
  const [ultraCenter, setUltraCenter] = useState("");
  const [ultraRight, setUltraRight] = useState("");

  useEffect(() => {
    const traysRef = ref(database, "trays/");
    const ordersRef = ref(database, "orders/");
    const robotRef = ref(database, "robot/");
    const ultrasonicRef = ref(database, "ultrasonic/");

    const unsubTrays = onValue(traysRef, (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.val();
        setTray1(String(d.tray1 ?? ""));
        setTray2(String(d.tray2 ?? ""));
        setTray3(String(d.tray3 ?? ""));
      }
    });

    const unsubOrders = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) setServed(snapshot.val().served ?? false);
    });

    const unsubRobot = onValue(robotRef, (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.val();
        setHasServed(d.has_served ?? false);
        setHasEmergency(d.emergency ?? false);
        setCharging(d.charging ?? false);
      }
    });

    const unsubUltrasonic = onValue(ultrasonicRef, (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.val();
        setUltraLeft(String(d.left ?? ""));
        setUltraCenter(String(d.center ?? ""));
        setUltraRight(String(d.right ?? ""));
      }
    });

    return () => {
      unsubTrays();
      unsubOrders();
      unsubRobot();
      unsubUltrasonic();
    };
  }, []);

  
  const saveTrays = async () => {
    const t1 = parseInt(tray1, 10);
    const t2 = parseInt(tray2, 10);
    const t3 = parseInt(tray3, 10);

    if ([t1, t2, t3].some(isNaN)) {
      Alert.alert("Invalid Input", "Please enter valid integers for all trays.");
      return;
    }

    try {
      await update(ref(database, "trays/"), { tray1: t1, tray2: t2, tray3: t3 });
      Alert.alert("Success", "Tray numbers updated!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };


  const saveUltrasonic = async () => {
    const l = parseInt(ultraLeft, 10);
    const c = parseInt(ultraCenter, 10);
    const r = parseInt(ultraRight, 10);

    if ([l, c, r].some(isNaN)) {
      Alert.alert("Invalid Input", "Enter valid ultrasonic values.");
      return;
    }

    try {
      await update(ref(database, "ultrasonic/"), { left: l, center: c, right: r });
      Alert.alert("Success", "Ultrasonic values updated!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Robot Control Panel</Text>

    
      <Text style={styles.sectionTitle}>Tray Configuration</Text>
      <TextInput
        style={styles.input}
        placeholder="Tray 1 Table Number"
        value={tray1}
        onChangeText={(t) => setTray1(t.replace(/[^0-9]/g, ""))}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Tray 2 Table Number"
        value={tray2}
        onChangeText={(t) => setTray2(t.replace(/[^0-9]/g, ""))}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Tray 3 Table Number"
        value={tray3}
        onChangeText={(t) => setTray3(t.replace(/[^0-9]/g, ""))}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={saveTrays}>
        <Text style={styles.buttonText}>Save Trays</Text>
      </TouchableOpacity>

     
      <Text style={styles.sectionTitle}>Robot Status</Text>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleText}>Order Served</Text>
        <Switch value={served} onValueChange={(v) => update(ref(database, "orders/"), { served: v })} />
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleText}>Robot Has Served</Text>
        <Switch value={hasServed} onValueChange={(v) => update(ref(database, "robot/"), { has_served: v })} />
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleText}>Emergency</Text>
        <Switch value={hasEmergency} onValueChange={(v) => update(ref(database, "robot/"), { emergency: v })} />
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleText}>Charging</Text>
        <Switch value={charging} onValueChange={(v) => update(ref(database, "robot/"), { charging: v })} />
      </View>

     
      <Text style={styles.sectionTitle}>Ultrasonic Sensors (cm)</Text>
      <TextInput
        style={styles.input}
        placeholder="Left Ultrasonic"
        value={ultraLeft}
        onChangeText={(t) => setUltraLeft(t.replace(/[^0-9]/g, ""))}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Center Ultrasonic"
        value={ultraCenter}
        onChangeText={(t) => setUltraCenter(t.replace(/[^0-9]/g, ""))}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Right Ultrasonic"
        value={ultraRight}
        onChangeText={(t) => setUltraRight(t.replace(/[^0-9]/g, ""))}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={saveUltrasonic}>
        <Text style={styles.buttonText}>Save Ultrasonic</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fffaf2",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 15,
  },
  input: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#ff9900",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 25,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  toggleText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
