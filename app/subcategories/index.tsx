import React from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function SubCategoryScreen() {
    const router = useRouter();
    const { title, subCategories } = useLocalSearchParams();
    const parsedSubCategories = JSON.parse(subCategories as string);

    // Generate random image for each subcategory
    const getRandomImage = (index: number) => `https://picsum.photos/48/48?random=${100 + index}`;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.appBar}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.appBarTitle}>{title}</Text>
                <View style={styles.placeholder} />
            </View>
            <View style={styles.container}>
                <FlatList
                    data={parsedSubCategories}
                    keyExtractor={(item) => item._uid}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => {
                                if (item.article?.length > 0) {
                                    router.push({
                                        pathname: "/articles",
                                        params: {
                                            title: item.name,
                                            articles: JSON.stringify(item.article),
                                        },
                                    });
                                }
                            }}
                        >
                            <View style={styles.iconContainer}>
                                <Image
                                    source={{ uri: getRandomImage(index) }}
                                    style={styles.icon}
                                />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.name}>{item.name}</Text>
                                {item.description && (
                                    <Text style={styles.subtitle}>{item.description}</Text>
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