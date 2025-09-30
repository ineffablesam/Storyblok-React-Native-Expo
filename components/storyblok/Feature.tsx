import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { StoryblokComponentProps } from '../../src/storyblok-expo-sdk/types';
import { usePlayer } from '@/context/PlayerContext';
interface FeatureProps extends StoryblokComponentProps {
  blok: {
    title?: string;
    sub_title?: string;
    color?: {
      color: string;
    };
  };
  onNavigateToAudio?: () => void;
}

interface Episode {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  duration: string;
  thumbnail: string;
}

const episodes: Episode[] = [
  {
    id: '1',
    title: 'Cricket T20 World Cup',
    subtitle: 'sports.bbc.com',
    date: 'Thursday 18 Sep, 2025',
    duration: '20 min',
    thumbnail: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2010&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '2',
    title: 'Meta AR Glasses',
    subtitle: 'tech.crunch.com',
    date: 'Wednesday 17 Sep, 2025',
    duration: '25 min',
    thumbnail: 'https://images.unsplash.com/photo-1665799871677-f1fd17338b43?q=80&w=1628&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '3',
    title: 'San Francisco Evenings',
    subtitle: 'travel.org',
    date: 'Tuesday 16 Sep, 2025',
    duration: '14 min',
    thumbnail: 'https://plus.unsplash.com/premium_photo-1673266630624-4cbef6d25ff4?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '4',
    title: 'The Amazon Rainforest',
    subtitle: 'natgeo.org',
    date: 'Tuesday 15 Sep, 2025',
    duration: '12 min',
    thumbnail: 'https://images.unsplash.com/photo-1591081658714-f576fb7ea3ed?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];



export default function Feature({ blok, onNavigateToAudio }: FeatureProps) {
  const { open } = usePlayer();
  const handleRecentlySavedSeeAll = () => {
    onNavigateToAudio?.();
  };


  const EpisodeItem = ({ item }: { item: Episode }) => (
    <TouchableOpacity
      style={styles.episodeItem}
      activeOpacity={0.8}
      onPress={() =>
        open({
          title: item.title,
          subtitle: item.subtitle,
          image: item.thumbnail,
          publisher: item.subtitle,
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        })
      }
    >
      <Image source={{ uri: item.thumbnail }} style={styles.episodeThumbnail} />
      <View style={styles.episodeContent}>
        <Text style={styles.episodeTitle}>{item.title}</Text>
        <Text style={styles.episodeSubtitle}>{item.subtitle}</Text>
        <Text style={styles.episodeDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );


  return (

    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{blok.title}</Text>

        <TouchableOpacity
          style={styles.rightSection}
          onPress={handleRecentlySavedSeeAll}
        >
          <Text style={styles.seeAllText}>{blok.sub_title}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>

        </View>

        <View style={styles.episodesList}>
          {episodes.map((episode) => (
            <EpisodeItem key={episode.id} item={episode} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  section: {
    paddingHorizontal: 24,
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: '500',
    marginRight: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#fff',
  },







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
  scrollViewContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerLeft: {
    flex: 1,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  profileLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  profileText: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  exploreText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
  episodesList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 8,
  },
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  episodeThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 20, // Increased spacing between thumbnail and text
  },
  episodeContent: {
    flex: 1,
    justifyContent: 'center',
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  episodeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  episodeDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});