import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayer } from '@/context/PlayerContext';
import Grid from '@/components/storyblok/Grid';
import { useStoryblokStory } from '@/src/storyblok-expo-sdk';
interface PodcastCard {
  id: string;
  title: string;
  publisher: string;
  image: string;
}

interface Episode {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  duration: string;
  thumbnail: string;
}

interface HomepageProps {
  onNavigateToBrowse?: (focusSearch?: boolean) => void;
  onNavigateToAudio?: () => void;
}

const Homepage = ({ onNavigateToBrowse, onNavigateToAudio }: HomepageProps) => {
  const {
    story,
    isLoading,
    error,
    isInEditor,
    renderContent
  } = useStoryblokStory('home');
  const { open } = usePlayer();

  const handleSearchPress = () => {
    // Navigate to Browse tab and focus on search
    onNavigateToBrowse?.(true);
  };

  const handleRecentlySavedSeeAll = () => {
    // Navigate to Audio tab
    onNavigateToAudio?.();
  };

  const handleForYouSeeAll = () => {
    // Navigate to Browse tab
    onNavigateToBrowse?.();
  };

  const podcasts: PodcastCard[] = [
    {
      id: '1',
      title: 'Sports',
      publisher: 'sports.bbc.com',
      image: 'https://plus.unsplash.com/premium_photo-1664537975122-9c598d85816e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: '2',
      title: 'Nature',
      publisher: 'natgeo.org',
      image: 'https://plus.unsplash.com/premium_photo-1675827055694-010aef2cf08f?q=80&w=824&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: '3',
      title: 'Tech Talk',
      publisher: 'tech.crunch.com',
      image: 'http://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: '4',
      title: 'Travel',
      publisher: 'travel.org',
      image: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ];

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

  const PodcastCard = ({ item }: { item: PodcastCard }) => (
    <TouchableOpacity
      style={styles.podcastCard}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.podcastImage} />
      <View style={styles.podcastOverlay}>
        <Text style={styles.podcastTitle}>{item.title}</Text>
        <Text style={styles.podcastPublisher}>{item.publisher}</Text>
      </View>
    </TouchableOpacity>
  );

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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.profileContainer}>
                <View style={styles.profileImage}>
                  <Image
                    source={require('../../assets/images/Alogo.png')}
                    style={styles.profileLogo}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.profileText}>
                  <Text style={styles.welcomeText}>Welcome Anish!</Text>
                  <Text style={styles.exploreText}>Explore Podcasts</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearchPress}
              activeOpacity={0.7}
            >
              <MaterialIcons name="search" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {renderContent()}
          {/* For you Section */}
          {/* <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>For you</Text>
                            <TouchableOpacity onPress={handleForYouSeeAll}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={podcasts}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => <PodcastCard item={item} />}
                            contentContainerStyle={styles.podcastList}
                        />
                    </View> */}

          {/* Recently saved Section */}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

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

export default Homepage;