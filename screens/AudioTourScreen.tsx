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
      // Use hardcoded CSV data since dynamic imports aren't working well in this environment
      const csvData = `id,title,script_text,lat,lon
1,Chan See Shu Yuen Clan Ancestral Hall,"[warmly] As we begin our walk, I'd like to welcome you into the warm embrace of the Chan See Shu Yuen Clan Ancestral Hall. Clan houses were established by Chinese migrants who shared the same surname. They offered a sanctuary where those who spoke the same dialect could share news and lend support. This beautiful building was erected between 1897 and 1906 by four tin miners and a few businessmen, and it is recognised as one of Kuala Lumpur's oldest and most ornate clan houses. The hall was originally created for people with the surnames Chan, Tan or Chen. Imagine the sense of community the newcomers must have felt when they walked through these gates. The materials and craftsmen were imported from southern China, and the structure is still protected as a heritage building. Today the hall functions as a Buddhist temple and opens its doors to visitors from 9 a.m. to 5 p.m. every day. I hope you'll take a moment to appreciate the intricate carvings and the history of this special meeting place where the story of many Chinese families in Kuala Lumpur began.",3.1402646,101.6983076
2,Chocha Foodstore,"[playfully] At first glance, this building might look like a tired old hotel, but step inside and you'll discover the quirky Chocha Foodstore. This shop is housed in what was once the Mah Lian Hotel, a building dating back to the 1920s that included rooms for a fortune teller, various businesses and even a brothel. The hotel closed long ago, and the structure sat abandoned until architect Shin Chang lovingly restored it. He kept the warren-like layout and the peeling paint to preserve its character and opened Chocha Foodstore in 2016. Today you'll find an unpretentious restaurant on the ground floor serving contemporary farm‑to‑table dishes made with produce grown behind the owner's parents' house. There's a bicycle repair shop beside the dining room, and upstairs the space now houses a bar and a co‑working office for architects. If you can, come back later for dinner – the food here is so good it might give you what I like to call a foodgasm.",3.1408989,101.6980872
3,Ho Kow Hainam Kopitiam,"[smiling] Now we arrive at one of the city's longest‑standing kopitiams, Ho Kow Hainam Kopitiam. Kopitiam literally means coffee shop – kopi is the Malay word for coffee and tiam means shop in Hokkien. These cafés were created by Hainanese‑Chinese cooks who learned to prepare Western‑style breakfasts for British families. After the colonials left, the cooks opened their own establishments, serving buttered toast with coconut jam, soft‑boiled eggs seasoned with soy sauce and pepper, and a range of traditional Hainanese and Malaysian dishes. Ho Kow was founded in 1956 and originally traded from a tiny shophouse along Lorong Panggung. In 2019 the business moved into this swanky nostalgia‑themed building and gave itself a fresh look. It still draws long queues of locals keen to relive childhood memories, so arrive early if you want to try their kaya toast and kopi.",3.1413323,101.6976873
4,Central Market,"[enthusiastically] Welcome to Central Market, a cultural landmark that has been the beating heart of Kuala Lumpur since 1888. Originally built as a wet market, this Art Deco building was transformed into a cultural center in 1986. Today it houses over 200 shops selling everything from traditional crafts to contemporary art. The building itself is a testament to Malaysia's multicultural heritage, with its distinctive blue exterior and ornate details. Inside, you'll find batik paintings, pewter works, wood carvings, and traditional textiles from across Malaysia. The market is also home to several restaurants serving authentic Malaysian cuisine. Don't miss the second floor, where you can watch artisans at work and even try your hand at traditional crafts. Central Market is not just a shopping destination; it's a living museum that celebrates the rich cultural diversity of Malaysia.",3.1412,101.6956
5,Petaling Street,"[excitedly] Now we enter the famous Petaling Street, the heart of Kuala Lumpur's Chinatown! This bustling street market has been a trading hub for over 150 years. During the day, it's a maze of stalls selling everything from fake designer goods to delicious street food. But the real magic happens in the evening when the street comes alive with neon lights and the aroma of sizzling woks. Try the famous char kway teow, fresh fruit juices, and traditional Chinese desserts. The street is also home to several temples, including the beautiful Sri Mahamariamman Temple. Petaling Street represents the entrepreneurial spirit of the Chinese community in Malaysia and offers a sensory overload that captures the essence of multicultural Kuala Lumpur.",3.1416,101.6958
6,Masjid Jamek,"[respectfully] Here stands the Masjid Jamek, one of the oldest mosques in Kuala Lumpur and a beautiful example of Moorish architecture. Built in 1909 at the confluence of the Klang and Gombak rivers, this mosque marks the birthplace of Kuala Lumpur. The name 'Kuala Lumpur' literally means 'muddy confluence,' referring to this very spot where tin miners first settled. The mosque's striking onion domes and minarets were designed by British architect Arthur Benison Hubback, who drew inspiration from Mughal architecture. The red brick and white trim create a stunning contrast against the blue sky. While the mosque is still an active place of worship, visitors are welcome outside prayer times. This sacred site represents the Islamic heritage of Malaysia and stands as a symbol of religious harmony in this diverse nation.",3.1420,101.6942
7,Sultan Abdul Samad Building,"[proudly] Behold the magnificent Sultan Abdul Samad Building, one of Kuala Lumpur's most iconic landmarks! This stunning example of Moorish Revival architecture was completed in 1897 and served as the colonial administrative center. The building's most distinctive feature is its 41-meter-high clock tower, which has become a symbol of the city. The copper domes and arched windows reflect the Islamic architectural influence, while the red brick construction shows British colonial preferences. Today, the building houses the Ministry of Heritage, Arts and Culture. The building overlooks Merdeka Square, where Malaysia's independence was declared in 1957. As you admire its grandeur, imagine the significant historical events that have unfolded within these walls and in the square before it.",3.1481,101.6934
8,Merdeka Square,"[emotionally] We now stand in Merdeka Square, the most historically significant site in Malaysia. It was here, at the stroke of midnight on August 31, 1957, that the Union Jack was lowered and the Malaysian flag was raised for the first time, marking the country's independence from British rule. The word 'Merdeka' means 'independence' in Malay. This large grass field, surrounded by colonial buildings, has witnessed countless national celebrations and important events. The 95-meter flagpole in the center is one of the tallest in the world. Every year on August 31, thousands gather here to celebrate Malaysia's National Day. The square represents the birth of modern Malaysia and the unity of its diverse people. Take a moment to feel the weight of history and the hopes and dreams of a nation that were realized on this very ground.",3.1485,101.6936

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

      // Create audio source using require for better compatibility with Expo
      const audioUri = require(`../assets/audiotour/${stop.id}.mp3`);
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