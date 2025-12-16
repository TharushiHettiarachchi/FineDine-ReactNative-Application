import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from '../../components/customerDrawer'; 
import { MaterialIcons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerActiveTintColor: '#FF9800',
          drawerLabelStyle: { fontSize: 16 },
          headerStyle: { backgroundColor: '#FFA726' },
          headerTintColor: '#000000',
        }}
      >
        <Drawer.Screen
          name="dashboard"
          options={{
            drawerLabel: 'Dashboard',
            headerTitle: 'Dashboard',
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="addProduct"
          options={{
            drawerLabel: 'Add Product',
            headerTitle: 'Add Product',
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="person" size={size} color={color} />
            ),
          }}
        />
         <Drawer.Screen
          name="viewOrders"
          options={{
            drawerLabel: 'Pending Orders',
            headerTitle: 'Pending Orders',
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="groups" size={size} color={color} />
            ),
          }}
        />
         <Drawer.Screen
          name="completedOrders"
          options={{
            drawerLabel: 'Completed Orders',
            headerTitle: 'Completed Orders',
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="groups" size={size} color={color} />
            ),
          }}
        />
         <Drawer.Screen
          name="manageUser"
          options={{
            drawerLabel: 'Manage User',
            headerTitle: 'Manage User',
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="groups" size={size} color={color} />
            ),
          }}
        />
            <Drawer.Screen
          name="editTrays"
          options={{
            drawerLabel: 'Tray Settings',
            headerTitle: 'Tray Settings',
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="groups" size={size} color={color} />
            ),
          }}
        />
          <Drawer.Screen
          name="adminLogout"
          options={{
            drawerLabel: 'Logout',
            headerTitle: '',
            headerStyle: { backgroundColor: '#ffffff' },
            headerTintColor: '#ffffff',
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="person" size={size} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
