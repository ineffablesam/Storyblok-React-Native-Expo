import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { StoryblokComponentProps } from '../../src/storyblok-expo-sdk/types';
import { useStoryblok } from '../../src/storyblok-expo-sdk';

interface GridProps extends StoryblokComponentProps {
  blok: {
    categories: {
      _uid: string;
      image: string;
      route: string;
      title: string;
      subtitle?: string;
      component: string;
    }[];
  };
  onNavigateToBrowse?: (focusSearch?: boolean) => void;
  onNavigateToAudio?: () => void;
}

export default function Grid({ blok, onNavigateToBrowse }: GridProps) {
  const handleForYouSeeAll = () => {
    onNavigateToBrowse?.();
  };

  const PodcastCard = ({
    item,
  }: {
    item: GridProps['blok']['categories'][0];
  }) => (
    <TouchableOpacity style={styles.podcastCard} activeOpacity={0.8}>
      <Image
        source={{ uri: item.image.startsWith('http') ? item.image : `https:${item.image}` }}
        style={styles.podcastImage}
      />
      <View style={styles.podcastOverlay}>
        <Text style={styles.podcastTitle}>{item.title}</Text>
        {item.subtitle ? (
          <Text style={styles.podcastPublisher}>{item.subtitle}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>For you</Text>
        <TouchableOpacity onPress={handleForYouSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={blok.categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._uid}
        renderItem={({ item }) => <PodcastCard item={item} />}
        contentContainerStyle={styles.podcastList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
  },
  seeAllText: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: '500',
  },
  podcastList: {
    paddingRight: 24,
  },
  podcastCard: {
    width: 160,
    height: 160,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  podcastImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  podcastOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
  },
  podcastTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  podcastPublisher: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
