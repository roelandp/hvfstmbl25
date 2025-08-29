
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VenueScreen from '../screens/VenueScreen';
import VenueDetailScreen from '../screens/VenueDetailScreen';

const Stack = createNativeStackNavigator();

export default function VenueStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="VenueMain" component={VenueScreen} />
      <Stack.Screen name="VenueDetail" component={VenueDetailScreen} />
    </Stack.Navigator>
  );
}
