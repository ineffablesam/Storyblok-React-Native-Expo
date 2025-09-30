import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../../components/themed-text";
import { BlurView } from "expo-blur";
import Icon from "../../components/LucideIcons";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get('window');

interface Interest {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

const INTERESTS: Interest[] = [
  {
    id: "1",
    title: "Sports",
    subtitle: "Games and athletics.",
    icon: "Trophy",
    color: "#FFA500"
  },
  {
    id: "2",
    title: "Nature",
    subtitle: "Outdoors and wildlife.",
    icon: "TreePine",
    color: "#4ECDC4"
  },
  {
    id: "3",
    title: "Tech",
    subtitle: "Latest innovations.",
    icon: "Smartphone",
    color: "#FF6B6B"
  },
  {
    id: "4",
    title: "Music",
    subtitle: "Beats and melodies.",
    icon: "Music",
    color: "#FF9FF3"
  },
  {
    id: "5",
    title: "Business",
    subtitle: "All things money.",
    icon: "Briefcase",
    color: "#54A0FF"
  },
  {
    id: "6",
    title: "Health",
    subtitle: "Wellness and fitness.",
    icon: "Heart",
    color: "#96CEB4"
  },
  {
    id: "7",
    title: "Education",
    subtitle: "Learn something new.",
    icon: "Book",
    color: "#FECA57"
  },
  {
    id: "8",
    title: "Entertainment",
    subtitle: "Fun and relaxation.",
    icon: "Play",
    color: "#5F27CD"
  },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface InterestCardProps {
  item: Interest;
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}

const InterestCard: React.FC<InterestCardProps> = ({ item, isSelected, onToggle, index }) => {
  const scale = useSharedValue(1);
  const checkmarkOpacity = useSharedValue(isSelected ? 1 : 0);
  const checkmarkScale = useSharedValue(isSelected ? 1 : 0.5);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: checkmarkOpacity.value,
    transform: [{ scale: checkmarkScale.value }],
  }));

  React.useEffect(() => {
    checkmarkOpacity.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
    checkmarkScale.value = withSpring(isSelected ? 1 : 0.5, {
      damping: 20,
      stiffness: 300,
    });
  }, [isSelected]);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    onToggle();
  };

  return (
    <AnimatedTouchableOpacity
      style={[animatedStyle]}
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify().damping(20).stiffness(300)}
      >
        <BlurView
          intensity={40}
          tint="dark"
          style={[
            styles.interestCard,
            isSelected && { backgroundColor: 'rgba(255, 165, 0, 0.1)' },
            isSelected && { borderColor: 'rgba(255, 165, 0, 0.3)' }
          ]}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                <Icon name={item.icon} size={24} color={item.color} />
              </View>
              
              <View style={styles.textContent}>
                <ThemedText style={styles.interestTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.interestSubtitle}>{item.subtitle}</ThemedText>
              </View>
            </View>
            
            <Animated.View style={[styles.checkmarkContainer, checkmarkAnimatedStyle]}>
              <View style={styles.checkmark}>
                <Icon name="Check" size={16} color="#FFA500" />
              </View>
            </Animated.View>
          </View>
        </BlurView>
      </Animated.View>
    </AnimatedTouchableOpacity>
  );
};

export default function InterestsPage(): React.JSX.Element {
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(interestId)) {
        newSet.delete(interestId);
      } else {
        newSet.add(interestId);
      }
      return newSet;
    });
  };

  const handleContinue = () => {
    if (selectedInterests.size > 0) {
      console.log('Selected interests:', Array.from(selectedInterests));
      // Navigate to main app or save preferences
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <Animated.View
          entering={FadeInUp.duration(600)}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
            <Icon name="ChevronLeft" size={24} color="rgba(255, 255, 255, 0.8)" />
          </TouchableOpacity>
        </Animated.View>

        {/* Title Section */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.titleSection}
        >
          <ThemedText style={styles.title}>
            Which types of articles interest you the most?
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Select at least one category type you'd like.
          </ThemedText>
        </Animated.View>

        {/* Interests List */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {INTERESTS.map((interest, index) => (
            <InterestCard
              key={interest.id}
              item={interest}
              isSelected={selectedInterests.has(interest.id)}
              onToggle={() => toggleInterest(interest.id)}
              index={index}
            />
          ))}
        </ScrollView>

        {/* Continue Button */}
        <Animated.View
          entering={FadeInUp.delay(800).duration(600)}
          style={styles.bottomSection}
        >
          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedInterests.size === 0 && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={selectedInterests.size === 0}
            activeOpacity={0.8}
          >
            <BlurView
              intensity={selectedInterests.size > 0 ? 60 : 20}
              tint="dark"
              style={styles.continueButtonBlur}
            >
              <ThemedText style={[
                styles.continueButtonText,
                selectedInterests.size === 0 && styles.continueButtonTextDisabled
              ]}>
                Continue
              </ThemedText>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressDotActive: {
    backgroundColor: '#FFA500',
  },
  titleSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 36,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  interestCard: {
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
  interestTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  interestSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    lineHeight: 18,
  },
  checkmarkContainer: {
    marginLeft: 12,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  continueButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonBlur: {
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFA500',
  },
  continueButtonTextDisabled: {
    color: 'rgba(255, 165, 0, 0.5)',
  },
});