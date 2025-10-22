import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { LogIn, User, Lock } from "lucide-react-native";
import { useApp } from "@/contexts/AppContext";

export default function LoginScreen() {
    const [nik, setNik] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const router = useRouter();
    const { login } = useApp();
    const insets = useSafeAreaInsets();

    const handleLogin = () => {
        if (!nik || !password) {
            Alert.alert("Error", "NIK dan Password harus diisi");
            return;
        }

        login(nik, password);
        router.replace("/home");
    };

    return (
        <View style={styles.containerWrapper}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        {
                            paddingTop: Math.max(insets.top, 20),
                            paddingBottom: Math.max(insets.bottom, 20),
                        },
                    ]}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <LogIn size={48} color="#3b82f6" />
                        </View>
                        <Text style={styles.title}>Absensi Karyawan</Text>
                        <Text style={styles.subtitle}>
                            Masuk untuk melakukan absensi dan mengakses informasi kerja Anda
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>NIK / Email</Text>
                            <View style={styles.inputWrapper}>
                                <User size={20} color="#6b7280" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Masukkan NIK atau Email"
                                    placeholderTextColor="#9ca3af"
                                    value={nik}
                                    onChangeText={setNik}
                                    autoCapitalize="none"
                                    testID="nik-input"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Lock size={20} color="#6b7280" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Masukkan Password"
                                    placeholderTextColor="#9ca3af"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    testID="password-input"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            testID="login-button"
                        >
                            <Text style={styles.loginButtonText}>Masuk</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.forgotButton}>
                            <Text style={styles.forgotText}>Lupa Password?</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Demo Mode - Gunakan NIK dan Password apa saja
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    containerWrapper: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    header: {
        alignItems: "center",
        marginBottom: 48,
    },
    logoContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "#eff6ff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        ...Platform.select({
            ios: {
                shadowColor: "#3b82f6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: "0 4px 16px rgba(59, 130, 246, 0.15)",
            },
        }),
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
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 16,
    },
    formContainer: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: "#374151",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        paddingHorizontal: 16,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 1,
            },
            web: {
                boxShadow: "0 1px 8px rgba(0, 0, 0, 0.05)",
            },
        }),
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 52,
        fontSize: 15,
        color: "#111827",
    },
    loginButton: {
        backgroundColor: "#3b82f6",
        borderRadius: 12,
        height: 52,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
        ...Platform.select({
            ios: {
                shadowColor: "#3b82f6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: "0 4px 8px rgba(59, 130, 246, 0.3)",
            },
        }),
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: "#ffffff",
    },
    forgotButton: {
        alignItems: "center",
        paddingVertical: 12,
    },
    forgotText: {
        fontSize: 14,
        color: "#3b82f6",
        fontWeight: "600" as const,
    },
    footer: {
        marginTop: "auto",
        paddingTop: 32,
        alignItems: "center",
    },
    footerText: {
        fontSize: 13,
        color: "#9ca3af",
        textAlign: "center",
    },
});
