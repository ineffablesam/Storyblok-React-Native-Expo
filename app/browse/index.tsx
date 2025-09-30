import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../../components/themed-text";
import { BlurView } from "expo-blur";
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from "../../components/LucideIcons";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { useStoryblokStory } from "@/src/storyblok-expo-sdk";


const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 20px padding on sides + 20px gap

const CATEGORIES = [
  {
    id: "1",
    title: "Podcasts",
    image: "https://picsum.photos/400/400?1",
    subtitle: "Latest episodes",
    color: "#FF6B6B"
  },
  {
    id: "2",
    title: "Music",
    image: "https://picsum.photos/400/400?2",
    subtitle: "Trending tracks",
    color: "#4ECDC4"
  },
  {
    id: "3",
    title: "News",
    image: "https://picsum.photos/400/400?3",
    subtitle: "Stay informed",
    color: "#45B7D1"
  },
  {
    id: "4",
    title: "Sports",
    image: "https://picsum.photos/400/400?4",
    subtitle: "Game highlights",
    color: "#96CEB4"
  },
  {
    id: "5",
    title: "Technology",
    image: "https://picsum.photos/400/400?5",
    subtitle: "Tech updates",
    color: "#FECA57"
  },
  {
    id: "6",
    title: "Lifestyle",
    image: "https://picsum.photos/400/400?6",
    subtitle: "Living better",
    color: "#FF9FF3"
  },
  {
    id: "7",
    title: "Business",
    image: "https://picsum.photos/400/400?7",
    subtitle: "Market insights",
    color: "#54A0FF"
  },
  {
    id: "8",
    title: "Health",
    image: "https://picsum.photos/400/400?8",
    subtitle: "Wellness tips",
    color: "#5F27CD"
  },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface CategoryCardProps {
  item: typeof CATEGORIES[0];
  index: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ item, index }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  return (
    <AnimatedTouchableOpacity
      style={[styles.card, animatedStyle]}
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Image source={{ uri: item.image }} style={styles.image} />

      {/* Glass overlay with gradient */}
      <View style={[styles.overlay, { backgroundColor: `${item.color}20` }]} />

      <BlurView intensity={60} tint="dark" style={styles.glassOverlay}>
        <View style={styles.cardContent}>
          <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.cardSubtitle}>{item.subtitle}</ThemedText>
        </View>

        {/* Accent line */}
        <View style={[styles.accentLine, { backgroundColor: item.color }]} />
      </BlurView>
    </AnimatedTouchableOpacity>
  );
};

export default function BrowsePage({ focusSearch = false }: { focusSearch?: boolean }): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState(CATEGORIES);
  const searchInputRef = useRef<TextInput>(null);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    if (text.trim() === "") {
      setFilteredCategories(CATEGORIES);
    } else {
      const filtered = CATEGORIES.filter(category =>
        category.title.toLowerCase().includes(text.toLowerCase()) ||
        category.subtitle.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  };

  // Focus search input when focusSearch prop is true
  React.useEffect(() => {
    if (focusSearch) {
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [focusSearch]);

  const {
    story,
    isLoading,
    error,
    isInEditor,
    renderContent
  } = useStoryblokStory('browse');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Animated header */}
        <View style={styles.headerContainer}>
          <ThemedText style={styles.header}>Browse</ThemedText>
          <ThemedText style={styles.subtitle}>
            Discover content across categories
          </ThemedText>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <BlurView intensity={30} tint="dark" style={styles.searchBlur}>
              <View style={styles.searchContent}>
                <View style={styles.searchIcon}>
                  <Icon name="Search" size={18} color="rgba(255, 255, 255, 0.6)" />
                </View>
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  placeholder="Search categories..."
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  returnKeyType="search"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                />
              </View>
            </BlurView>
          </View>
        </View>

        {renderContent()}

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerContainer: {
    marginBottom: 32,
    paddingTop: 12,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
    lineHeight: 22,
  },
  searchContainer: {
    marginBottom: 28,
  },
  searchWrapper: {
    borderRadius: 16,
  },
  searchBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    paddingVertical: 0, // Reset default padding
  },
  gridContainer: {
    paddingTop: 8,
    paddingBottom: 120, // Extra space for nav bar
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    width: cardWidth,
    height: 160,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  glassOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    fontWeight: "500",
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});