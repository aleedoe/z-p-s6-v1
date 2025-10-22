import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import HistoryItem from "@/components/HistoryItem";

type FilterType = "week" | "month";

export default function HistoryScreen() {
    const { attendanceRecords } = useApp();
    const [filter, setFilter] = useState<FilterType>("week");
    const insets = useSafeAreaInsets();

    const getFilteredRecords = () => {
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        return attendanceRecords.filter((record) => {
            const recordDate = new Date(record.tanggal);
            if (filter === "week") {
                return recordDate >= sevenDaysAgo;
            } else {
                return recordDate >= thirtyDaysAgo;
            }
        });
    };

    const filteredRecords = getFilteredRecords();

    const getStats = () => {
        const stats = {
            tepatWaktu: 0,
            telat: 0,
            tidakHadir: 0,
        };

        filteredRecords.forEach((record) => {
            if (record.status === "Tepat Waktu") stats.tepatWaktu++;
            if (record.status === "Telat") stats.telat++;
            if (record.status === "Tidak Hadir") stats.tidakHadir++;
        });

        return stats;
    };

    const stats = getStats();

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 20) }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Riwayat Absensi</Text>
                    <Text style={styles.subtitle}>Rekap kehadiran Anda</Text>
                </View>

                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            filter === "week" && styles.filterButtonActive,
                        ]}
                        onPress={() => setFilter("week")}
                        testID="filter-week"
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === "week" && styles.filterTextActive,
                            ]}
                        >
                            Minggu Ini
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            filter === "month" && styles.filterButtonActive,
                        ]}
                        onPress={() => setFilter("month")}
                        testID="filter-month"
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === "month" && styles.filterTextActive,
                            ]}
                        >
                            Bulan Ini
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.tepatWaktu}</Text>
                        <Text style={styles.statLabel}>Tepat Waktu</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: "#f59e0b" }]}>
                            {stats.telat}
                        </Text>
                        <Text style={styles.statLabel}>Telat</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: "#ef4444" }]}>
                            {stats.tidakHadir}
                        </Text>
                        <Text style={styles.statLabel}>Tidak Hadir</Text>
                    </View>
                </View>

                <View style={styles.historyList}>
                    {filteredRecords.map((record, index) => (
                        <HistoryItem
                            key={index}
                            tanggal={record.tanggal}
                            jamMasuk={record.jam_masuk}
                            jamKeluar={record.jam_keluar}
                            status={record.status}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "700" as const,
        color: "#111827",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#6b7280",
    },
    filterContainer: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 20,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        alignItems: "center",
    },
    filterButtonActive: {
        backgroundColor: "#3b82f6",
        borderColor: "#3b82f6",
    },
    filterText: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: "#6b7280",
    },
    filterTextActive: {
        color: "#ffffff",
    },
    statsContainer: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    statValue: {
        fontSize: 28,
        fontWeight: "700" as const,
        color: "#10b981",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#6b7280",
    },
    historyList: {
        gap: 12,
    },
});
