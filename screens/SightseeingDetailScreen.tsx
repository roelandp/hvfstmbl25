
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { getSightseeing } from '../data/getSightseeing';

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

export default function SightseeingDetailScreen({ route, navigation }: any) {
  const { sightseeingId, sightseeingName } = route.params;
  const [sightseeing, setSightseeing] = useState<Sightseeing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSightseeingDetails();
  }, []);

  const loadSightseeingDetails = async () => {
    try {
      const sightseeingData = await getSightseeing();
      const foundSightseeing = sightseeingData.find((s: Sightseeing) => s.id === sightseeingId || s.name === sightseeingName);
      
      if (foundSightseeing) {
        // Parse coordinates if they exist
        if (foundSightseeing.Coordinates && typeof foundSightseeing.Coordinates === 'string') {
          const coords = foundSightseeing.Coordinates.split(',').map(c => parseFloat(c.trim()));
          if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            foundSightseeing.latitude = coords[0];
            foundSightseeing.longitude = coords[1];
          }
        }
        setSightseeing(foundSightseeing);
      }
    } catch (error) {
      console.error('Error loading sightseeing details:', error);
      Alert.alert('Error', 'Failed to load sightseeing details');
    } finally {
      setLoading(false);
    }
  };

  const openMaps = async () => {
    if (sightseeing?.latitude && sightseeing?.longitude) {
      const lat = sightseeing.latitude;
      const lng = sightseeing.longitude;
      const label = encodeURIComponent(sightseeing.name);
      
      // Try native maps first, fall back to Google Maps web
      const schemes = Platform.select({
        ios: [
          `maps://app?q=${lat},${lng}`,
          `http://maps.apple.com/?q=${lat},${lng}&ll=${lat},${lng}`,
          `https://maps.google.com/maps?q=${lat},${lng}`
        ],
        android: [
          `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
          `https://maps.google.com/maps?q=${lat},${lng}`
        ]
      }) || [`https://maps.google.com/maps?q=${lat},${lng}`];

      for (const url of schemes) {
        try {
          const supported = await Linking.canOpenURL(url);
          if (supported) {
            await Linking.openURL(url);
            return;
          }
        } catch (error) {
          console.warn('Failed to open URL:', url, error);
        }
      }
      
      Alert.alert('Error', 'Unable to open maps application');
    }
  };

  const openImage = async () => {
    if (sightseeing?.img) {
      try {
        const supported = await Linking.canOpenURL(sightseeing.img);
        if (supported) {
          await Linking.openURL(sightseeing.img);
        } else {
          Alert.alert('Error', 'Unable to open image URL');
        }
      } catch (error) {
        console.error('Error opening image:', error);
        Alert.alert('Error', 'Failed to open image');
      }
    }
  };

  const openWebURL = async () => {
    if (sightseeing?.url) {
      try {
        const supported = await Linking.canOpenURL(sightseeing.url);
        if (supported) {
          await Linking.openURL(sightseeing.url);
        } else {
          Alert.alert('Error', 'Unable to open website URL');
        }
      } catch (error) {
        console.error('Error opening website URL:', error);
        Alert.alert('Error', 'Failed to open website');
      }
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
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading sightseeing details...</Text>
        </View>
      </>
    );
  }

  if (!sightseeing) {
    return (
      <>
        <StatusBar
          translucent
          backgroundColor={theme.colors.primary}
          barStyle="light-content"
          animated={true}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.muted} />
          <Text style={styles.errorText}>Sightseeing location not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

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
            <TouchableOpacity
              style={styles.backIconButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="map" size={24} color="white" />
              <Text style={styles.headerTitle} numberOfLines={1}>
                {sightseeing.name}
              </Text>
            </View>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.sightseeingName}>{sightseeing.name}</Text>
              
              {sightseeing.img && (
                <TouchableOpacity style={styles.imageContainer} onPress={openImage}>
                  <Image 
                    source={{ uri: sightseeing.img }} 
                    style={styles.sightseeingImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              
              {sightseeing.description && (
                <View style={styles.infoSection}>
                  <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.infoText}>{sightseeing.description}</Text>
                </View>
              )}
              
              {sightseeing.address && (
                <View style={styles.infoSection}>
                  <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.infoText}>{sightseeing.address}</Text>
                </View>
              )}

              {sightseeing.latitude && sightseeing.longitude && (
                <View style={styles.infoSection}>
                  <Ionicons name="navigate-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.infoText}>
                    {sightseeing.latitude.toFixed(6)}, {sightseeing.longitude.toFixed(6)}
                  </Text>
                </View>
              )}

              {sightseeing.url && (
                <TouchableOpacity style={styles.urlSection} onPress={openWebURL}>
                  <Ionicons name="globe-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.urlText}>{sightseeing.url}</Text>
                  <Ionicons name="open-outline" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
            </View>

            {sightseeing.latitude && sightseeing.longitude && (
              <TouchableOpacity style={styles.mapsButton} onPress={openMaps}>
                <Ionicons name="map" size={24} color="white" />
                <Text style={styles.mapsButtonText}>Open in Maps</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
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
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: theme.fonts.body,
    fontWeight: '600',
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIconButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sightseeingName: {
    fontSize: 24,
    fontFamily: theme.fonts.heading,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 20,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    marginLeft: 12,
    lineHeight: 22,
  },
  mapsButton: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mapsButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: theme.fonts.body,
    fontWeight: '600',
    marginLeft: 8,
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sightseeingImage: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.background,
  },
  urlSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  urlText: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.primary,
    marginLeft: 12,
    marginRight: 8,
    textDecorationLine: 'underline',
  },
});
