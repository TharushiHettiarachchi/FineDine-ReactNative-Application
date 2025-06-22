import { StyleSheet, View, Text, Pressable } from 'react-native';
import React from 'react';

export default function IncrementGroups({ value, onIncrement, onDecrement }) {
 

  return (
    <View style={styles.btnGroup}>
      <View style={styles.incrementContainer}>
        <Pressable 
          style={({ pressed }) => [
            styles.sideBtn,
            pressed && styles.pressedBtn,
            value <= 0 && styles.disabledBtn
          ]}
          onPress={onDecrement}
          disabled={value <= 0}
          hitSlop={20}
       
        >
          <Text style={styles.btnText}>-</Text>
        </Pressable>

        <View style={styles.countDisplay} >
          <Text style={styles.countText}>{value}</Text>
        </View>

        <Pressable 
          style={({ pressed }) => [
            styles.sideBtn,
            pressed && styles.pressedBtn
          ]}
          onPress={onIncrement}
          hitSlop={20}
        
        >
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btnGroup: {
    width: "30%",
    paddingHorizontal: 2,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  incrementContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideBtn: {
    backgroundColor: "#FFB22C",
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    elevation: 2,
  },
  pressedBtn: {
    backgroundColor: "#E69500",
    transform: [{ scale: 0.95 }],
  },
  disabledBtn: {
    backgroundColor: "#CCCCCC",
  },
  countDisplay: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#FFB22C",
    borderWidth: 2,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  btnText: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
  countText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
});