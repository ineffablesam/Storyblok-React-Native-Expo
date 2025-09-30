import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StoryblokComponentProps } from '../../src/storyblok-expo-sdk/types';

interface DebugProps extends StoryblokComponentProps {
  blok: {
    title: string;
    description: string;
    [key: string]: any;
  };
}

export default function Debug({ blok }: DebugProps) {
  return (
    <View style={styles.debug}>
      <Text style={styles.title}>{blok.title}</Text>
      <Text style={styles.description}>{blok.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  debug: {
    backgroundColor: '#fff3cd',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#856404',
  },
  description: {
    color: '#856404',
  },
});