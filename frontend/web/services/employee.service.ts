import { Employee, EmployeesResponse, PaginationParams, EmployeeDetailResponse, AvailableSchedulesResponse } from "@/types/api/employee";
import { BaseService } from "./base.service";

class EmployeeService extends BaseService {
    private readonly endpoint = '/admin/employees';

    async getAll(params?: PaginationParams): Promise<EmployeesResponse> {
        return this.get<EmployeesResponse>(this.endpoint, { params });
    }

    async getById(id: number): Promise<EmployeeDetailResponse> {
        return this.get<EmployeeDetailResponse>(`${this.endpoint}/${id}`);
    }

    async create(data: {
        nik: string;
        name: string;
        gender: string;
        position: string;
        email: string;
        password: string;
    }): Promise<{ message: string; id: number }> {
        return this.post<{ message: string; id: number }>(this.endpoint, data);
    }

    async update(id: number, data: {
        nik?: string;
        name?: string;
        gender?: string;
        position?: string;
        email?: string;
        password?: string;
    }): Promise<{ message: string }> {
        return this.put<{ message: string }>(this.endpoint + `/${id}`, data);
    }

    async deleteById(id: number): Promise<{ message: string }> {
        return this.delete<{ message: string }>(`${this.endpoint}/${id}`);
    }

    async search(query: string): Promise<EmployeesResponse> {
        return this.get<EmployeesResponse>(`${this.endpoint}/search`, {
            params: { q: query }
        });
    }

    // ====== SCHEDULE MANAGEMENT METHODS ======

    /**
     * Get available schedules for an employee
     */
    async getAvailableSchedules(employeeId: number): Promise<AvailableSchedulesResponse> {
        return this.get<AvailableSchedulesResponse>(`${this.endpoint}/available-schedules/${employeeId}`);
    }

    /**
     * Add a new schedule to an employee
     */
    async addEmployeeSchedule(employeeId: number, data: {
        daily_schedules_id: number;
        work_schedules_id: number;
    }): Promise<{ message: string; data: any }> {
        return this.post<{ message: string; data: any }>(`${this.endpoint}/${employeeId}/schedules`, {
            employee_id: employeeId,
            work_schedules_id: data.work_schedules_id,
            daily_schedules_id: data.daily_schedules_id
        });
    }

    /**
     * Update an existing employee schedule
     */
    async updateEmployeeSchedule(
        employeeId: number,
        scheduleId: number,
        data: {
            daily_schedules_id?: number;
            work_schedules_id?: number;
        }
    ): Promise<{ message: string; data: any }> {
        return this.put<{ message: string; data: any }>(
            `${this.endpoint}/${employeeId}/schedules/${scheduleId}`,
            data
        );
    }

    /**
     * Delete an employee schedule
     */
    async deleteEmployeeSchedule(employeeId: number, scheduleId: number): Promise<{ message: string }> {
        return this.delete<{ message: string }>(`${this.endpoint}/${employeeId}/schedules/${scheduleId}`);
    }
}

export const employeeService = new EmployeeService();