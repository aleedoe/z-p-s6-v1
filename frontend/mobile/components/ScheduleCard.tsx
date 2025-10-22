import { View, Text, StyleSheet, Platform } from "react-native";
import { Calendar, Clock } from "lucide-react-native";

interface ScheduleCardProps {
    tanggal: string;
    shift: string;
    jamMasuk: string;
    jamKeluar: string;
    isToday?: boolean;
}

export default function ScheduleCard({
    tanggal,
    shift,
    jamMasuk,
    jamKeluar,
    isToday = false,
}: ScheduleCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const months = [
            "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
            "Jul", "Agu", "Sep", "Oct", "Nov", "Des",
        ];

        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];

        return { dayName, dateStr: `${day} ${month}` };
    };

    const { dayName, dateStr } = formatDate(tanggal);
    const isOffDay = shift === "Libur";

    return (
        <View
            style={[
                styles.card,
                isToday && styles.cardToday,
                isOffDay && styles.cardOffDay,
            ]}
        >
            <View style={styles.dateSection}>
                <Calendar
                    size={20}
                    color={isToday ? "#3b82f6" : isOffDay ? "#9ca3af" : "#6b7280"}
                />
                <View style={styles.dateText}>
                    <Text
                        style={[
                            styles.dayName,
                            isToday && styles.dayNameToday,
                            isOffDay && styles.dayNameOffDay,
                        ]}
                    >
                        {dayName}
                    </Text>
                    <Text
                        style={[
                            styles.dateStr,
                            isToday && styles.dateStrToday,
                            isOffDay && styles.dateStrOffDay,
                        ]}
                    >
                        {dateStr}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.scheduleSection}>
                <Text
                    style={[
                        styles.shiftName,
                        isToday && styles.shiftNameToday,
                        isOffDay && styles.shiftNameOffDay,
                    ]}
                >
                    {shift}
                </Text>
                {!isOffDay && (
                    <View style={styles.timeRow}>
                        <Clock size={14} color="#6b7280" />
                        <Text style={styles.timeText}>
                            {jamMasuk} - {jamKeluar}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
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
    cardToday: {
        borderColor: "#3b82f6",
        borderWidth: 2,
        backgroundColor: "#eff6ff",
    },
    cardOffDay: {
        backgroundColor: "#f9fafb",
        opacity: 0.7,
    },
    dateSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minWidth: 100,
    },
    dateText: {
        gap: 2,
    },
    dayName: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: "#111827",
    },
    dayNameToday: {
        color: "#3b82f6",
    },
    dayNameOffDay: {
        color: "#9ca3af",
    },
    dateStr: {
        fontSize: 12,
        color: "#6b7280",
    },
    dateStrToday: {
        color: "#3b82f6",
    },
    dateStrOffDay: {
        color: "#9ca3af",
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: "#e5e7eb",
    },
    scheduleSection: {
        flex: 1,
        gap: 6,
    },
    shiftName: {
        fontSize: 15,
        fontWeight: "600" as const,
        color: "#111827",
    },
    shiftNameToday: {
        color: "#3b82f6",
    },
    shiftNameOffDay: {
        color: "#9ca3af",
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    timeText: {
        fontSize: 13,
        color: "#6b7280",
    },
});
