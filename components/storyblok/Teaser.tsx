import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StoryblokComponentProps } from '../../src/storyblok-expo-sdk/types';

interface TeaserProps extends StoryblokComponentProps {
  blok: {
    headline: string;
    [key: string]: any;
  };
}

export default function Teaser({ blok }: TeaserProps) {
  return (
    <View style={styles.teaser}>
      <Text style={styles.headline}>{blok.headline}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  teaser: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    margin: 10,
    borderRadius: 8,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});