import { Tabs } from "expo-router";
import { Home, Calendar, History, User } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#3b82f6",
                tabBarInactiveTintColor: "#9ca3af",
                headerShown: true,
                headerStyle: {
                    backgroundColor: "#ffffff",
                },
                headerTitleStyle: {
                    fontWeight: "700" as const,
                    fontSize: 20,
                },
                tabBarStyle: {
                    backgroundColor: "#ffffff",
                    borderTopWidth: 1,
                    borderTopColor: "#e5e7eb",
                    ...Platform.select({
                        ios: {
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: -2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                        },
                        android: {
                            elevation: 8,
                        },
                        web: {
                            boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)",
                        },
                    }),
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600" as const,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Beranda",
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="schedule"
                options={{
                    title: "Jadwal",
                    tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: "Riwayat",
                    tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profil",
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
