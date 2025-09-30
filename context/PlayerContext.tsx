import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import type { AVPlaybackStatus } from 'expo-av';

export type PlayerTrack = {
  id?: string;
  title: string;
  subtitle?: string;
  image?: string; // remote URL
  localImageRequire?: any; // for require('...') if needed
  publisher?: string;
  url: string; // remote mp3/stream
};

type PlayerContextValue = {
  isVisible: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  positionMs: number;
  durationMs: number;
  rate: number;
  track?: PlayerTrack;
  open: (track: PlayerTrack) => Promise<void>;
  close: () => Promise<void>;
  toggle: () => Promise<void>;
  seekTo: (ms: number) => Promise<void>;
  skipBy: (deltaMs: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  showFullPlayer: () => void;
  hideFullPlayer: () => void;
};

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export const usePlayer = (): PlayerContextValue => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isVisible, setIsVisible] = useState(false); // Full player overlay visibility
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [rate, setPlaybackRate] = useState(1.0);
  const [track, setTrack] = useState<PlayerTrack | undefined>(undefined);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  const unload = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (error) {
        console.log('Error unloading sound:', error);
      }
      soundRef.current.setOnPlaybackStatusUpdate(null);
      soundRef.current = null;
    }
  }, []);

  const open = useCallback(async (next: PlayerTrack) => {
    try {
      // Immediately update UI state for instant feedback
      setTrack(next);
      setIsLoading(true);
      setIsPlaying(false);
      setPositionMs(0);
      setDurationMs(0);
      
      // Stop and unload any existing audio in background
      await unload();
      
      // Create and load new track with optimized settings
      const { sound } = await Audio.Sound.createAsync(
        { uri: next.url },
        { 
          shouldPlay: true, 
          rate,
          progressUpdateIntervalMillis: 500, // Update every 500ms instead of default
          positionMillis: 0,
        },
        (status: AVPlaybackStatus) => {
          if (!status.isLoaded) {
            if (status.error) {
              console.error('Audio loading error:', status.error);
              setIsLoading(false);
            }
            return;
          }
          
          // Update states as audio loads and plays
          setIsLoading(false);
          setIsPlaying(status.isPlaying ?? false);
          setPositionMs(status.positionMillis ?? 0);
          setDurationMs(status.durationMillis ?? 0);
        }
      );
      
      soundRef.current = sound;
      
      // Start playback immediately after creation
      try {
        await sound.playAsync();
        setIsPlaying(true);
        setIsLoading(false);
      } catch (playError) {
        console.error('Error starting playback:', playError);
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Error loading track:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [rate, unload]);

  const close = useCallback(async () => {
    try {
      // Stop and unload audio
      await unload();
      
      // Clear all state
      setTrack(undefined);
      setIsVisible(false);
      setIsPlaying(false);
      setIsLoading(false);
      setPositionMs(0);
      setDurationMs(0);
    } catch (error) {
      console.error('Error closing player:', error);
    }
  }, [unload]);

  const toggle = useCallback(async () => {
    try {
      const sound = soundRef.current;
      if (!sound) return;
      
      // Optimistic UI update for instant feedback
      const currentlyPlaying = isPlaying;
      setIsPlaying(!currentlyPlaying);
      
      const status = await sound.getStatusAsync();
      if (!('isLoaded' in status) || !status.isLoaded) {
        // Revert optimistic update if sound isn't loaded
        setIsPlaying(currentlyPlaying);
        return;
      }

      if (status.isPlaying) {
        await sound.pauseAsync();
        // State already updated optimistically
      } else {
        await sound.playAsync();
        // State already updated optimistically
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      // Revert optimistic update on error
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const seekTo = useCallback(async (ms: number) => {
    try {
      const sound = soundRef.current;
      if (!sound) return;
      
      // Optimistic UI update
      setPositionMs(Math.max(0, ms));
      
      await sound.setPositionAsync(Math.max(0, ms));
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, []);

  const skipBy = useCallback(async (deltaMs: number) => {
    const target = positionMs + deltaMs;
    await seekTo(target);
  }, [positionMs, seekTo]);

  const setRate = useCallback(async (r: number) => {
    try {
      const sound = soundRef.current;
      setPlaybackRate(r);
      if (sound) {
        await sound.setRateAsync(r, true);
      }
    } catch (error) {
      console.error('Error setting rate:', error);
    }
  }, []);

  const showFullPlayer = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideFullPlayer = useCallback(() => {
    setIsVisible(false);
  }, []);

  const value = useMemo(
    () => ({ 
      isVisible, 
      isPlaying, 
      isLoading,
      positionMs, 
      durationMs, 
      rate, 
      track, 
      open, 
      close, 
      toggle, 
      seekTo, 
      skipBy, 
      setRate,
      showFullPlayer,
      hideFullPlayer
    }),
    [isVisible, isPlaying, isLoading, positionMs, durationMs, rate, track, open, close, toggle, seekTo, skipBy, setRate, showFullPlayer, hideFullPlayer]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};