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

export interface EmployeeSchedule {
    schedule_id: number;
    schedule_name: string;
    day_id: number;
    day_name: string;
    start_time: string;
    end_time: string;
    tolerance_minutes: number;
}

export interface EmployeeDetailResponse {
    id: number;
    nik: string;
    name: string;
    email: string;
    position: string;
    gender: string;
    schedules: EmployeeSchedule[];
}

export interface EmployeesResponse {
    employees: Employee[];
    total_employees: number;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface DailySchedule {
    id: number;
    name: string;
}

export interface WorkSchedule {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    tolerance_minutes: number;
}

export interface AvailableSchedulesResponse {
    daily_schedules: DailySchedule[];
    work_schedules: WorkSchedule[];
}