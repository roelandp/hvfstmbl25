
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FaqScreen from '../screens/FaqScreen';
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
        component={FaqScreen}
      />
      <Stack.Screen 
        name="FaqDetail" 
        component={FaqDetailScreen}
      />
    </Stack.Navigator>
  );
}
