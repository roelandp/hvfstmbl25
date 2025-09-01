import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import Tabs from './navigation/Tabs';
import { LocationProvider } from './contexts/LocationContext';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts or other assets
        await Font.loadAsync({
          Garamond: require('./assets/fonts/EBGaramond.otf'),
          NotoSans: require('./assets/fonts/NotoSans-Regular.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // 👈 prevent rendering until ready
  }

  return (
    <LocationProvider>
      <NavigationContainer onReady={onLayoutRootView}>
        <Tabs />
      </NavigationContainer>
    </LocationProvider>
  );
}