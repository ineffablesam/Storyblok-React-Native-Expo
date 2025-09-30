import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Animated,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import GlassNavBar from '../../components/GlassNavBar';
import { supabase } from '../../supabase';
import type { User } from '@supabase/supabase-js';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');
const STREAK_DAYS = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'];

export default function ProfilePage() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Fixed function to get supabase user data
  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Method 1: Get user from session (recommended)
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error.message);
        return;
      }

      if (session?.user) {
        setUserData(session.user);
        console.log('User data loaded:', session.user);
      } else {
        console.log('No user session found');
      }

      // Alternative Method 2: Get user directly
      // const { data: { user }, error: userError } = await supabase.auth.getUser();
      // if (userError) {
      //   console.error('Error getting user:', userError.message);
      //   return;
      // }
      // if (user) {
      //   setUserData(user);
      // }

    } catch (err) {
      console.error('Unexpected error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUserData(session.user);
        } else {
          setUserData(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const LogoutSection = () => {
    const handleLogout = async () => {
      Alert.alert(
        "Logout",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            style: "destructive",
            onPress: async () => {
              try {
                const { error } = await supabase.auth.signOut();
                if (error) {
                  console.error("Logout error:", error.message);
                } else {
                  console.log("User logged out successfully");
                  setUserData(null);
                }
              } catch (err) {
                console.error("Unexpected logout error:", err);
              }
            }
          }
        ]
      );
    };

    return (
      <Animated.View
        style={[
          styles.menuContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <BlurView style={styles.menuBlur} intensity={20} tint="dark">
          <TouchableOpacity style={styles.menuContent} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconContainer}>
                <MaterialIcons name="logout" size={20} color="#FF4C4C" />
              </View>
              <ThemedText style={styles.menuText}>Logout</ThemedText>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color="rgba(255, 255, 255, 0.6)"
            />
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    );
  };


  const ProfileIcon = () => (
    <Animated.View
      style={[
        styles.profileIconContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.profileIcon}>
        {userData?.user_metadata?.picture || userData?.user_metadata?.avatar_url ? (
          <Image
            source={{
              uri: userData.user_metadata.picture || userData.user_metadata.avatar_url
            }}
            style={styles.logoImage}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        )}
      </View>
    </Animated.View>
  );

  const StreakWidget = () => (
    <Animated.View
      style={[
        styles.streakContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <BlurView style={styles.streakBlur} intensity={30} tint="dark">
        <ThemedView style={styles.streakContent}>
          <View style={styles.streakHeader}>
            <ThemedText style={styles.streakEmoji}>🔥</ThemedText>
            <ThemedText style={styles.streakText}>
              {userData?.email || 'Loading...'}
            </ThemedText>
            <ThemedText style={styles.streakEmoji}>🔥</ThemedText>
          </View>

          <View style={styles.daysContainer}>
            {STREAK_DAYS.map((day, index) => (
              <View key={day} style={styles.dayItem}>
                <ThemedText style={styles.dayLabel}>{day}</ThemedText>
                <View style={[
                  styles.dayCircle,
                  index === 3 && styles.activeDayCircle
                ]}>
                  {index === 3 && (
                    <ThemedText style={styles.dayEmoji}>🔥</ThemedText>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ThemedView>
      </BlurView>
    </Animated.View>
  );

  const ShareSection = () => (
    <Animated.View
      style={[
        styles.menuContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <BlurView style={styles.menuBlur} intensity={20} tint="dark">
        <TouchableOpacity style={styles.menuContent}>
          <View style={styles.menuLeft}>
            <View style={styles.menuIconContainer}>
              <MaterialIcons name="share" size={20} color="#FFA500" />
            </View>
            <ThemedText style={styles.menuText}>Share</ThemedText>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="rgba(255, 255, 255, 0.6)" />
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );

  const ArchiveSection = () => (
    <Animated.View
      style={[
        styles.menuContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <BlurView style={styles.menuBlur} intensity={20} tint="dark">
        <TouchableOpacity style={styles.menuContent}>
          <View style={styles.menuLeft}>
            <View style={styles.menuIconContainer}>
              <MaterialIcons name="archive" size={20} color="#FFA500" />
            </View>
            <ThemedText style={styles.menuText}>Archive</ThemedText>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="rgba(255, 255, 255, 0.6)" />
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );

  const MoreSection = () => (
    <Animated.View
      style={[
        styles.menuContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <BlurView style={styles.menuBlur} intensity={20} tint="dark">
        <TouchableOpacity style={styles.menuContent}>
          <View style={styles.menuLeft}>
            <View style={styles.menuIconContainer}>
              <MaterialIcons name="more-horiz" size={20} color="#FFA500" />
            </View>
            <ThemedText style={styles.menuText}>More</ThemedText>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="rgba(255, 255, 255, 0.6)" />
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainContent}>
            <ProfileIcon />

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <ThemedText style={styles.profileName}>
                {userData?.user_metadata?.full_name ||
                  userData?.user_metadata?.name ||
                  "User's Blipod"}
              </ThemedText>
            </Animated.View>

            <StreakWidget />

            <View style={styles.menuSectionsContainer}>
              <ShareSection />
              <ArchiveSection />
              <MoreSection />
              <LogoutSection />
            </View>

            {/* Debug info (remove in production) */}
            {/* {__DEV__ && userData && (
              <View style={styles.debugContainer}>
                <ThemedText style={styles.debugText}>
                  Debug: {JSON.stringify({
                    email: userData.email,
                    name: userData.user_metadata?.full_name,
                    picture: userData.user_metadata?.picture
                  }, null, 2)}
                </ThemedText>
              </View>
            )} */}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* <GlassNavBar activeTab={activeTab} onTabPress={onNavigate} /> */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileIconContainer: {
    marginTop: 60,
    marginBottom: 40,
  },
  profileIcon: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 27,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 60,
    textAlign: 'center',
  },
  streakContainer: {
    width: width - 40,
    marginBottom: 30,
  },
  streakBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  streakContent: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 12,
  },
  streakEmoji: {
    fontSize: 20,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  dayItem: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
    fontWeight: '500',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDayCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dayEmoji: {
    fontSize: 16,
  },
  menuSectionsContainer: {
    width: '100%',
    gap: 12,
  },
  menuContainer: {
    width: '100%',
  },
  menuBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 30, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.2)',
  },
  menuText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
  debugContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    width: '100%',
  },
  debugText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'monospace',
  },
});