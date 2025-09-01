
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProgramScreen from '../screens/ProgramScreen';
import ProgramDetailScreen from '../screens/ProgramDetailScreen';

const Stack = createNativeStackNavigator();

export default function ProgramStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProgramMain" component={ProgramScreen} />
      <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen} />
    </Stack.Navigator>
  );
}
