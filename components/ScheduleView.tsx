import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { theme } from "../theme";
import { getSchedule } from "../data/getSchedule";
import { getVenues } from "../data/getVenues";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const QUARTER_WIDTH = 80;
const HOUR_WIDTH = QUARTER_WIDTH * 4;
const VENUE_COL_WIDTH = 120;
const SCREEN_WIDTH = Dimensions.get("window").width;
const ROW_HEIGHT = 80;

const getOffset = (timeStr: string, firstHour: number) => {
  // First try parsing as-is
  let dt = new Date(timeStr);

  // If that fails and it looks like MM/DD/YYYY format, try explicit parsing
  if (isNaN(dt.getTime()) && timeStr.includes('/')) {
    // Handle MM/DD/YYYY HH:mm:ss format explicitly
    const parts = timeStr.split(' ');
    if (parts.length === 2) {
      const [datePart, timePart] = parts;
      const [month, day, year] = datePart.split('/');
      const [hours, minutes, seconds] = timePart.split(':');
      dt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
    }
  }

  if (isNaN(dt.getTime())) {
    console.warn('Failed to parse time in getOffset:', timeStr);
    return 0; // Return 0 if parsing fails
  }

  const minutes = dt.getHours() * 60 + dt.getMinutes();
  return ((minutes - firstHour * 60) / 15) * QUARTER_WIDTH;
};

const formatEventTime = (timeStr: string) => {
  try {
    // First try parsing as-is
    let dt = new Date(timeStr);

    // If that fails and it looks like MM/DD/YYYY format, try explicit parsing
    if (isNaN(dt.getTime()) && timeStr.includes('/')) {
      // Handle MM/DD/YYYY HH:mm:ss format explicitly
      const parts = timeStr.split(' ');
      if (parts.length === 2) {
        const [datePart, timePart] = parts;
        const [month, day, year] = datePart.split('/');
        const [hours, minutes, seconds] = timePart.split(':');
        dt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
      }
    }

    if (isNaN(dt.getTime())) {
      console.warn('Failed to parse time:', timeStr);
      return timeStr; // Return original if still invalid
    }

    const hours = dt.getHours().toString().padStart(2, "0");
    const minutes = dt.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch (error) {
    console.warn('Error parsing time:', timeStr, error);
    return timeStr;
  }
};

export default function ScheduleView() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const headerScrollRef = useRef<ScrollView>(null);
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

  const days = Array.from(new Set(schedule.map((item) => item.dategroupby)))
    .filter((d) => !isNaN(new Date(d).getTime()))
    .sort();

  // Auto-scroll to current time and update currentTimeOffset periodically
  const activeDay = days[selectedDayIdx];
  const dayItems = schedule.filter((item) => item.dategroupby === activeDay);
  const venueIds = Array.from(new Set(dayItems.map((i) => i.venue)));
  const firstHour = 7;
  const lastHour = 24;

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
          <Text style={{ color: theme.colors.text }}>
            No schedule available
          </Text>
        </View>
      );
    }

    if (dayItems.length === 0) {
      return (
        <View style={[styles.loader, { marginTop: 12 }]}>
          <Text style={{ color: theme.colors.text }}>
            No events for this day
          </Text>
        </View>
      );
    }

    const hours = [];
    for (let h = firstHour; h <= lastHour; h++) {
      hours.push(h);
    }

    const totalWidth = (lastHour - firstHour) * HOUR_WIDTH;
    const totalQuarters = (lastHour - firstHour) * 4;

    if (loading) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    return (
      <>
        {/* Integrated Day Tabs */}
        <View style={styles.tabsRow}>
          {days.map((d, idx) => {
            const dateObj = new Date(d);
            const label = !isNaN(dateObj.getTime())
              ? dateObj
                  .toLocaleDateString("en-US", { weekday: "short" })
                  .toUpperCase()
              : d;
            return (
              <TouchableOpacity
                key={d}
                style={[styles.tab, idx === selectedDayIdx && styles.tabActive]}
                onPress={() => setSelectedDayIdx(idx)}
              >
                <Text
                  style={[
                    styles.tabText,
                    idx === selectedDayIdx && styles.tabTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Schedule Grid Container */}
        <View style={styles.scheduleContainer}>
          {/* Time Header Row */}
          <View style={styles.timeHeaderContainer}>
            <View
              style={[styles.venueColumnHeader, { width: VENUE_COL_WIDTH }]}
            />
            <ScrollView
              horizontal
              style={styles.timeHeaderScroll}
              ref={headerScrollRef}
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
            >
              <View style={[styles.timeHeaderRow, { width: totalWidth }]}>
                {hours.map((hour, idx) => (
                  <View
                    key={hour}
                    style={[styles.hourHeader, { width: HOUR_WIDTH }]}
                  >
                    <Text style={styles.hourHeaderText}>
                      {hour.toString().padStart(2, "0")}:00
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Main Schedule Content */}
          <View style={styles.scheduleContent}>
            {/* Fixed Venue Column */}
            <View style={[styles.venueColumn, { width: VENUE_COL_WIDTH }]}>
              {venueIds.map((vid) => {
                const v = venues.find((x) => x.id === vid);
                return (
                  <View
                    key={vid}
                    style={[styles.venueRow, { height: ROW_HEIGHT }]}
                  >
                    <Text style={styles.venueLabel} numberOfLines={2}>
                      {v?.name || vid}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Scrollable Schedule Grid */}
            <ScrollView
              horizontal
              style={styles.scheduleScroll}
              ref={scrollRef}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ width: totalWidth }}
              onScroll={(event) => {
                const { x } = event.nativeEvent.contentOffset;
                headerScrollRef.current?.scrollTo({ x, animated: false });
              }}
              scrollEventThrottle={16}
            >
              <View style={[styles.scheduleGrid, { width: totalWidth }]}>
                {/* Background Grid Lines */}
                <View
                  style={[
                    styles.gridBackground,
                    { width: totalWidth, height: venueIds.length * ROW_HEIGHT },
                  ]}
                >
                  {/* Vertical lines for 15-minute intervals and hours */}
                  {Array.from({ length: totalQuarters + 1 }).map((_, idx) => {
                    const isHourLine = idx % 4 === 0;
                    const isHalfHourLine = idx % 2 === 0 && !isHourLine;
                    const isQuarterLine = idx % 1 === 0 && !isHalfHourLine && !isHourLine;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.gridLineVertical,
                          { left: idx * QUARTER_WIDTH },
                          isHourLine && styles.gridLineHour,
                          isHalfHourLine && styles.gridLineHalfHour,
                          isQuarterLine && styles.gridLineQuarter,
                        ]}
                      />
                    );
                  })}

                  {/* Horizontal lines for venue rows */}
                  {venueIds.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.gridLineHorizontal,
                        { top: (idx + 1) * ROW_HEIGHT },
                      ]}
                    />
                  ))}
                </View>

                {/* Event Blocks */}
                {venueIds.map((vid, venueIdx) => (
                  <View
                    key={vid}
                    style={[
                      styles.venueRowEvents,
                      {
                        top: venueIdx * ROW_HEIGHT,
                        height: ROW_HEIGHT,
                      },
                    ]}
                  >
                    {dayItems
                      .filter((i) => i.venue === vid)
                      .map((item, iidx) => {
                        const left = getOffset(item.timestart, firstHour);
                        const right = getOffset(item.timeend, firstHour);
                        const width = Math.max(right - left, 60); // Minimum width for readability

                        return (
                          <View
                            key={iidx}
                            style={[
                              styles.eventBlock,
                              {
                                position: "absolute",
                                left: left,
                                width: width,
                                height: ROW_HEIGHT - 8,
                                top: 4,
                              },
                            ]}
                          >
                            <Text style={styles.eventTitle} numberOfLines={2}>
                              {item.title}
                            </Text>
                            <Text style={styles.eventTime}>
                              {formatEventTime(item.timestart)} -{" "}
                              {formatEventTime(item.timeend)}
                            </Text>
                          </View>
                        );
                      })}
                  </View>
                ))}

                {/* Current Time Line */}
                <View
                  style={[
                    styles.currentTimeLine,
                    {
                      left: currentTimeOffset,
                      height: venueIds.length * ROW_HEIGHT,
                    },
                  ]}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </>
    );
  };

  return <View style={styles.container}>{renderSchedule()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Tab Styles - Integrated with header
  tabsRow: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    marginTop: 0,
    marginBottom: 0,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: "transparent",
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    minWidth: 60,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: -1, // Overlap to remove gap
  },
  tabText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  // Schedule Container
  scheduleContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginTop: -1, // Remove any gap
  },

  // Time Header
  timeHeaderContainer: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
    zIndex: 10,
    elevation: 3,
  },
  venueColumnHeader: {
    height: 50,
    backgroundColor: theme.colors.background,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  timeHeaderScroll: {
    flex: 1,
  },
  timeHeaderRow: {
    flexDirection: "row",
    height: 50,
  },
  hourHeader: {
    height: 50,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 8,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    backgroundColor: theme.colors.background,
  },
  hourHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },

  // Main Schedule Content
  scheduleContent: {
    flex: 1,
    flexDirection: "row",
  },

  // Venue Column
  venueColumn: {
    backgroundColor: theme.colors.background,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  venueRow: {
    justifyContent: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  venueLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "left",
  },

  // Schedule Scroll Area
  scheduleScroll: {
    flex: 1,
  },
  scheduleGrid: {
    position: "relative",
  },

  // Grid Background
  gridBackground: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  gridLineVertical: {
    position: "absolute",
    width: 1,
    height: "100%",
    backgroundColor: "#eee",
  },
  gridLineHour: {
    backgroundColor: theme.colors.primary,
    width: 2,
    opacity: 0.3,
  },
  gridLineHalfHour: {
    backgroundColor: "#ccc",
    width: 1,
    opacity: 0.5,
  },
  gridLineQuarter: {
    backgroundColor: "#ccc",
    width: 1,
    opacity: 0.5,
  },
  gridLineHorizontal: {
    position: "absolute",
    width: "100%",
    height: 1,
    backgroundColor: "#eee",
    left: 0,
  },

  // Event Rows and Blocks
  venueRowEvents: {
    position: "absolute",
    width: "100%",
  },
  eventBlock: {
    backgroundColor: theme.colors.accent,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  eventTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 10,
    color: "#fff",
    opacity: 0.9,
  },

  // Current Time Line
  currentTimeLine: {
    position: "absolute",
    width: 2,
    backgroundColor: "red",
    top: 0,
    zIndex: 5,
  },
});