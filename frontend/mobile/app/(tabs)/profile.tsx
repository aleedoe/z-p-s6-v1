import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { User, Mail, Briefcase, Building2, LogOut, Edit } from "lucide-react-native";
import { useApp } from "@/contexts/AppContext";

export default function ProfileScreen() {
    const { user, logout } = useApp();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleLogout = () => {
        Alert.alert(
            "Keluar",
            "Apakah Anda yakin ingin keluar dari aplikasi?",
            [
                {
                    text: "Batal",
                    style: "cancel",
                },
                {
                    text: "Keluar",
                    style: "destructive",
                    onPress: () => {
                        logout();
                        router.replace("/login");
                    },
                },
            ]
        );
    };

    const handleEdit = () => {
        Alert.alert("Edit Profil", "Fitur edit profil akan segera hadir");
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 20) }]}>
            <View style={styles.header}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={{ uri: user.foto }}
                        style={styles.profileImage}
                    />
                </View>
                <Text style={styles.name}>{user.nama}</Text>
                <Text style={styles.nik}>NIK: {user.nik}</Text>
            </View>

            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Edit size={18} color="#3b82f6" />
                <Text style={styles.editButtonText}>Edit Profil</Text>
            </TouchableOpacity>

            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Informasi Pribadi</Text>

                <View style={styles.infoCard}>
                    <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                            <Mail size={20} color="#6b7280" />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{user.email}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                            <Building2 size={20} color="#6b7280" />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>Divisi</Text>
                            <Text style={styles.infoValue}>{user.divisi}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                            <Briefcase size={20} color="#6b7280" />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>Jabatan</Text>
                            <Text style={styles.infoValue}>{user.jabatan}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                            <User size={20} color="#6b7280" />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>NIK</Text>
                            <Text style={styles.infoValue}>{user.nik}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                testID="logout-button"
            >
                <LogOut size={20} color="#ef4444" />
                <Text style={styles.logoutButtonText}>Keluar</Text>
            </TouchableOpacity>
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
        alignItems: "center",
        paddingVertical: 20,
    },
    profileImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#e5e7eb",
        marginBottom: 16,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            },
        }),
    },
    profileImage: {
        width: "100%",
        height: "100%",
    },
    name: {
        fontSize: 24,
        fontWeight: "700" as const,
        color: "#111827",
        marginBottom: 4,
    },
    nik: {
        fontSize: 14,
        color: "#6b7280",
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    editButtonText: {
        fontSize: 15,
        fontWeight: "600" as const,
        color: "#3b82f6",
    },
    infoSection: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700" as const,
        color: "#111827",
    },
    infoCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        gap: 16,
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
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
    },
    infoText: {
        flex: 1,
        gap: 4,
    },
    infoLabel: {
        fontSize: 12,
        color: "#6b7280",
    },
    infoValue: {
        fontSize: 15,
        fontWeight: "600" as const,
        color: "#111827",
    },
    divider: {
        height: 1,
        backgroundColor: "#e5e7eb",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: "#fee2e2",
        marginTop: 12,
    },
    logoutButtonText: {
        fontSize: 15,
        fontWeight: "600" as const,
        color: "#ef4444",
    },
});
