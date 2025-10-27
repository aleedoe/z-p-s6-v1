export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
}

export interface Attendance {
    attendance_id: number;
    employee_id: number;
    employee_name: string;
    position: string;
    attendance_date: string;
}

export interface AttendancesResponse {
    total_attendance: number;
    attendances: Attendance[];
}