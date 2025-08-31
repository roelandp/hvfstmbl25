
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
      <Stack.Screen name="FaqMain" component={ConnectScreen} />
      <Stack.Screen name="FaqDetail" component={FaqDetailScreen} />
    </Stack.Navigator>
  );
}
