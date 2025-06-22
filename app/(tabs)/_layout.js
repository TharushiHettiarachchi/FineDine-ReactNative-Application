import { Tabs } from 'expo-router';

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';


export default function TabLayout() {
  return (
    <Tabs
  screenOptions={{
    tabBarActiveTintColor: '#00000',
    headerStyle: {
      backgroundColor: '#25292e',
    },
    headerShadowVisible: false,
    headerTintColor: '#fff',
    tabBarStyle: {
    backgroundColor: '#FFB22C',
    },
  }}
>

      <Tabs.Screen
        name="index"
        options={{
          title: 'User',
          headerShown:false,
          tabBarIcon: ({ color, focused }) => (
            
            <FontAwesome6 name={focused ? 'user-large' : 'user'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="adminSignIn"
        options={{
          title: 'Admin',
          headerShown:false,
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6 name={focused ? 'user-shield' : 'user-gear'} color={color} size={24}/>
          ),
        }}
      />
    </Tabs>
  );
}
