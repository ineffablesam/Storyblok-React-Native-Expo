import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';
import { useRouter } from 'expo-router';
import type { Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';



WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitializing(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        router.push('/home');
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      const redirectUrl = AuthSession.makeRedirectUri({
        preferLocalhost: true,
        isTripleSlashed: true,
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl },
      });

      if (error) {
        console.error("Google sign-in error:", error.message);
        return;
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        if (result.type === "success" && result.url) {
          console.log("Redirected back:", result.url);

          // Extract the URL fragment and set the session
          const url = new URL(result.url);
          const fragment = url.hash.substring(1); // Remove the # symbol
          const params = new URLSearchParams(fragment);

          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            // Set the session using the tokens
            const { data: { session }, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error("Session set error:", sessionError.message);
              return;
            }

            if (session) {
              console.log("Signed in:", session.user.email);
              setSession(session);
              router.push("/");
            }
          } else {
            console.error("Missing tokens in redirect URL");
          }
        } else {
          console.log("Auth flow canceled:", result.type);
        }
      }
    } catch (err: any) {
      console.error("Unexpected error:", err.message);
    } finally {
      setLoading(false);
    }
  };




  const handleGetStarted = () => {
    router.push('/home');
  };

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C42" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>📦</Text>
          </View>
          <Text style={styles.logoText}>Blipod</Text>
        </View>
      </View>

      {/* Content Cards */}
      <View style={styles.contentContainer}>
        <View style={styles.cardsContainer}>
          <View style={[styles.card, styles.trackCard]}>
            <Text style={styles.cardIcon}>🎧</Text>
            <Text style={styles.cardText}>Search, Add &{'\n'}Listen</Text>
          </View>

          <View style={[styles.card, styles.goalsCard]}>
            <LinearGradient
              colors={['#FF8C42', '#FF6B1A']}
              style={styles.gradientCard}
            >
              <Text style={styles.cardIcon}>🎯</Text>
              <Text style={styles.cardTextWhite}>Set{'\n'}Reminder</Text>
            </LinearGradient>
          </View>

          <View style={[styles.card, styles.calorieCard]}>
            <LinearGradient
              colors={['#4A4A4A', '#2A2A2A']}
              style={styles.gradientCard}
            >
              <Text style={styles.cardIcon}>🔥</Text>
              <Text style={styles.cardTextWhite}>Follow daily{'\n'} articles</Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          activeOpacity={0.8}
          disabled={loading}
        >
          <LinearGradient
            colors={['#FF8C42', '#FF6B1A']}
            style={styles.buttonGradient}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={[styles.signInButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={loading}
          activeOpacity={0.8}
        >
          <View style={styles.signInContent}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons
                  name="logo-google"
                  size={20}
                  color="#FFFFFF"
                  style={styles.googleIcon}
                />
                <Text style={styles.signInText}>Sign in with Google</Text>
              </>
            )}
          </View>
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  loadingContainer: {
    flex: 1, backgroundColor: '#000000',
    justifyContent: 'center', alignItems: 'center',
  },
  loadingText: { color: '#FFFFFF', marginTop: 16, fontSize: 16 },
  header: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingBottom: 80 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  logoIcon: {
    width: 48, height: 48, backgroundColor: '#FF8C42', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
    shadowColor: '#FF8C42', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  logoEmoji: { fontSize: 24 },
  logoText: { fontSize: 32, fontWeight: '700', color: '#FF8C42', letterSpacing: 0.5 },
  contentContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 30, marginTop: -40,
  },
  cardsContainer: { position: 'relative', width: 300, height: 280, alignItems: 'center', justifyContent: 'center' },
  card: {
    position: 'absolute', width: 170, height: 140, borderRadius: 24, padding: 24,
    justifyContent: 'space-between', shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2,
    shadowRadius: 16, elevation: 8,
  },
  trackCard: { backgroundColor: '#FFFFFF', top: -10, left: -40, transform: [{ rotate: '-12deg' }], zIndex: 3 },
  goalsCard: { top: 0, right: -30, transform: [{ rotate: '8deg' }], zIndex: 2 },
  calorieCard: { bottom: 20, left: 10, transform: [{ rotate: '-5deg' }], zIndex: 1 },
  gradientCard: { borderRadius: 24, padding: 24, justifyContent: 'space-between', height: '100%' },
  cardIcon: { fontSize: 36, alignSelf: 'flex-start' },
  cardText: { fontSize: 17, fontWeight: '700', color: '#000000', lineHeight: 22 },
  cardTextWhite: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', lineHeight: 22 },
  bottomContainer: { paddingHorizontal: 28, paddingBottom: 60, gap: 18, marginTop: 20 },
  getStartedButton: {
    borderRadius: 28, overflow: 'hidden',
    shadowColor: '#FF8C42', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  buttonGradient: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center' },
  getStartedText: { color: '#FFFFFF', fontSize: 19, fontWeight: '700', letterSpacing: 0.3 },
  signInButton: {
    backgroundColor: '#333333', borderRadius: 28, paddingVertical: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonDisabled: { opacity: 0.6 },
  signInContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  googleIcon: { marginRight: 10 },
  signInText: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
});

export default Login;
