import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, AudioSource } from 'expo-audio';
import { theme } from '../theme';
import { generateAudioTourMapHTML } from '../utils/mapTileGenerator';

interface AudioStop {
  id: string;
  title: string;
  script_text: string;
  lat: number;
  lon: number;
}

const { width } = Dimensions.get('window');

export default function AudioTourScreen() {
  const [stops, setStops] = useState<AudioStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapHTML, setMapHTML] = useState<string>('');
  const [currentStop, setCurrentStop] = useState<AudioStop | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const webViewRef = useRef<WebView>(null);

  const player = useAudioPlayer();

  useEffect(() => {
    loadAudioStops();

    return () => {
      player.pause();
    };
  }, []);

  const loadAudioStops = async () => {
    try {
      // Load CSV data from assets
      const csvAsset = require('../assets/stops_restructured_cleaned.csv');
      let csvData: string;
      
      if (typeof csvAsset === 'string') {
        csvData = csvAsset;
      } else {
        // If it's imported as a module, try to get the default export or text content
        csvData = csvAsset.default || csvAsset.toString();
      }

      // Parse CSV data
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',');

      const parsedStops: AudioStop[] = lines.slice(1).map(line => {
        // Handle quoted CSV fields that might contain commas
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim()); // Add the last value

        return {
          id: values[0]?.replace(/"/g, '') || '',
          title: values[1]?.replace(/"/g, '') || '',
          script_text: values[2]?.replace(/"/g, '') || '',
          lat: parseFloat(values[3]?.replace(/"/g, '') || '0'),
          lon: parseFloat(values[4]?.replace(/"/g, '') || '0')
        };
      }).filter(stop => stop.id && !isNaN(stop.lat) && !isNaN(stop.lon));

      console.log('Loaded stops:', parsedStops.length);
      setStops(parsedStops);

      if (parsedStops.length > 0) {
        generateMapHTML(parsedStops);
      }
    } catch (error) {
      console.error('Error loading audio stops:', error);
      Alert.alert('Error', 'Failed to load audio tour data');
    } finally {
      setLoading(false);
    }
  };

  const generateMapHTML = (audioStops: AudioStop[]) => {
    if (audioStops.length === 0) return;

    const latitudes = audioStops.map(s => s.lat);
    const longitudes = audioStops.map(s => s.lon);
    const centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
    const centerLng = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;

    console.log('Generating map with', audioStops.length, 'stops');
    console.log('Center:', centerLat, centerLng);

    const html = generateAudioTourMapHTML(audioStops, centerLat, centerLng);
    setMapHTML(html);
  };

  // Static mapping of audio files for require()
  const audioFiles: { [key: string]: any } = {
    '1': require('../assets/audiotour/1.mp3'),
    '2': require('../assets/audiotour/2.mp3'),
    '3': require('../assets/audiotour/3.mp3'),
    '4': require('../assets/audiotour/4.mp3'),
    '5': require('../assets/audiotour/5.mp3'),
    '6': require('../assets/audiotour/6.mp3'),
    '7': require('../assets/audiotour/7.mp3'),
    '8': require('../assets/audiotour/8.mp3'),
    '9': require('../assets/audiotour/9.mp3'),
    '10': require('../assets/audiotour/10.mp3'),
    '11': require('../assets/audiotour/11.mp3'),
    '12': require('../assets/audiotour/12.mp3'),
    '13': require('../assets/audiotour/13.mp3'),
    '14': require('../assets/audiotour/14.mp3'),
    '15': require('../assets/audiotour/15.mp3'),
    '16': require('../assets/audiotour/16.mp3'),
    '17': require('../assets/audiotour/17.mp3'),
    '18': require('../assets/audiotour/18.mp3'),
    '19': require('../assets/audiotour/19.mp3'),
    '20': require('../assets/audiotour/20.mp3'),
    '21': require('../assets/audiotour/21.mp3'),
    '22': require('../assets/audiotour/22.mp3'),
    '23': require('../assets/audiotour/23.mp3'),
    '24': require('../assets/audiotour/24.mp3'),
    '25': require('../assets/audiotour/25.mp3'),
    '26': require('../assets/audiotour/26.mp3'),
    '27': require('../assets/audiotour/27.mp3'),
    '28': require('../assets/audiotour/28.mp3'),
    '29': require('../assets/audiotour/29.mp3'),
    '30': require('../assets/audiotour/30.mp3'),
  };

  const playAudio = async (stop: AudioStop) => {
    try {
      setCurrentStop(stop);
      setCurrentIndex(parseInt(stop.id) - 1);

      // Update active marker on map
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          action: 'setActiveMarker',
          index: parseInt(stop.id) - 1
        }));
      }

      // Get audio source from static mapping
      const audioUri = audioFiles[stop.id];
      if (!audioUri) {
        Alert.alert('Audio Error', 'Audio file for stop ' + stop.id + ' not found.');
        return;
      }

      console.log('Attempting to play audio for stop:', stop.id);

      // Load and play audio
      player.replace(audioUri as AudioSource);
      player.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Audio Error', `Could not play audio for stop ${stop.id}. Audio file may not exist.`);
    }
  };

  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const navigateToStop = (direction: 'prev' | 'next') => {
    let newIndex = currentIndex;
    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < stops.length - 1) {
      newIndex = currentIndex + 1;
    }

    if (newIndex !== currentIndex && stops[newIndex]) {
      const stop = stops[newIndex];
      playAudio(stop);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
          <Text style={styles.loadingText}>Loading audio tour...</Text>
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
            <Ionicons name="headset" size={24} color="white" />
            <Text style={styles.headerTitle}>Audio Tour</Text>
          </View>

          {/* Map Container */}
          <View style={styles.mapContainer}>
            {mapHTML ? (
              <WebView
                ref={webViewRef}
                source={{ html: mapHTML }}
                style={styles.webview}
                onError={(error) => {
                  console.error('WebView error:', error);
                  Alert.alert('Map Error', 'Failed to load map');
                }}
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    console.log('WebView message:', data);
                    if (data.type === 'stopClick') {
                      playAudio(data.stop);
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
                <Ionicons name="headset-outline" size={64} color={theme.colors.muted} />
                <Text style={styles.noDataText}>No audio tour data available</Text>
                <Text style={styles.noDataSubtext}>
                  Found {stops.length} stops
                </Text>
              </View>
            )}
          </View>

          {/* Audio Player */}
          {currentStop && (
            <View style={styles.audioPlayer}>
              <View style={styles.stopInfo}>
                <Text style={styles.stopNumber}>Stop {currentStop.id}</Text>
                <Text style={styles.stopTitle} numberOfLines={2}>
                  {currentStop.title}
                </Text>
              </View>

              <View style={styles.controls}>
                <TouchableOpacity
                  style={[styles.controlButton, currentIndex === 0 && styles.disabledButton]}
                  onPress={() => navigateToStop('prev')}
                  disabled={currentIndex === 0}
                >
                  <Ionicons name="play-skip-back" size={24} color={currentIndex === 0 ? theme.colors.muted : 'white'} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                  <Ionicons name={player.playing ? 'pause' : 'play'} size={32} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, currentIndex === stops.length - 1 && styles.disabledButton]}
                  onPress={() => navigateToStop('next')}
                  disabled={currentIndex === stops.length - 1}
                >
                  <Ionicons name="play-skip-forward" size={24} color={currentIndex === stops.length - 1 ? theme.colors.muted : 'white'} />
                </TouchableOpacity>
              </View>

              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(player.currentTime || 0)}</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${player.duration > 0 ? ((player.currentTime || 0) / player.duration) * 100 : 0}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.timeText}>{formatTime(player.duration || 0)}</Text>
              </View>
            </View>
          )}
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
  },
  audioPlayer: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 140,
  },
  stopInfo: {
    marginBottom: 16,
  },
  stopNumber: {
    color: 'white',
    fontSize: 14,
    fontFamily: theme.fonts.body,
    fontWeight: '600',
    opacity: 0.8,
  },
  stopTitle: {
    color: 'white',
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    fontWeight: '600',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  controlButton: {
    padding: 12,
    marginHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  playButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: theme.fonts.body,
    minWidth: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginHorizontal: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
});