export interface Employee {
    id: number;
    nama: string;
    email: string;
    nik: string;
    divisi: string;
    jabatan: string;
    foto: string;
}

export const employeeData: Employee = {
    id: 2,
    nama: "Andi Saputra",
    email: "andi@company.com",
    nik: "EMP2024001",
    divisi: "Produksi",
    jabatan: "Operator Mesin",
    foto: "https://i.pravatar.cc/300?img=12",
};
