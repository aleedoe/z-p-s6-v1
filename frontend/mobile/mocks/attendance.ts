export interface AttendanceRecord {
    tanggal: string;
    jam_masuk: string | null;
    jam_keluar: string | null;
    status: "Tepat Waktu" | "Telat" | "Tidak Hadir" | "Belum Absen";
}

export const attendanceHistory: AttendanceRecord[] = [
    {
        tanggal: "2025-10-19",
        jam_masuk: null,
        jam_keluar: null,
        status: "Belum Absen",
    },
    {
        tanggal: "2025-10-18",
        jam_masuk: "08:12",
        jam_keluar: "17:02",
        status: "Telat",
    },
    {
        tanggal: "2025-10-17",
        jam_masuk: "07:58",
        jam_keluar: "17:05",
        status: "Tepat Waktu",
    },
    {
        tanggal: "2025-10-16",
        jam_masuk: "08:02",
        jam_keluar: "17:00",
        status: "Tepat Waktu",
    },
    {
        tanggal: "2025-10-15",
        jam_masuk: "07:55",
        jam_keluar: "17:03",
        status: "Tepat Waktu",
    },
    {
        tanggal: "2025-10-14",
        jam_masuk: "08:15",
        jam_keluar: "17:10",
        status: "Telat",
    },
    {
        tanggal: "2025-10-13",
        jam_masuk: null,
        jam_keluar: null,
        status: "Tidak Hadir",
    },
    {
        tanggal: "2025-10-12",
        jam_masuk: "07:59",
        jam_keluar: "17:01",
        status: "Tepat Waktu",
    },
    {
        tanggal: "2025-10-11",
        jam_masuk: "08:03",
        jam_keluar: "17:05",
        status: "Tepat Waktu",
    },
    {
        tanggal: "2025-10-10",
        jam_masuk: "07:57",
        jam_keluar: "17:00",
        status: "Tepat Waktu",
    },
];
