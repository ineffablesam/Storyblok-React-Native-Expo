import React, { useState, useRef } from "react";
import { KeyboardAvoidingView, StyleSheet, TouchableOpacity, View, Platform, Modal, Dimensions, TextInput, Image } from "react-native";
import { BlurView } from "expo-blur";
import Icon from "./LucideIcons";
import { ThemedText } from "./themed-text";
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayer } from '@/context/PlayerContext';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  ZoomIn,
  ZoomOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import ProfilePage from "@/app/account";
import HomePage from "@/app/home";
import AudioPage from "@/app/audio";
import BrowsePage from "@/app/browse";

interface NavItem {
  icon: string;
  label: string;
  screen: React.ComponentType<any>;
}

const NAV_ITEMS: NavItem[] = [
  { icon: "Inbox", label: "Home", screen: HomePage },
  { icon: "Headphones", label: "Audio", screen: AudioPage },
  { icon: "ChartBarBig", label: "Browse", screen: BrowsePage },
  { icon: "User", label: "You", screen: ProfilePage },
];

const { width, height } = Dimensions.get('window');

export default function GlassNavBar(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState(0);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [browseFocusSearch, setBrowseFocusSearch] = useState(false);
  const { track, isPlaying, isLoading, toggle, showFullPlayer, close } = usePlayer();

  // FAB animation values
  const fabScale = useSharedValue(1);
  const fabOpacity = useSharedValue(1);

  // Mini Player animation values
  const miniPlayerScale = useSharedValue(1);
  const miniPlayerOpacity = useSharedValue(1);
  const miniPlayerTranslateY = useSharedValue(track ? 0 : 100);
  const miniPlayerVisible = useSharedValue(track ? 1 : 0);

  // Function to navigate to Browse tab with search focus
  const navigateToBrowse = (focusSearch: boolean = false) => {
    setBrowseFocusSearch(focusSearch);
    setActiveTab(2); // Browse tab is at index 2
  };

  // Function to navigate to Audio tab
  const navigateToAudio = () => {
    setActiveTab(1); // Audio tab is at index 1
  };

  // Update mini player reveal animation when track changes
  React.useEffect(() => {
    if (track) {
      // Reveal animation
      miniPlayerTranslateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
        mass: 0.8,
      });
      miniPlayerVisible.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      });
    } else {
      // Hide animation
      miniPlayerTranslateY.value = withSpring(100, {
        damping: 25,
        stiffness: 400,
        mass: 0.6,
      });
      miniPlayerVisible.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.quad),
      });
    }
  }, [track]);

  // Reset browse focus search when tab changes
  React.useEffect(() => {
    if (activeTab !== 2) {
      setBrowseFocusSearch(false);
    }
  }, [activeTab]);

  const handleFABPress = (): void => {
    // Show dialog immediately - no delay
    setIsDialogVisible(true);
    
    // Simple, fast animation that doesn't block the dialog
    fabScale.value = withSequence(
      withTiming(0.92, { 
        duration: 80,
        easing: Easing.out(Easing.quad)
      }),
      withTiming(1, { 
        duration: 120,
        easing: Easing.out(Easing.quad)
      })
    );
  };

  const handleDialogClose = (): void => {
    setIsDialogVisible(false);
    setLinkInput('');
  };

  const handleMiniPlayerPress = (): void => {
    // Smooth scale and opacity animation
    miniPlayerScale.value = withSequence(
      withTiming(0.95, { 
        duration: 120,
        easing: Easing.out(Easing.quad)
      }),
      withSpring(1, {
        damping: 15,
        stiffness: 300,
        mass: 0.8
      })
    );

    miniPlayerOpacity.value = withSequence(
      withTiming(0.8, { 
        duration: 120,
        easing: Easing.out(Easing.quad)
      }),
      withTiming(1, { 
        duration: 200,
        easing: Easing.inOut(Easing.quad)
      })
    );

    // Call the original showFullPlayer function
    showFullPlayer();
  };

  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: fabScale.value }],
      opacity: fabOpacity.value,
    };
  });

  const miniPlayerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: miniPlayerScale.value },
        { translateY: miniPlayerTranslateY.value }
      ],
      opacity: miniPlayerOpacity.value * miniPlayerVisible.value,
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Active screen with shared axis transition */}
      <View style={styles.screenContainer}>
        <Animated.View
          key={activeTab}
          entering={FadeInRight.duration(250)}
          exiting={FadeOutLeft.duration(250)}
          style={{ flex: 1 }}
        >
          {(() => {
            const ActiveScreen = NAV_ITEMS[activeTab].screen;
            
            // Pass props based on the active screen
            if (activeTab === 0) { // Home screen
              return <ActiveScreen onNavigateToBrowse={navigateToBrowse} onNavigateToAudio={navigateToAudio} />;
            } else if (activeTab === 2) { // Browse screen
              return <ActiveScreen focusSearch={browseFocusSearch} />;
            } else {
              return <ActiveScreen />;
            }
          })()}
        </Animated.View>
      </View>

      {/* Floating Mini Player - Always render but animate visibility */}
      <Animated.View
        style={[styles.miniPlayerContainer, miniPlayerAnimatedStyle]}
        pointerEvents={track ? 'auto' : 'none'}
      >
          <BlurView intensity={40} tint="dark" style={styles.miniPlayerBlur}>
            <TouchableOpacity
              style={styles.miniPlayer}
              onPress={handleMiniPlayerPress}
              activeOpacity={0.9}
            >
              <View style={styles.miniPlayerContent}>
                <View style={styles.miniPlayerLeft}>
                  {track?.image ? (
                    <Image
                      source={{ uri: track.image }}
                      style={styles.miniPlayerImage}
                    />
                  ) : (
                    <View style={styles.miniPlayerPlaceholder}>
                      <MaterialIcons name="music-note" size={16} color="rgba(255,255,255,0.6)" />
                    </View>
                  )}
                  <View style={styles.miniPlayerInfo}>
                    <ThemedText style={styles.miniPlayerTitle} numberOfLines={1}>
                      {track?.title || ''}
                    </ThemedText>
                    <ThemedText style={styles.miniPlayerSubtitle} numberOfLines={1}>
                      {track?.publisher || track?.subtitle || 'Unknown'}
                    </ThemedText>
                  </View>
                </View>
                
                <View style={styles.miniPlayerControls}>
                  <TouchableOpacity
                    style={styles.miniPlayerButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggle();
                    }}
                    activeOpacity={0.7}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <MaterialIcons name="more-horiz" size={20} color="rgba(255,255,255,0.6)" />
                    ) : isPlaying ? (
                      <MaterialIcons name="pause" size={20} color="#fff" />
                    ) : (
                      <MaterialIcons name="play-arrow" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.miniPlayerButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      close();
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="close" size={18} color="rgba(255,255,255,0.8)" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

      {/* Floating Action Button */}
      <View style={[styles.fabWrapper, track && styles.fabWrapperWithPlayer]} pointerEvents="box-none">
        <Animated.View style={fabAnimatedStyle}>
          <BlurView intensity={50} tint="dark" style={styles.fabGlass}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Add"
              activeOpacity={0.9}
              style={styles.fabButton}
              onPress={handleFABPress}
            >
              <Icon name="Plus" size={22} color="#fff" />
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      </View>

      {/* Glass bottom nav */}
      <View style={styles.container}>
        <BlurView style={styles.blurContainer} intensity={30} tint="dark">
          <View style={styles.content}>
            {NAV_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.navItem,
                  index === activeTab && styles.activeNavItem,
                ]}
                onPress={() => setActiveTab(index)}
                activeOpacity={0.7}
              >
                <Icon
                  name={item.icon}
                  size={24}
                  color={
                    index === activeTab ? "#fff" : "rgba(255, 255, 255, 0.6)"
                  }
                />
                <ThemedText
                  style={[
                    styles.navText,
                    index === activeTab && styles.activeNavText,
                  ]}
                >
                  {item.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>
      </View>

      {/* Add Link Dialog - Instant Response */}
      <Modal
        visible={isDialogVisible}
        transparent
        animationType="fade"
        onRequestClose={handleDialogClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={handleDialogClose}
            >
              <Animated.View
                entering={ZoomIn.duration(200)}
                exiting={ZoomOut.duration(150)}
                style={styles.dialogContainer}
              >
                <BlurView
                  intensity={120}
                  tint="dark"
                  style={styles.dialogBlur}
                >
                  <View style={styles.dialogContent}>
                    <View style={styles.dialogHeader}>
                      <ThemedText style={styles.dialogTitle}>Add Link</ThemedText>
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleDialogClose}
                        activeOpacity={0.7}
                      >
                        <Icon name="X" size={20} color="rgba(255, 255, 255, 0.8)" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.dialogBody}>
                      <ThemedText style={styles.dialogSubtitle}>
                        Enter an article or podcast link
                      </ThemedText>
                      
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="https://example.com/podcast.mp3"
                          placeholderTextColor="rgba(255, 255, 255, 0.4)"
                          value={linkInput}
                          onChangeText={setLinkInput}
                          autoFocus
                          keyboardType="url"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                      
                      <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.addButton]}
                          onPress={() => {
                            if (linkInput.trim()) {
                              console.log('Adding link:', linkInput);
                              handleDialogClose();
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <BlurView intensity={30} tint="dark" style={styles.buttonBlur}>
                            <ThemedText style={styles.addButtonText}>Add</ThemedText>
                          </BlurView>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </BlurView>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  miniPlayerContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: Platform.OS === 'ios' ? 110 : 95,
    height: 64,
    zIndex: 1000,
  },
  miniPlayerBlur: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  miniPlayer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  miniPlayerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniPlayerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniPlayerImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  miniPlayerPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  miniPlayerInfo: {
    flex: 1,
    marginRight: 12,
  },
  miniPlayerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  miniPlayerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  miniPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniPlayerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  fabWrapper: {
    position: 'absolute',
    right: 28,
    bottom: Platform.OS === 'ios' ? 110 : 95,
  },
  fabWrapperWithPlayer: {
    bottom: Platform.OS === 'ios' ? 184 : 169, // Move up when mini player is visible
  },
  fabGlass: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 30 : 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  blurContainer: {
    flex: 1,
    backgroundColor: "rgba(28, 28, 30, 0.4)",
    borderRadius: 35,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    minWidth: 70,
    opacity: 0.7,
  },
  activeNavItem: {
    transform: [{ scale: 1.05 }],
    opacity: 1,
  },
  navText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 6,
    fontWeight: "500",
  },
  activeNavText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  dialogContainer: {
    width: width * 0.9,
    maxWidth: 400,
  },
  dialogBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 30, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  dialogContent: {
    padding: 28,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dialogTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dialogBody: {
    alignItems: 'center',
  },
  dialogSubtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 28,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    minHeight: 52,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 14,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    minHeight: 52,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  addButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.4)',
    backgroundColor: 'rgba(255, 165, 0, 0.05)',
  },
  buttonBlur: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  cancelButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  addButtonText: {
    fontSize: 16,
    color: '#FFA500',
    fontWeight: '600',
  },
});