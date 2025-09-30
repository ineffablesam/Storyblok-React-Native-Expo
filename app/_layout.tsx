import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { View, StyleSheet } from 'react-native';
import { PlayerProvider } from '@/context/PlayerContext';
import PlayerOverlay from '@/components/PlayerOverlay';
import { StoryblokProvider, storyblokInit } from '../src/storyblok-expo-sdk';
import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();
import Page from '@/components/storyblok/Page';
import Feature from '@/components/storyblok/Feature';
import Grid from '@/components/storyblok/Grid';
import Teaser from '@/components/storyblok/Teaser';
import Debug from '@/components/storyblok/Debug';
import Hero from '@/components/storyblok/Hero';
import Browsecat from '@/components/storyblok/Browsecat';


export const getStoryblokApi = storyblokInit({
  config: {
    token: 'zKrvuq0FVrrU7Zv5zvjycgtt',
    version: 'draft',
    region: 'eu',
    debug: true
  },
  components: {
    page: Page,
    recently_saved: Feature,
    grid: Grid,
    teaser: Teaser,
    Debug: Debug,
    hero: Hero,
    all_categories: Browsecat,
  }
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StoryblokProvider
          config={{
            token: 'zKrvuq0FVrrU7Zv5zvjycgtt',
            version: 'draft',
            region: 'eu',
            debug: false
          }}
          storySlug="home"
          router={router}
          components={getStoryblokApi.getComponents()}
        >
          {/* This ensures background is black and fills screen */}
          <View style={styles.container}>
            <PlayerProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                <Stack.Screen name="account" />
                <Stack.Screen name="audio" />
                <Stack.Screen name="interests" />
              </Stack>
              <PlayerOverlay />
            </PlayerProvider>
            <StatusBar style="light" />
          </View>
        </StoryblokProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});