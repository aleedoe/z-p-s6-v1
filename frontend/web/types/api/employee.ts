export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
}

export interface Employee {
    id: number;
    nik: string;
    name: string;
    email: string;
    position: string;
    gender: string;
}

export interface EmployeesResponse {
    employees: Employee[];
    total_employees: number;
}

// Tambahkan type lain sesuai kebutuhan
export interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}