import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Link, router, Stack } from 'expo-router';
import ButtonGroups from '../components/ButtonGroup';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>404 - Page Not Found</Text>
       
      <ButtonGroups Label={"Go Back"} functionToDo={() => router.push('/')}/>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#25292e',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    fontSize: 18,
    textDecorationLine: 'underline',
    color: '#25292e',
  },
});
