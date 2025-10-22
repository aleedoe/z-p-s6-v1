import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Alert,
    Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { X, CheckCircle } from "lucide-react-native";
import { useApp } from "@/contexts/AppContext";

export default function ScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState<boolean>(false);
    const router = useRouter();
    const { checkIn, todayAttendance } = useApp();
    const scanLineAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const scanAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLineAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );
        scanAnimation.start();

        return () => scanAnimation.stop();
    }, [scanLineAnim]);

    const scanLineTranslate = scanLineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 250],
    });

    if (!permission) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionTitle}>Izin Kamera Diperlukan</Text>
                    <Text style={styles.permissionText}>
                        Aplikasi memerlukan akses ke kamera untuk melakukan scan QR Code
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestPermission}
                    >
                        <Text style={styles.permissionButtonText}>Berikan Izin</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const handleBarCodeScanned = () => {
        if (scanned) return;

        setScanned(true);

        if (todayAttendance?.jam_masuk && !todayAttendance?.jam_keluar) {
            Alert.alert(
                "Check Out Berhasil!",
                "Terima kasih telah bekerja hari ini. Hati-hati di jalan!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            router.back();
                        },
                    },
                ]
            );
        } else {
            checkIn();
            Alert.alert(
                "Check In Berhasil!",
                "Absensi masuk Anda telah tercatat. Selamat bekerja!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            router.back();
                        },
                    },
                ]
            );
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            >
                <SafeAreaView style={styles.overlay} edges={["top", "bottom"]}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => router.back()}
                            testID="close-button"
                        >
                            <X size={24} color="#ffffff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Scan QR Code</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <View style={styles.scanArea}>
                        <View style={styles.scanFrame}>
                            <View style={[styles.corner, styles.cornerTopLeft]} />
                            <View style={[styles.corner, styles.cornerTopRight]} />
                            <View style={[styles.corner, styles.cornerBottomLeft]} />
                            <View style={[styles.corner, styles.cornerBottomRight]} />

                            <Animated.View
                                style={[
                                    styles.scanLine,
                                    {
                                        transform: [{ translateY: scanLineTranslate }],
                                    },
                                ]}
                            />
                        </View>
                    </View>

                    <View style={styles.instructionContainer}>
                        <Text style={styles.instructionText}>
                            Arahkan kamera ke QR Code untuk melakukan absensi
                        </Text>
                        <TouchableOpacity
                            style={styles.manualButton}
                            onPress={handleBarCodeScanned}
                        >
                            <CheckCircle size={20} color="#ffffff" />
                            <Text style={styles.manualButtonText}>Absen Manual (Demo)</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
    },
    permissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        gap: 20,
    },
    permissionTitle: {
        fontSize: 22,
        fontWeight: "700" as const,
        color: "#111827",
        textAlign: "center",
    },
    permissionText: {
        fontSize: 15,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 22,
    },
    permissionButton: {
        backgroundColor: "#3b82f6",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 32,
        marginTop: 12,
    },
    permissionButtonText: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: "#ffffff",
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600" as const,
        color: "#ffffff",
    },
    placeholder: {
        width: 40,
    },
    scanArea: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scanFrame: {
        width: 280,
        height: 280,
        position: "relative",
    },
    corner: {
        position: "absolute",
        width: 40,
        height: 40,
        borderColor: "#3b82f6",
    },
    cornerTopLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 8,
    },
    cornerTopRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 8,
    },
    cornerBottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 8,
    },
    cornerBottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 8,
    },
    scanLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: "#3b82f6",
        ...Platform.select({
            ios: {
                shadowColor: "#3b82f6",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: "0 0 8px rgba(59, 130, 246, 0.8)",
            },
        }),
    },
    instructionContainer: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        gap: 16,
        alignItems: "center",
    },
    instructionText: {
        fontSize: 15,
        color: "#ffffff",
        textAlign: "center",
        lineHeight: 22,
    },
    manualButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#10b981",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        ...Platform.select({
            ios: {
                shadowColor: "#10b981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: "0 4px 8px rgba(16, 185, 129, 0.3)",
            },
        }),
    },
    manualButtonText: {
        fontSize: 15,
        fontWeight: "600" as const,
        color: "#ffffff",
    },
});
