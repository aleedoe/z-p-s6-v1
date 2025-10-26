export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
}

export interface WorkSchedule {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    tolerance_minutes: number;
    created_at: string;
}

export interface WorkScheduleDetailResponse {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    tolerance_minutes: number;
    created_at: string;
    updated_at: string;
    employee_count: number;
}

export interface WorkSchedulesResponse {
    total_schedules: number;
    work_schedules: WorkSchedule[];
}