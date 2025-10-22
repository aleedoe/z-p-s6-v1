import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/contexts/AppContext";
import ScheduleCard from "@/components/ScheduleCard";

export default function ScheduleScreen() {
    const { schedule } = useApp();
    const insets = useSafeAreaInsets();

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    const todayDate = getTodayDate();

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 20) }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Jadwal Kerja</Text>
                    <Text style={styles.subtitle}>Jadwal kerja mingguan Anda</Text>
                </View>

                <View style={styles.scheduleList}>
                    {schedule.map((item, index) => (
                        <ScheduleCard
                            key={index}
                            tanggal={item.tanggal}
                            shift={item.shift}
                            jamMasuk={item.jam_masuk}
                            jamKeluar={item.jam_keluar}
                            isToday={item.tanggal === todayDate}
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
        marginBottom: 24,
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
    scheduleList: {
        gap: 12,
    },
});
