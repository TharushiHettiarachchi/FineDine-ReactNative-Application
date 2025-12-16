import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
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

  useEffect(() => {
    const traysRef = ref(database, "trays/");
    const ordersRef = ref(database, "orders/");
    const robotRef = ref(database, "robot/");

    // 🔄 Listen to trays
    const unsubTrays = onValue(traysRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTray1(String(data.tray1 ?? ""));
        setTray2(String(data.tray2 ?? ""));
        setTray3(String(data.tray3 ?? ""));
      }
    });

    // 🔄 Listen to order served
    const unsubOrders = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        setServed(snapshot.val().served ?? false);
      }
    });

    // 🔄 Listen to robot states (has_served + emergency)
    const unsubRobot = onValue(robotRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setHasServed(data.has_served ?? false);
        setHasEmergency(data.emergency ?? false);
      }
    });

    return () => {
      unsubTrays();
      unsubOrders();
      unsubRobot();
    };
  }, []);

  // 💾 Save tray numbers
  const saveChanges = async () => {
    const t1 = parseInt(tray1, 10);
    const t2 = parseInt(tray2, 10);
    const t3 = parseInt(tray3, 10);

    if ([t1, t2, t3].some(isNaN)) {
      Alert.alert("Invalid Input", "Please enter valid integers for all trays.");
      return;
    }

    try {
      await update(ref(database, "trays/"), {
        tray1: t1,
        tray2: t2,
        tray3: t3,
      });
      Alert.alert("Success", "Tray numbers updated!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // 🔁 Toggle order served
  const toggleServed = async (value) => {
    setServed(value);
    await update(ref(database, "orders/"), { served: value });
  };

  // 🤖 Toggle has_served
  const toggleHasServed = async (value) => {
    setHasServed(value);
    await update(ref(database, "robot/"), { has_served: value });
  };

  // 🚨 Toggle emergency
  const toggleHasEmergency = async (value) => {
    setHasEmergency(value);
    await update(ref(database, "robot/"), { emergency: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Tray Numbers</Text>

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

      <TouchableOpacity style={styles.button} onPress={saveChanges}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleText}>Order Served</Text>
        <Switch value={served} onValueChange={toggleServed} />
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleText}>Robot Has Served</Text>
        <Switch value={hasServed} onValueChange={toggleHasServed} />
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleText}>Robot Emergency</Text>
        <Switch value={hasEmergency} onValueChange={toggleHasEmergency} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fffaf2",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    width: "100%",
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
    marginBottom: 30,
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
