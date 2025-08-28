
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  SafeAreaView,
  StatusBar,
  Alert 
} from 'react-native';
import MapView, { Marker } from 'expo-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { getVenues } from '../data/getVenues';

interface Venue {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  description?: string;
}

export default function VenueScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const venueData = await getVenues();
      setVenues(venueData);
      
      // Calculate map region to fit all venues
      if (venueData.length > 0) {
        const venuesWithCoords = venueData.filter(v => v.latitude && v.longitude);
        
        if (venuesWithCoords.length > 0) {
          const latitudes = venuesWithCoords.map(v => v.latitude);
          const longitudes = venuesWithCoords.map(v => v.longitude);
          
          const minLat = Math.min(...latitudes);
          const maxLat = Math.max(...latitudes);
          const minLng = Math.min(...longitudes);
          const maxLng = Math.max(...longitudes);
          
          const centerLat = (minLat + maxLat) / 2;
          const centerLng = (minLng + maxLng) / 2;
          
          const latDelta = Math.max((maxLat - minLat) * 1.5, 0.01);
          const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.01);
          
          setMapRegion({
            latitude: centerLat,
            longitude: centerLng,
            latitudeDelta: latDelta,
            longitudeDelta: lngDelta,
          });
        }
      }
    } catch (error) {
      console.error('Error loading venues:', error);
      Alert.alert('Error', 'Failed to load venue data');
    } finally {
      setLoading(false);
    }
  };

  const onMarkerPress = (venue: Venue) => {
    Alert.alert(
      venue.name,
      venue.address || venue.description || 'No additional information available',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <>
        <StatusBar
          translucent
          backgroundColor={theme.colors.primary}
          barStyle="light-content"
          animated={true}
        />
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading venues...</Text>
        </View>
      </>
    );
  }

  const venuesWithCoords = venues.filter(v => v.latitude && v.longitude);

  return (
    <>
      <StatusBar
        translucent
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
        animated={true}
      />
      <View style={{ backgroundColor: theme.colors.primary, flex: 1 }}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="location" size={24} color="white" />
            <Text style={styles.headerTitle}>Venues</Text>
          </View>

          {/* Map Container */}
          <View style={styles.mapContainer}>
            {venuesWithCoords.length > 0 ? (
              <MapView
                style={styles.map}
                region={mapRegion}
                showsUserLocation={false}
                mapType="standard"
              >
                {venuesWithCoords.map((venue) => (
                  <Marker
                    key={venue.id}
                    coordinate={{
                      latitude: venue.latitude!,
                      longitude: venue.longitude!,
                    }}
                    title={venue.name}
                    description={venue.address || venue.description}
                    onPress={() => onMarkerPress(venue)}
                  >
                    <View style={styles.markerContainer}>
                      <Ionicons 
                        name="location" 
                        size={30} 
                        color={theme.colors.accent} 
                      />
                    </View>
                  </Marker>
                ))}
              </MapView>
            ) : (
              <View style={styles.noDataContainer}>
                <Ionicons name="map-outline" size={64} color={theme.colors.muted} />
                <Text style={styles.noDataText}>No venue locations available</Text>
                <Text style={styles.noDataSubtext}>
                  Venue data doesn't contain coordinate information
                </Text>
              </View>
            )}
          </View>

          {/* Venue Count Info */}
          <View style={styles.infoBar}>
            <Text style={styles.infoText}>
              {venuesWithCoords.length} of {venues.length} venues shown on map
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    fontWeight: '600',
    marginLeft: 12,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 32,
  },
  noDataText: {
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.muted,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoBar: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoText: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.muted,
    textAlign: 'center',
  },
});
