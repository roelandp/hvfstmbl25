
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
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { getSightseeing } from '../data/getSightseeing';
import { generateMapHTML, MapBounds } from '../utils/mapTileGenerator';

interface Sightseeing {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  description?: string;
  Coordinates?: string;
  img?: string;
  url?: string;
}

export default function SightseeingScreen() {
  const navigation = useNavigation();
  const [sightseeing, setSightseeing] = useState<Sightseeing[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapHTML, setMapHTML] = useState<string>('');

  useEffect(() => {
    loadSightseeing();
  }, []);

  const loadSightseeing = async () => {
    try {
      const sightseeingData = await getSightseeing();
      
      // Parse coordinates from the coordinates field
      const parsedSightseeing = sightseeingData.map(item => {
        if (item.coordinates && typeof item.coordinates === 'string') {
          const coords = item.coordinates.split(',').map(c => parseFloat(c.trim()));
          if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            return {
              ...item,
              latitude: coords[0],
              longitude: coords[1]
            };
          }
        }
        return item;
      });
      
      setSightseeing(parsedSightseeing);

      // Generate map HTML
      if (parsedSightseeing.length > 0) {
        const sightseeingWithCoords = parsedSightseeing.filter(v => v.latitude && v.longitude);

        if (sightseeingWithCoords.length > 0) {
          const latitudes = sightseeingWithCoords.map(v => v.latitude!);
          const longitudes = sightseeingWithCoords.map(v => v.longitude!);

          const minLat = Math.min(...latitudes);
          const maxLat = Math.max(...latitudes);
          const minLng = Math.min(...longitudes);
          const maxLng = Math.max(...longitudes);

          const centerLat = (minLat + maxLat) / 2;
          const centerLng = (minLng + maxLng) / 2;

          const bounds: MapBounds = {
            north: maxLat,
            south: minLat,
            east: maxLng,
            west: minLng
          };

          const html = generateMapHTML(sightseeingWithCoords, bounds, centerLat, centerLng);
          setMapHTML(html);
        }
      }
    } catch (error) {
      console.error('Error loading sightseeing:', error);
      Alert.alert('Error', 'Failed to load sightseeing data');
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.loadingText}>Loading sightseeing...</Text>
        </View>
      </>
    );
  }

  const sightseeingWithCoords = sightseeing.filter(v => v.latitude && v.longitude);

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
            <Ionicons name="map" size={24} color="white" />
            <Text style={styles.headerTitle}>Sightseeing</Text>
          </View>

          {/* Map Container */}
          <View style={styles.mapContainer}>
            {sightseeingWithCoords.length > 0 && mapHTML ? (
              <WebView
                source={{ html: mapHTML }}
                style={styles.webview}
                onError={(error) => {
                  console.error('WebView error:', error);
                  Alert.alert('Map Error', 'Failed to load map');
                }}
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    if (data.type === 'venueClick') {
                      // Navigate to sightseeing detail screen
                      navigation.navigate('SightseeingDetail', {
                        sightseeingName: data.venue.name,
                        sightseeingId: data.venue.id
                      });
                    }
                  } catch (error) {
                    console.error('Error parsing message:', error);
                  }
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.webviewLoading}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading map...</Text>
                  </View>
                )}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Ionicons name="map-outline" size={64} color={theme.colors.muted} />
                <Text style={styles.noDataText}>No sightseeing locations available</Text>
                <Text style={styles.noDataSubtext}>
                  Sightseeing data doesn't contain coordinate information
                </Text>
              </View>
            )}
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
  webview: {
    flex: 1,
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
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
});
