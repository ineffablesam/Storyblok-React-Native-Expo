import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import { StoryblokComponentProps } from "../../src/storyblok-expo-sdk/types";
import { BlurView } from "expo-blur";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface Category {
    _uid: string;
    name: string;
    thumbnail?: string;
    sub_category?: Category[];
    article?: Article[];
    color?: {
        color: string;
    };
}

interface Article {
    _uid: string;
    name: string;
    subtitle?: string;
    thumbnail?: string;
    link?: {
        url?: string;
        cached_url?: string;
    };
}

interface FeatureProps extends StoryblokComponentProps {
    blok: {
        title?: string;
        categories?: Category[];
    };
}

const CategoryCard = ({ item, index, onPress }: { item: Category; index: number; onPress: () => void }) => {
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

    // Generate fallback colors for categories
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57", "#FF9FF3", "#54A0FF", "#5F27CD"];
    const color = item.color?.color || colors[index % colors.length];

    return (
        <AnimatedTouchableOpacity
            style={[styles.card, animatedStyle]}
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
        >
            {item.thumbnail ? (
                <Image
                    source={{ uri: "https:" + item.thumbnail }}
                    style={styles.image}
                />
            ) : (
                <View style={[styles.placeholderImage, { backgroundColor: color }]} />
            )}

            {/* Glass overlay */}
            <View style={[styles.overlay, { backgroundColor: `${color}20` }]} />

            <BlurView intensity={60} tint="dark" style={styles.glassOverlay}>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSubtitle}>
                        {item.sub_category && item.sub_category.length > 0
                            ? `${item.sub_category.length} subcategories`
                            : item.article && item.article.length > 0
                                ? `${item.article.length} articles`
                                : "Explore content"
                        }
                    </Text>
                </View>

                {/* Accent line */}
                <View style={[styles.accentLine, { backgroundColor: color }]} />
            </BlurView>
        </AnimatedTouchableOpacity>
    );
};

export default function Browsecat({ blok }: FeatureProps) {
    const router = useRouter();

    const handleCategoryPress = (item: Category) => {
        if (item.sub_category && item.sub_category.length > 0) {
            router.push({
                pathname: "/subcategories",
                params: {
                    title: item.name,
                    subCategories: JSON.stringify(item.sub_category),
                },
            });
        } else if (item.article && item.article.length > 0) {
            router.push({
                pathname: "/articles",
                params: {
                    title: item.name,
                    articles: JSON.stringify(item.article),
                },
            });
        }
    };

    const categories = blok.categories || [];

    if (!categories || categories.length === 0) {
        return (
            <View style={styles.section}>
                <Text style={styles.debugText}>No categories found</Text>
            </View>
        );
    }

    return (
        <View style={styles.section}>
            <FlatList
                data={categories}
                numColumns={2}
                keyExtractor={(item, index) => item._uid || index.toString()}
                renderItem={({ item, index }) => (
                    <CategoryCard
                        item={item}
                        index={index}
                        onPress={() => handleCategoryPress(item)}
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.gridContainer}
                columnWrapperStyle={styles.row}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        paddingHorizontal: 16,
        marginBottom: 30,
    },
    gridContainer: {
        paddingTop: 8,
        paddingBottom: 20,
    },
    row: {
        justifyContent: "space-between",
    },
    card: {
        flex: 1,
        margin: 6,
        height: 140,
        borderRadius: 23,
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
    placeholderImage: {
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
        padding: 12,
    },
    cardTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 2,
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
    debugText: {
        color: "#fff",
        fontSize: 16,
        textAlign: "center",
        marginTop: 50,
    },
});
