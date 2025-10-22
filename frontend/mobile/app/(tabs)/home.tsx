import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { QrCode, Calendar, History } from "lucide-react-native";
import { useApp } from "@/contexts/AppContext";
import AttendanceStatusCard from "@/components/AttendanceStatusCard";

export default function HomeScreen() {
    const router = useRouter();
    const { user, todayAttendance } = useApp();
    const insets = useSafeAreaInsets();

    const currentDate = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 20) }]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Halo, {user?.nama || "Karyawan"}</Text>
                    <Text style={styles.date}>{currentDate}</Text>
                </View>
            </View>

            <AttendanceStatusCard
                status={todayAttendance?.status || "Belum Absen"}
                jamMasuk={todayAttendance?.jam_masuk || null}
                jamKeluar={todayAttendance?.jam_keluar || null}
            />

            <TouchableOpacity
                style={styles.scanButton}
                onPress={() => router.push("/scan")}
                testID="scan-button"
            >
                <View style={styles.scanIcon}>
                    <QrCode size={32} color="#ffffff" />
                </View>
                <View style={styles.scanTextContainer}>
                    <Text style={styles.scanButtonText}>Scan QR untuk Absen</Text>
                    <Text style={styles.scanButtonSubtext}>
                        Arahkan kamera ke QR Code
                    </Text>
                </View>
            </TouchableOpacity>

            <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>Akses Cepat</Text>

                <View style={styles.actionGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push("/schedule")}
                    >
                        <View style={[styles.actionIconContainer, { backgroundColor: "#dbeafe" }]}>
                            <Calendar size={24} color="#3b82f6" />
                        </View>
                        <Text style={styles.actionTitle}>Jadwal Kerja</Text>
                        <Text style={styles.actionSubtitle}>Lihat jadwal minggu ini</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push("/history")}
                    >
                        <View style={[styles.actionIconContainer, { backgroundColor: "#fef3c7" }]}>
                            <History size={24} color="#f59e0b" />
                        </View>
                        <Text style={styles.actionTitle}>Riwayat Absensi</Text>
                        <Text style={styles.actionSubtitle}>Cek kehadiran Anda</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    content: {
        padding: 20,
        gap: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    greeting: {
        fontSize: 24,
        fontWeight: "700" as const,
        color: "#111827",
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: "#6b7280",
    },
    scanButton: {
        backgroundColor: "#3b82f6",
        borderRadius: 16,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        ...Platform.select({
            ios: {
                shadowColor: "#3b82f6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
            web: {
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
            },
        }),
    },
    scanIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    scanTextContainer: {
        flex: 1,
    },
    scanButtonText: {
        fontSize: 18,
        fontWeight: "700" as const,
        color: "#ffffff",
        marginBottom: 4,
    },
    scanButtonSubtext: {
        fontSize: 13,
        color: "rgba(255, 255, 255, 0.8)",
    },
    quickActions: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700" as const,
        color: "#111827",
    },
    actionGrid: {
        flexDirection: "row",
        gap: 12,
    },
    actionCard: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        gap: 12,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            },
        }),
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: "600" as const,
        color: "#111827",
    },
    actionSubtitle: {
        fontSize: 12,
        color: "#6b7280",
        lineHeight: 16,
    },
});
