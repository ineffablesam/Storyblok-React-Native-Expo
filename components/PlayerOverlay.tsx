import React, { useMemo, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming, 
  runOnJS,
  withSequence
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { usePlayer } from '@/context/PlayerContext';

const { height, width } = Dimensions.get('window');

export default function PlayerOverlay() {
  const { isVisible, track, isPlaying, isLoading, toggle, hideFullPlayer, positionMs, durationMs, skipBy, rate, setRate, seekTo } = usePlayer();
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [tempSliderValue, setTempSliderValue] = useState(0);

  const translateY = useSharedValue(height);
  const modalScale = useSharedValue(1);
  const sliderThumbScale = useSharedValue(1);
  const playButtonScale = useSharedValue(1);

  // Calculate actual progress percentage
  const progressPct = useMemo(() => {
    if (!durationMs || durationMs === 0) return 0;
    if (isDraggingSlider) return tempSliderValue;
    return Math.min(1, Math.max(0, positionMs / durationMs));
  }, [positionMs, durationMs, isDraggingSlider, tempSliderValue]);

  const handleSeek = (position: number) => {
    if (durationMs && seekTo && durationMs > 0) {
      const seekTime = Math.floor(position * durationMs);
      seekTo(Math.max(0, Math.min(durationMs, seekTime)));
    }
  };

  const open = () => {
    translateY.value = height;
    modalScale.value = 0.95;
    
    translateY.value = withSpring(0, { 
      damping: 25, 
      stiffness: 300,
      mass: 0.5
    });
    modalScale.value = withSpring(1, { 
      damping: 25, 
      stiffness: 300,
      mass: 0.5
    });
  };

  const dismiss = () => {
    translateY.value = withTiming(height, { duration: 350 }, (finished) => {
      if (finished) runOnJS(hideFullPlayer)();
    });
  };

  React.useEffect(() => {
    if (isVisible) {
      open();
    }
  }, [isVisible]);

  const handleSliderPress = (evt: any) => {
    if (!durationMs || isLoading) return;
    
    const { locationX } = evt.nativeEvent;
    const containerWidth = width - 56;
    const progress = Math.max(0, Math.min(1, locationX / containerWidth));
    
    setIsDraggingSlider(true);
    setTempSliderValue(progress);
    sliderThumbScale.value = withSpring(1.4, { 
      damping: 20, 
      stiffness: 400 
    });
    handleSeek(progress);
  };

  const handleSliderMove = (evt: any) => {
    if (!durationMs || !isDraggingSlider || isLoading) return;
    
    const { locationX } = evt.nativeEvent;
    const containerWidth = width - 56;
    const progress = Math.max(0, Math.min(1, locationX / containerWidth));
    
    setTempSliderValue(progress);
    handleSeek(progress);
  };

  const handleSliderRelease = () => {
    if (!durationMs || isLoading) return;
    
    setIsDraggingSlider(false);
    sliderThumbScale.value = withSpring(1, { 
      damping: 25, 
      stiffness: 300 
    });
  };

  const handlePlayPress = () => {
    if (isLoading) return;
    
    playButtonScale.value = withSequence(
      withSpring(0.9, { damping: 15, stiffness: 400 }),
      withSpring(1, { damping: 20, stiffness: 300 })
    );
    toggle();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: modalScale.value }
    ],
  }));

  const sliderThumbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sliderThumbScale.value }],
  }));

  const playButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  if (!isVisible || !track) return null;

  // Format time for display
  const currentTime = isDraggingSlider ? (tempSliderValue * durationMs) : positionMs;

  return (
    <View style={styles.overlay}>
      <BlurView intensity={100} tint="dark" style={styles.blurContainer}>
        <Animated.View style={[styles.card, containerStyle]}>
          <LinearGradient 
            colors={["rgba(28, 28, 30, 0.98)", "rgba(0, 0, 0, 0.95)"]} 
            style={styles.cardGradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {/* Empty space for balance */}
              </View>
              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>
                  {isLoading ? "LOADING..." : "PLAYING FROM PLAYLIST"}
                </Text>
                <Text style={styles.headerSubtitle}>Recently Saved</Text>
              </View>
              <TouchableOpacity style={styles.headerBtn} onPress={dismiss}>
                <Text style={styles.headerIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Album Art */}
            <View style={styles.coverContainer}>
              <View style={[styles.coverWrap, isLoading && styles.loadingCover]}>
                {track.localImageRequire ? (
                  <Image source={track.localImageRequire} style={[styles.cover, isLoading && styles.loadingImage]} />
                ) : track.image ? (
                  <Image source={{ uri: track.image }} style={[styles.cover, isLoading && styles.loadingImage]} />
                ) : (
                  <View style={styles.placeholderCover}>
                    <View style={styles.musicNote}>
                      <View style={styles.noteHead} />
                      <View style={styles.noteStem} />
                    </View>
                  </View>
                )}
                {isLoading && (
                  <View style={styles.loadingOverlay}>
                    <View style={styles.loadingSpinner} />
                  </View>
                )}
              </View>
            </View>

            {/* Track Info */}
            <View style={styles.meta}>
              <Text style={styles.title} numberOfLines={2}>{track.title}</Text>
              {track.publisher && (
                <Text style={styles.artist}>{track.publisher}</Text>
              )}
              {isLoading && (
                <Text style={styles.loadingText}>Loading audio...</Text>
              )}
            </View>

            {/* Progress Slider */}
            <View style={[styles.progressSection, isLoading && styles.disabledSection]}>
              <View 
                style={styles.sliderContainer}
                onTouchStart={handleSliderPress}
                onTouchMove={handleSliderMove}
                onTouchEnd={handleSliderRelease}
              >
                <View style={styles.sliderTrack}>
                  <View 
                    style={[
                      styles.sliderFill, 
                      { width: `${progressPct * 100}%` }
                    ]} 
                  />
                  <Animated.View 
                    style={[
                      styles.sliderThumb, 
                      { 
                        left: `${progressPct * 100}%`,
                      },
                      sliderThumbStyle,
                      isLoading && styles.disabledThumb
                    ]} 
                  />
                </View>
              </View>
              
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>
                  {formatTime(currentTime || 0)}
                </Text>
                <Text style={styles.timeText}>
                  {formatTime(durationMs || 0)}
                </Text>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controlsRow}>
              <TouchableOpacity 
                style={[styles.controlBtn, isLoading && styles.disabledBtn]} 
                onPress={() => skipBy(-15000)}
                disabled={isLoading}
              >
                <View style={styles.skipBackIcon}>
                  <View style={styles.skipTriangle} />
                  <View style={styles.skipTriangle} />
                </View>
              </TouchableOpacity>
              
              <Animated.View style={playButtonStyle}>
                <TouchableOpacity 
                  style={[styles.playButton, isLoading && styles.loadingPlayButton]} 
                  onPress={handlePlayPress}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingDots}>
                      <View style={[styles.loadingDot, styles.dot1]} />
                      <View style={[styles.loadingDot, styles.dot2]} />
                      <View style={[styles.loadingDot, styles.dot3]} />
                    </View>
                  ) : isPlaying ? (
                    <View style={styles.pauseIcon}>
                      <View style={styles.pauseBar} />
                      <View style={styles.pauseBar} />
                    </View>
                  ) : (
                    <View style={styles.playTriangle} />
                  )}
                </TouchableOpacity>
              </Animated.View>
              
              <TouchableOpacity 
                style={[styles.controlBtn, isLoading && styles.disabledBtn]} 
                onPress={() => skipBy(30000)}
                disabled={isLoading}
              >
                <View style={styles.skipForwardIcon}>
                  <View style={styles.skipTriangle} />
                  <View style={styles.skipTriangle} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <TouchableOpacity 
                style={[styles.bottomBtn, isLoading && styles.disabledBtn]}
                disabled={isLoading}
              >
                <View style={styles.speedIcon}>
                  <View style={styles.speedLine} />
                  <View style={styles.speedLine} />
                  <View style={styles.speedLine} />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.bottomBtn, isLoading && styles.disabledBtn]} 
                onPress={() => setRate(nextRate(rate))}
                disabled={isLoading}
              >
                <Text style={styles.rateText}>{rate}x</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </BlurView>
    </View>
  );
}

function formatTime(ms: number): string {
  if (!ms || ms < 0) return '0:00';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60).toString();
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function nextRate(r: number): number {
  const options = [0.75, 1.0, 1.25, 1.5, 2.0];
  const idx = options.findIndex((x) => x === r);
  return options[(idx + 1) % options.length];
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurContainer: {
    flex: 1,
  },
  card: {
    flex: 1,
    margin: 0,
    marginTop: 60,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  cardGradient: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLeft: {
    width: 32,
    height: 32,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  coverContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginVertical: 30,
  },
  coverWrap: {
    width: width - 80,
    height: width - 80,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
    position: 'relative',
  },
  loadingCover: {
    opacity: 0.7,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  loadingImage: {
    opacity: 0.6,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicNote: {
    width: 30,
    height: 40,
    position: 'relative',
  },
  noteHead: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 20,
    height: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    transform: [{ rotate: '-15deg' }],
  },
  noteStem: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 2,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
  },
  meta: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 28,
  },
  artist: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  disabledSection: {
    opacity: 0.5,
  },
  sliderContainer: {
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  sliderTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    top: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    marginLeft: -9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledThumb: {
    opacity: 0.5,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginBottom: 15,
  },
  controlBtn: {
    padding: 15,
    marginHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.3,
  },
  skipBackIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 30,
    height: 20,
    transform: [{ rotate: '180deg' }],
  },
  skipForwardIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 30,
    height: 20,
  },
  skipTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 0,
    borderBottomWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: '#fff',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingPlayButton: {
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  playTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 0,
    borderBottomWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: '#000',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 3,
  },
  pauseIcon: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseBar: {
    width: 4,
    height: 16,
    backgroundColor: '#000',
    borderRadius: 2,
    marginHorizontal: 2,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000',
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.3,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 1,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  bottomBtn: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 18,
    justifyContent: 'space-between',
  },
  speedLine: {
    width: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
    height: 12,
  },
  rateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});