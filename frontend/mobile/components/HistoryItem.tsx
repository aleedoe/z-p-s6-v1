import { View, Text, StyleSheet, Platform } from "react-native";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react-native";

interface HistoryItemProps {
    tanggal: string;
    jamMasuk: string | null;
    jamKeluar: string | null;
    status: "Tepat Waktu" | "Telat" | "Tidak Hadir" | "Belum Absen";
}

export default function HistoryItem({
    tanggal,
    jamMasuk,
    jamKeluar,
    status,
}: HistoryItemProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember",
        ];

        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${dayName}, ${day} ${month} ${year}`;
    };

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
        const size = 20;

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
            <View style={styles.header}>
                <Text style={styles.date}>{formatDate(tanggal)}</Text>
                <View style={styles.statusBadge}>
                    {getStatusIcon()}
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {status}
                    </Text>
                </View>
            </View>

            <View style={styles.timeContainer}>
                <View style={styles.timeItem}>
                    <Text style={styles.timeLabel}>Jam Masuk</Text>
                    <Text style={styles.timeValue}>{jamMasuk || "--:--"}</Text>
                </View>
                <View style={styles.timeItem}>
                    <Text style={styles.timeLabel}>Jam Keluar</Text>
                    <Text style={styles.timeValue}>{jamKeluar || "--:--"}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: "0 1px 8px rgba(0, 0, 0, 0.05)",
            },
        }),
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
    },
    date: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: "#111827",
        flex: 1,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: "#f9fafb",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600" as const,
    },
    timeContainer: {
        flexDirection: "row",
        gap: 16,
    },
    timeItem: {
        flex: 1,
        gap: 4,
    },
    timeLabel: {
        fontSize: 12,
        color: "#6b7280",
    },
    timeValue: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: "#111827",
    },
});
