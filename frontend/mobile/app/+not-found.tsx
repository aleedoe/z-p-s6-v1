import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle } from "lucide-react-native";

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: "Halaman Tidak Ditemukan" }} />
            <View style={styles.container}>
                <AlertCircle size={64} color="#ef4444" style={styles.icon} />
                <Text style={styles.title}>Halaman tidak ditemukan</Text>
                <Text style={styles.subtitle}>
                    Maaf, halaman yang Anda cari tidak tersedia.
                </Text>

                <Link href="/" style={styles.link}>
                    <Text style={styles.linkText}>Kembali ke Beranda</Text>
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#f9fafb",
    },
    icon: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "700" as const,
        color: "#111827",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 32,
    },
    link: {
        backgroundColor: "#3b82f6",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 32,
    },
    linkText: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: "#ffffff",
    },
});
