
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from '../../components/customerDrawer'; 
import { FontAwesome6, Entypo, MaterialIcons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerActiveTintColor: '#FF9800',
          drawerLabelStyle: { fontSize: 16 },
          style:{padding: 0,}
        }}
      >
        <Drawer.Screen
          name="home"
          options={{
            drawerLabel: 'Home',
            headerTitle:"Home",
            headerTintColor:"#00000",
            headerStyle: {
              backgroundColor: '#FFA726',
            },
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: 'Profile',
            headerTitle:"Profile",
            headerTintColor:"#00000",
            headerStyle: {
              backgroundColor: '#FFA726',
            },
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="person" size={size} color={color} />
            ),
          }}
        />
          <Drawer.Screen
          name="cart"
          options={{
            drawerLabel: 'Cart',
            headerTitle:"Cart",
            headerTintColor:"#00000",
            headerStyle: {
              backgroundColor: '#FFA726',
            },
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="person" size={size} color={color} />
            ),
          }}
        />
         <Drawer.Screen
          name="myOrders"
          options={{
            drawerLabel: 'My Orders',
            headerTitle:"My Orders",
            headerTintColor:"#00000",
            headerStyle: {
              backgroundColor: '#FFA726',
            },
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="person" size={size} color={color} />
            ),
          }}
        />
         <Drawer.Screen
          name="logout"
          options={{
            drawerLabel: 'LogOut',
            headerTitle:"",
            headerTintColor:"#ffff",
            headerStyle: {
              backgroundColor: '#ffff',
            },
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="logout" size={size} color={color} />
            ),
          }}
        />
       
      </Drawer>
    </GestureHandlerRootView>
  );
}
