import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme';
import { getSchedule } from '../data/getSchedule';
import { getVenues } from '../data/getVenues';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const QUARTER_WIDTH = 40;
const HOUR_WIDTH = QUARTER_WIDTH * 4;
const VENUE_COL_WIDTH = 100;
const SCREEN_WIDTH = Dimensions.get('window').width;

const getOffset = (timeStr: string, firstHour: number) => {
  const dt = new Date(timeStr);
  const minutes = dt.getHours() * 60 + dt.getMinutes();
  return ((minutes - firstHour * 60) / 15) * QUARTER_WIDTH;
};

export default function ScheduleView() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTimeOffset, setCurrentTimeOffset] = useState(0);

  useEffect(() => {
    Promise.all([getSchedule(), getVenues()])
      .then(([sched, vens]) => {
        setSchedule(sched);
        setVenues(vens);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const days = Array.from(
    new Set(schedule.map((item) => item.dategroupby))
  ).filter(d => !isNaN(new Date(d).getTime())).sort();

  // Auto-scroll to current time and update currentTimeOffset periodically
  const activeDay = days[selectedDayIdx];
  const dayItems = schedule.filter((item) => item.dategroupby === activeDay);
  const venueIds = Array.from(new Set(dayItems.map((i) => i.venue)));
  const firstHour = 7;
  const lastHour = Math.max(
    24,
    ...dayItems.map((i) => new Date(i.timeend).getHours() + 1)
  );

  useEffect(() => {
    if (firstHour === 0 && lastHour === 0) return;
    const updateCurrentTimeOffset = () => {
      setCurrentTimeOffset(getOffset(new Date().toISOString(), firstHour));
    };
    updateCurrentTimeOffset();
    const interval = setInterval(updateCurrentTimeOffset, 60000);
    setTimeout(() => {
      const nowOffset = getOffset(new Date().toISOString(), firstHour);
      const scrollX = Math.max(0, nowOffset - SCREEN_WIDTH / 2);
      scrollRef.current?.scrollTo({ x: scrollX, animated: true });
    }, 300);
    return () => clearInterval(interval);
  }, [loading, selectedDayIdx, firstHour, lastHour]);

  const renderSchedule = () => {
    if (days.length === 0) {
      if (loading) {
        return (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        );
      }
      return (
        <View style={styles.loader}>
          <Text style={{ color: theme.colors.text }}>No schedule available</Text>
        </View>
      );
    }

    if (dayItems.length === 0) {
      return (
        <View style={[styles.loader, { marginTop: 12 }]}>
          <Text style={{ color: theme.colors.text }}>No events for this day</Text>
        </View>
      );
    }

    const hours = [];
    for (let h = firstHour; h < lastHour; h++) hours.push(`${h}:00`);

    const totalWidth = (lastHour - firstHour) * HOUR_WIDTH;

    if (loading) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    // Generate quarter-hour marks for vertical grid lines
    const totalQuarters = (lastHour - firstHour) * 4;

    return (
      <>
        <View style={styles.tabsRow}>
          {days.map((d, idx) => {
            const dateObj = new Date(d);
            const label = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() : d;
            return (
              <TouchableOpacity
                key={d}
                style={[styles.tab, idx === selectedDayIdx && styles.tabActive]}
                onPress={() => setSelectedDayIdx(idx)}
              >
                <Text style={idx === selectedDayIdx ? styles.tabTextActive : styles.tabText}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Time labels above scrollable grid */}
        <ScrollView horizontal style={{ minHeight: 36 }}>
          <View style={[styles.timeLabelsRow, { width: totalWidth }]}>
            {hours.map((h, idx) => (
              <View key={h} style={[styles.hourBlock, { width: HOUR_WIDTH }]}>
                <Text style={styles.hourLabel}>{h}</Text>
                {/* Quarter-hour ticks */}
                <View style={styles.quarterTicksContainer}>
                  {[1, 2, 3].map((q) => (
                    <View key={q} style={[styles.quarterTick, { left: q * QUARTER_WIDTH - 1 }]} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={{ flexDirection: 'row', flex: 1, alignItems: 'flex-start' }}>
          {/* Sticky Venue Column */}
          <View style={styles.venueColumn}>
            <View style={[styles.timeLabelsRow, { height: 32, justifyContent: 'center' }]}>
              {/* empty space above venue column for time labels */}
            </View>
            {venueIds.map((vid) => {
              const v = venues.find((x) => x.id === vid);
              return (
                <View key={vid} style={styles.venueRow}>
                  <Text style={styles.venueLabel}>{v?.name || vid}</Text>
                </View>
              );
            })}
          </View>

          <ScrollView horizontal style={{ flex: 1 }} ref={scrollRef}>
            <View style={{ position: 'relative' }}>
              {/* Grid lines behind events */}
              <View style={[styles.gridLinesContainer, { width: totalWidth, height: venueIds.length * 64 }]}>
                {Array.from({ length: totalQuarters + 1 }).map((_, idx) => (
                  <View key={idx} style={[styles.gridLine, { left: idx * QUARTER_WIDTH }]} />
                ))}
              </View>

              {/* Rows */}
              <View>
                {venueIds.map((vid) => (
                  <View key={vid} style={[styles.venueRow, { position: 'relative' }]}>
                    {dayItems
                      .filter((i) => i.venue === vid)
                      .map((item, iidx) => {
                        const left = getOffset(item.timestart, firstHour);
                        const right = getOffset(item.timeend, firstHour);
                        const width = right - left;
                        const venueName = venues.find(v => v.id === vid)?.name || vid;
                        return (
                          <View
                            key={iidx}
                            style={[
                              styles.eventBlock,
                              {
                                position: 'absolute',
                                left: left,
                                width: width,
                              },
                            ]}
                          >
                            <Text style={styles.eventText}>
                              {item.title}{'\n'}
                              <Text style={styles.eventTime}>{new Date(item.timestart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.timeend).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                            </Text>
                          </View>
                        );
                      })}
                  </View>
                ))}
              </View>

              {/* Current Time Line */}
              <View
                style={{
                  position: 'absolute',
                  left: currentTimeOffset,
                  top: 32,
                  bottom: 0,
                  width: 2,
                  backgroundColor: 'red',
                  zIndex: 5,
                }}
              />
            </View>
          </ScrollView>
        </View>
      </>
    );
  };

  return (
    <View style={{ flex: 1, paddingTop: 12 }}>
      {renderSchedule()}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 5,
    height: 36,
    marginBottom: 0,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginHorizontal: 4,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    height: 28,
    justifyContent: 'center',
  },
  tabActive: { backgroundColor: theme.colors.background, borderColor: theme.colors.primary, borderWidth: 1 },
  tabText: { color: '#eee', fontSize: 12 },
  tabTextActive: { color: theme.colors.primary, fontSize: 12, fontWeight: '600' },
  timeLabelsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  hourBlock: {
    height: 32,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#ccc',
    backgroundColor: theme.colors.background,
    position: 'relative',
  },
  hourLabel: { fontSize: 12, paddingLeft: 4, color: theme.colors.text },
  quarterTicksContainer: {
    position: 'absolute',
    top: 24,
    left: 0,
    right: 0,
    height: 8,
  },
  quarterTick: {
    position: 'absolute',
    width: 1,
    height: 8,
    backgroundColor: '#ccc',
  },
  venueColumn: {
    width: VENUE_COL_WIDTH,
    backgroundColor: theme.colors.background,
    borderRightWidth: 1,
    borderColor: '#ccc',
    zIndex: 10,
    paddingTop: 0,
    marginTop: 0,
  },
  venueRow: {
    height: 64,
    borderBottomWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    position: 'relative',
  },
  venueLabel: {
    fontSize: 13,
    fontWeight: '600',
    paddingLeft: 6,
    color: theme.colors.text,
  },
  eventBlock: {
    height: 64,
    backgroundColor: theme.colors.accent,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'center',
    minWidth: 40,
  },
  eventText: { color: '#fff', fontSize: 12 },
  eventTime: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.8,
  },
  gridLinesContainer: {
    position: 'absolute',
    top: 32 + 1, // below timeLabelsRow border
    flexDirection: 'row',
    zIndex: 0,
  },
  gridLine: {
    position: 'absolute',
    width: 1,
    top: 0,
    bottom: 0,
    backgroundColor: '#ddd',
  },
});