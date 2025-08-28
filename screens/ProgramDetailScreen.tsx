
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { getVenues } from '../data/getVenues';

export default function ProgramDetailScreen({ route, navigation }: any) {
  const { item } = route.params;
  const [venues, setVenues] = useState<any[]>([]);

  useEffect(() => {
    getVenues()
      .then(setVenues)
      .catch(console.error);
  }, []);

  const formatTime = (timeStr: string) => {
    try {
      let dt = new Date(timeStr);
      if (isNaN(dt.getTime()) && timeStr.includes('/')) {
        const parts = timeStr.split(' ');
        if (parts.length === 2) {
          const [datePart, timePart] = parts;
          const [month, day, year] = datePart.split('/');
          const [hours, minutes, seconds] = timePart.split(':');
          dt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
        }
      }
      return dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  const formatDuration = () => {
    try {
      let startDt = new Date(item.timestart);
      let endDt = new Date(item.timeend);
      
      // Handle MM/DD/YYYY format if needed
      if (isNaN(startDt.getTime()) && item.timestart.includes('/')) {
        const parts = item.timestart.split(' ');
        if (parts.length === 2) {
          const [datePart, timePart] = parts;
          const [month, day, year] = datePart.split('/');
          const [hours, minutes, seconds] = timePart.split(':');
          startDt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
        }
      }
      
      if (isNaN(endDt.getTime()) && item.timeend.includes('/')) {
        const parts = item.timeend.split(' ');
        if (parts.length === 2) {
          const [datePart, timePart] = parts;
          const [month, day, year] = datePart.split('/');
          const [hours, minutes, seconds] = timePart.split(':');
          endDt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
        }
      }

      const durationMs = endDt.getTime() - startDt.getTime();
      const minutes = Math.floor(durationMs / (1000 * 60));
      
      if (minutes < 60) {
        return `${minutes} minutes`;
      } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
      }
    } catch {
      return 'Duration unavailable';
    }
  };

  const getVenueName = (venueId: string) => {
    const venue = venues.find(v => v.id === venueId);
    return venue ? venue.name : venueId;
  };

  const speakers = item.users ? item.users.split(',').filter((s: string) => s.trim()) : [];
  const urls = item.url ? item.url.split(',').filter((u: string) => u.trim()) : [];

  const handleUrlPress = (url: string) => {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    Linking.openURL(formattedUrl);
  };

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
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Program Details</Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              {/* Title */}
              <Text style={styles.title}>{item.title}</Text>

              {/* Time and Duration */}
              <View style={styles.timeContainer}>
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={18} color={theme.colors.accent} />
                  <Text style={styles.timeText}>
                    {formatTime(item.timestart)} - {formatTime(item.timeend)}
                  </Text>
                </View>
                <Text style={styles.duration}>Duration: {formatDuration()}</Text>
              </View>

              {/* Venue */}
              {item.venue && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={18} color={theme.colors.accent} />
                  <Text style={styles.infoText}>Venue: {getVenueName(item.venue)}</Text>
                </View>
              )}

              {/* Speakers */}
              {speakers.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Speakers</Text>
                  {speakers.map((speaker: string, index: number) => (
                    <View key={index} style={styles.speakerRow}>
                      <Ionicons name="person-outline" size={16} color={theme.colors.accent} />
                      <Text style={styles.speakerText}>{speaker.trim()}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Description */}
              {item.description && item.description.trim() && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
              )}

              {/* URLs */}
              {urls.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Links</Text>
                  {urls.map((url: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.urlRow}
                      onPress={() => handleUrlPress(url)}
                    >
                      <Ionicons name="link-outline" size={16} color={theme.colors.accent} />
                      <Text style={styles.urlText}>{url.trim()}</Text>
                      <Ionicons name="open-outline" size={16} color={theme.colors.accent} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Timetable Title */}
              {item.timetabletitle && item.timetabletitle.trim() && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Session</Text>
                  <Text style={styles.infoText}>{item.timetabletitle}</Text>
                </View>
              )}
            </View>
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
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    fontWeight: '600',
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
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.heading,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
    lineHeight: 32,
  },
  timeContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 8,
  },
  duration: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.muted,
    marginLeft: 26,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    marginLeft: 8,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  speakerText: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    marginLeft: 8,
  },
  description: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    lineHeight: 22,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  urlText: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.accent,
    marginLeft: 8,
    flex: 1,
    textDecorationLine: 'underline',
  },
});
