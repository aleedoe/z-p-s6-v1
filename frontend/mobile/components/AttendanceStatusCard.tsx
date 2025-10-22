import { View, Text, StyleSheet, Platform } from "react-native";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react-native";

interface AttendanceStatusCardProps {
    status: "Tepat Waktu" | "Telat" | "Tidak Hadir" | "Belum Absen";
    jamMasuk: string | null;
    jamKeluar: string | null;
}

export default function AttendanceStatusCard({
    status,
    jamMasuk,
    jamKeluar,
}: AttendanceStatusCardProps) {
    const getStatusColor = () => {
        switch (status) {
            case "Tepat Waktu":
                return "#10b981";
            case "Telat":
                return "#f59e0b";
            case "Tidak Hadir":
                return "#ef4444";
            case "Belum Absen":
                return "#6b7280";
            default:
                return "#6b7280";
        }
    };

    const getStatusIcon = () => {
        const color = getStatusColor();
        const size = 24;

        switch (status) {
            case "Tepat Waktu":
                return <CheckCircle size={size} color={color} />;
            case "Telat":
                return <AlertCircle size={size} color={color} />;
            case "Tidak Hadir":
                return <XCircle size={size} color={color} />;
            case "Belum Absen":
                return <Clock size={size} color={color} />;
            default:
                return <Clock size={size} color={color} />;
        }
    };

    const statusColor = getStatusColor();

    return (
        <View style={styles.card}>
            <View style={styles.statusHeader}>
                {getStatusIcon()}
                <View style={styles.statusTextContainer}>
                    <Text style={styles.statusLabel}>Status Hari Ini</Text>
                    <Text style={[styles.statusValue, { color: statusColor }]}>
                        {status}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.timeContainer}>
                <View style={styles.timeItem}>
                    <Clock size={16} color="#6b7280" />
                    <Text style={styles.timeLabel}>Jam Masuk</Text>
                    <Text style={styles.timeValue}>
                        {jamMasuk || "--:--"}
                    </Text>
                </View>

                <View style={styles.verticalDivider} />

                <View style={styles.timeItem}>
                    <Clock size={16} color="#6b7280" />
                    <Text style={styles.timeLabel}>Jam Keluar</Text>
                    <Text style={styles.timeValue}>
                        {jamKeluar || "--:--"}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
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
    statusHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    statusTextContainer: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 4,
    },
    statusValue: {
        fontSize: 20,
        fontWeight: "700" as const,
    },
    divider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        marginVertical: 16,
    },
    timeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    timeItem: {
        flex: 1,
        alignItems: "center",
        gap: 8,
    },
    verticalDivider: {
        width: 1,
        height: 60,
        backgroundColor: "#e5e7eb",
    },
    timeLabel: {
        fontSize: 12,
        color: "#6b7280",
    },
    timeValue: {
        fontSize: 24,
        fontWeight: "700" as const,
        color: "#111827",
    },
});
