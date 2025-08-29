import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import ProgramStack from './ProgramStack';
import VenueStack from './VenueStack';
import SightseeingStack from './SightseeingStack';
import AudioTourScreen from '../screens/AudioTourScreen';
import ConnectScreen from '../screens/ConnectScreen';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f27d42', // sunset coral
        tabBarInactiveTintColor: '#ffffffaa', // semi-transparent white for better contrast
        tabBarStyle: {
          backgroundColor: '#062c20', // dark jungle green
          borderTopColor: '#f27d42', // coral top border
          borderTopWidth: 2,
          height: 80,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'NotoSans',
          fontWeight: '900',
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tab.Screen
        name="Program"
        component={ProgramStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Venue"
        component={VenueStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Sightseeing"
        component={SightseeingStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Audio Tour"
        component={AudioTourScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="headset-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Connect"
        component={ConnectScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
