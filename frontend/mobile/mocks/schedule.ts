export interface Schedule {
    tanggal: string;
    shift: string;
    jam_masuk: string;
    jam_keluar: string;
}

export const scheduleData: Schedule[] = [
    {
        tanggal: "2025-10-17",
        shift: "Shift Pagi",
        jam_masuk: "08:00",
        jam_keluar: "17:00",
    },
    {
        tanggal: "2025-10-18",
        shift: "Shift Pagi",
        jam_masuk: "08:00",
        jam_keluar: "17:00",
    },
    {
        tanggal: "2025-10-19",
        shift: "Shift Pagi",
        jam_masuk: "08:00",
        jam_keluar: "17:00",
    },
    {
        tanggal: "2025-10-20",
        shift: "Shift Pagi",
        jam_masuk: "08:00",
        jam_keluar: "17:00",
    },
    {
        tanggal: "2025-10-21",
        shift: "Shift Pagi",
        jam_masuk: "08:00",
        jam_keluar: "17:00",
    },
    {
        tanggal: "2025-10-22",
        shift: "Libur",
        jam_masuk: "-",
        jam_keluar: "-",
    },
    {
        tanggal: "2025-10-23",
        shift: "Libur",
        jam_masuk: "-",
        jam_keluar: "-",
    },
];
