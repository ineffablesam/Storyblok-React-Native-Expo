import React from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    Linking,
    SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ArticlesScreen() {
    const router = useRouter();
    const { title, articles } = useLocalSearchParams();
    const parsedArticles = JSON.parse(articles as string);

    // Sample data matching the image design
    const sampleCategories = [
        {
            _uid: "1",
            name: "Sports",
            subtitle: "Games and athletics.",
            thumbnail: "https://picsum.photos/60/60?random=1",
            link: { url: "https://example.com/sports" }
        },
        {
            _uid: "2",
            name: "Nature",
            subtitle: "Outdoors and wildlife.",
            thumbnail: "https://picsum.photos/60/60?random=2",
            link: { url: "https://example.com/nature" }
        },
        {
            _uid: "3",
            name: "Tech",
            subtitle: "Latest innovations.",
            thumbnail: "https://picsum.photos/60/60?random=3",
            link: { url: "https://example.com/tech" }
        },
        {
            _uid: "4",
            name: "Music",
            subtitle: "Beats and melodies.",
            thumbnail: "https://picsum.photos/60/60?random=4",
            link: { url: "https://example.com/music" }
        }
    ];

    // Use sample data if parsedArticles is empty or use parsedArticles
    const dataToRender = parsedArticles && parsedArticles.length > 0 ? parsedArticles : sampleCategories;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.appBar}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.appBarTitle}>{title || "Categories"}</Text>
                <View style={styles.placeholder} />
            </View>
            <View style={styles.container}>
                <FlatList
                    data={dataToRender}
                    keyExtractor={(item) => item._uid}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() =>
                                item.link?.url && Linking.openURL(item.link.url)
                            }
                        >
                            <View style={styles.iconContainer}>
                                <Image
                                    source={{ uri: item.thumbnail }}
                                    style={styles.icon}
                                />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.name}>{item.name}</Text>
                                {item.subtitle && (
                                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#000",
    },
    appBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#000",
        borderBottomWidth: 1,
        borderBottomColor: "#2a2a2a",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1a1a1a",
        justifyContent: "center",
        alignItems: "center",
    },
    backIcon: {
        fontSize: 20,
        color: "#fff",
        fontWeight: "bold",
    },
    appBarTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
        flex: 1,
        textAlign: "center",
        marginHorizontal: 16,
    },
    placeholder: {
        width: 40,
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#000"
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#2a2a2a",
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#2a2a2a",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
        overflow: "hidden",
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: 12,
    },
    textContainer: {
        flex: 1,
    },
    name: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 4,
    },
    subtitle: {
        color: "#888",
        fontSize: 14,
        lineHeight: 18,
    },
});