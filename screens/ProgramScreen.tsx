import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Image } from 'react-native';
import { theme } from '../theme';
import ScheduleView from '../components/ScheduleView';

export default function ProgramScreen() {
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
          <View style={styles.header}>
            <Image
              source={require('../assets/HiveFest10.png')}
              style={{ width: 194, height: 30, resizeMode: 'contain' }}
            />
          </View>
          <View style={styles.content}>
            <ScheduleView />
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
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 0,
    paddingBottom: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});