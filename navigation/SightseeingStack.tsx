
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SightseeingScreen from '../screens/SightseeingScreen';
import SightseeingDetailScreen from '../screens/SightseeingDetailScreen';

const Stack = createNativeStackNavigator();

export default function SightseeingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SightseeingMain" component={SightseeingScreen} />
      <Stack.Screen name="SightseeingDetail" component={SightseeingDetailScreen} />
    </Stack.Navigator>
  );
}
