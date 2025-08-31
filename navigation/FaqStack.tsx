
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConnectScreen from '../screens/ConnectScreen';
import FaqDetailScreen from '../screens/FaqDetailScreen';

const Stack = createNativeStackNavigator();

export default function FaqStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="FaqMain"
      >
        {(props) => <ConnectScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen 
        name="FaqDetail"
      >
        {(props) => <FaqDetailScreen {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
