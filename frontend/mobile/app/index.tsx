import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";

export default function Index() {
    const router = useRouter();
    const { isLoggedIn } = useApp();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoggedIn) {
                router.replace("/(tabs)/home");
            } else {
                router.replace("/login");
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [isLoggedIn, router]);

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <ActivityIndicator size="large" color="#3b82f6" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9fafb",
    },
});
