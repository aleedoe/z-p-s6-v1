import { Employee, EmployeesResponse, PaginationParams, EmployeeDetailResponse } from "@/types/api/employee";
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
}

export const employeeService = new EmployeeService();