import { useState, useMemo, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { employeeData, Employee } from "@/mocks/employee";
import { scheduleData, Schedule } from "@/mocks/schedule";
import { attendanceHistory, AttendanceRecord } from "@/mocks/attendance";

interface AppState {
    user: Employee | null;
    isLoggedIn: boolean;
    todayAttendance: AttendanceRecord | null;
    attendanceRecords: AttendanceRecord[];
    schedule: Schedule[];
    login: (nik: string, password: string) => void;
    logout: () => void;
    checkIn: () => void;
    checkOut: () => void;
}

export const [AppProvider, useApp] = createContextHook<AppState>(() => {
    const [user, setUser] = useState<Employee | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(attendanceHistory);

    const getTodayDate = useCallback(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    }, []);

    const todayAttendance = useMemo(() => {
        return attendanceRecords.find(
            (record) => record.tanggal === getTodayDate()
        ) || null;
    }, [attendanceRecords, getTodayDate]);

    const login = useCallback((nik: string, password: string) => {
        console.log("Login attempt:", nik, password);
        setUser(employeeData);
        setIsLoggedIn(true);
    }, []);

    const logout = useCallback(() => {
        console.log("Logout");
        setUser(null);
        setIsLoggedIn(false);
    }, []);

    const checkIn = useCallback(() => {
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5);
        const todayDate = getTodayDate();

        const hours = now.getHours();
        const minutes = now.getMinutes();
        const isLate = hours > 8 || (hours === 8 && minutes > 0);

        setAttendanceRecords((prevRecords) =>
            prevRecords.map((record) => {
                if (record.tanggal === todayDate) {
                    return {
                        ...record,
                        jam_masuk: timeString,
                        status: isLate ? ("Telat" as const) : ("Tepat Waktu" as const),
                    };
                }
                return record;
            })
        );
        console.log("Check in at:", timeString);
    }, [getTodayDate]);

    const checkOut = useCallback(() => {
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5);
        const todayDate = getTodayDate();

        setAttendanceRecords((prevRecords) =>
            prevRecords.map((record) => {
                if (record.tanggal === todayDate) {
                    return {
                        ...record,
                        jam_keluar: timeString,
                    };
                }
                return record;
            })
        );
        console.log("Check out at:", timeString);
    }, [getTodayDate]);

    return useMemo(() => ({
        user,
        isLoggedIn,
        todayAttendance,
        attendanceRecords,
        schedule: scheduleData,
        login,
        logout,
        checkIn,
        checkOut,
    }), [
        user,
        isLoggedIn,
        todayAttendance,
        attendanceRecords,
        login,
        logout,
        checkIn,
        checkOut,
    ]);
});
