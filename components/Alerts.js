import { Modal, Text, View, Pressable, StyleSheet } from 'react-native';
import { useEffect } from 'react';

export default function Alerts({ visible, message, onClose }) {
  useEffect(() => {
    let timer;
    if (visible) {
      timer = setTimeout(() => {
        onClose(); 
      }, 1500);
    }
    return () => clearTimeout(timer); 
  }, [visible]);

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>{message}</Text>
          <Pressable onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  alertBox: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center'
  },
  alertText: {
    fontSize: 16,
    marginBottom: 15
  },
  button: {
    backgroundColor: '#FFB22C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});


