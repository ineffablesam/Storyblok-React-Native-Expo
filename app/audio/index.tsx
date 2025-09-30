import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../../components/themed-text";
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useStoryblokStory } from "@/src/storyblok-expo-sdk";

// Create animated component properly
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface AlbumItem {
  id: string;
  title: string;
  year: string;
  image: string;
}

interface SingleItem {
  id: string;
  title: string;
  year: string;
  status: string;
  image: string;
}

const ALBUMS: AlbumItem[] = [
  {
    id: "1",
    title: "Paint It",
    year: "2021",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Inside Out",
    year: "2018",
    image: "https://images.unsplash.com/photo-1571974599782-87624638275c?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Animals",
    year: "2017",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1000&auto=format&fit=crop",
  },
];

const POPULAR_SINGLES: SingleItem[] = [
  {
    id: "1",
    title: "King Of Screens",
    year: "2025",
    status: "Easy living",
    image: "https://images.unsplash.com/photo-1501389040983-5c22cb186487?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "2",
    title: "5 Seconds Beforez",
    year: "2024",
    status: "Trending",
    image: "https://images.unsplash.com/photo-1658227665335-9cc3da774f99?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "3",
    title: "The less i know",
    year: "2024",
    status: "Trending",
    image: "https://images.unsplash.com/photo-1631061288884-43020c2229e7?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "4",
    title: "No time to die",
    year: "2023",
    status: "Trending",
    image: "https://plus.unsplash.com/premium_photo-1681503973674-ca910d68dbff?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "5",
    title: "Rolling in the deep",
    year: "2023",
    status: "Trending",
    image: "https://images.unsplash.com/photo-1700720711254-602cb6b8468d?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

// Album Card
const AlbumCard: React.FC<{ item: AlbumItem; index: number }> = ({ item }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchableOpacity
      style={[styles.albumCard, animatedStyle]}
      activeOpacity={1}
      onPressIn={() => (scale.value = withSpring(0.95))}
      onPressOut={() => (scale.value = withSpring(1))}
    >
      <Image source={{ uri: item.image }} style={styles.albumImage} />
      <View style={styles.albumInfo}>
        <ThemedText style={styles.albumTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.albumYear}>{item.year}</ThemedText>
      </View>
    </AnimatedTouchableOpacity>
  );
};

// Single Row
const SingleRow: React.FC<{ item: SingleItem; index: number }> = ({ item }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchableOpacity
      style={[styles.singleItem, animatedStyle]}
      activeOpacity={1}
      onPressIn={() => (scale.value = withSpring(0.98))}
      onPressOut={() => (scale.value = withSpring(1))}
    >
      <Image source={{ uri: item.image }} style={styles.singleImage} />
      <View style={styles.singleContent}>
        <ThemedText style={styles.singleTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.singleMeta}>
          {item.year} • {item.status}
        </ThemedText>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <MaterialIcons name="more-vert" size={20} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    </AnimatedTouchableOpacity>
  );
};

// Main Page
export default function AudioPage(): React.JSX.Element {
  const {
    story,
    isLoading,
    error,
    isInEditor,
    renderContent
  } = useStoryblokStory('audio');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section (no animation for bg image, but text + play button animate) */}
          <View style={styles.heroSection}>
            {renderContent()}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)", "#000"]}
              style={styles.heroGradient}
            />
            <View style={styles.heroContent}>
              {/* Animate Audio text */}
              <Animated.View
                entering={FadeInUp.delay(150).springify().damping(20).stiffness(300)}
              >
                <ThemedText style={styles.artistName}>Audio</ThemedText>
              </Animated.View>

              {/* Animate Play Button */}
              <Animated.View
                entering={FadeInUp.delay(300).springify().damping(20).stiffness(300)}
              >
                <TouchableOpacity
                  style={styles.playButton}
                  activeOpacity={0.8}
                  onPress={() => console.log("Play pressed")}
                >
                  <MaterialIcons name="play-arrow" size={28} color="#000" />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {/* Popular Singles Section */}
          <Animated.View
            style={styles.section}
            entering={FadeInUp.delay(700).springify().damping(20).stiffness(300)}
          >
            <View style={styles.singlesList}>
              {POPULAR_SINGLES.map((single, index) => (
                <Animated.View
                  key={single.id}
                  entering={FadeInUp.delay(800 + index * 100)
                    .springify()
                    .damping(20)
                    .stiffness(300)}
                >
                  <SingleRow item={single} index={index} />
                </Animated.View>
              ))}
            </View>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  safeArea: { flex: 1, backgroundColor: "#000" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  heroSection: {
    height: 400,
    position: "relative",
    justifyContent: "flex-end",
    overflow: "hidden",
    marginTop: -50,
  },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    padding: 24,
    paddingBottom: 40,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  artistName: {
    fontSize: 48,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -1,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    flex: 1,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFA500",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FFA500",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center" },
  sectionIcon: { marginRight: 8 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  viewAllText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  albumsList: { paddingRight: 24 },
  albumCard: { width: 140, marginRight: 16 },
  albumImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  albumInfo: { marginTop: 12 },
  albumTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  albumYear: { fontSize: 14, color: "rgba(255,255,255,0.6)", fontWeight: "500" },
  singlesList: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  singleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  singleImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginRight: 12,
  },
  singleContent: { flex: 1 },
  singleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  singleMeta: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  moreButton: { padding: 8 },
});
