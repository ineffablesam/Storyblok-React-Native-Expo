// components/GoogleSignIn.js
import React, { useState } from 'react'
import { Alert, StyleSheet, View, TouchableOpacity, Text, ActivityIndicator } from 'react-native'
import { supabase } from '../lib/supabase'
import { makeRedirectUri, startAsync } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession() // required for web auth sessions

const GoogleSignIn = () => {
    const [loading, setLoading] = useState(false)

    const redirectTo = makeRedirectUri({
        scheme: 'aiapp', // must match your app.json scheme
        useProxy: true,  // Expo Go support
    })

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true)

            // Ask Supabase for OAuth URL
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo },
            })

            if (error) throw error
            if (!data?.url) throw new Error('No auth URL returned')

            // Open system browser
            const res = await startAsync({ authUrl: data.url })

            if (res.type === 'success') {
                Alert.alert('✅ Login success! Session will refresh automatically.')
            } else {
                Alert.alert('❌ Login canceled')
            }
        } catch (err) {
            Alert.alert('Error', err.message)
            console.error('Google login error:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={handleGoogleSignIn}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Sign in with Google</Text>
                )}
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#4285F4',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
})

export default GoogleSignIn
