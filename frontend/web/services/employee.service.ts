import { Employee, EmployeesResponse, PaginationParams } from "@/types/api/employee";
import { BaseService } from "./base.service";

class EmployeeService extends BaseService {
    private readonly endpoint = '/admin/employees';

    async getAll(params?: PaginationParams): Promise<EmployeesResponse> {
        return this.get<EmployeesResponse>(this.endpoint, { params });
    }

    async getById(id: number): Promise<Employee> {
        return this.get<Employee>(`${this.endpoint}/${id}`);
    }

    async create(data: Omit<Employee, 'id'>): Promise<Employee> {
        return this.post<Employee>(this.endpoint, data);
    }

    async update(id: number, data: Partial<Employee>): Promise<Employee> {
        return this.put<Employee>(`${this.endpoint}/${id}`, data);
    }

    async partialUpdate(id: number, data: Partial<Employee>): Promise<Employee> {
        return this.patch<Employee>(`${this.endpoint}/${id}`, data);
    }

    // async delete(id: number): Promise<void> {
    //     return this.delete<void>(`${this.endpoint}/${id}`);
    // }

    async search(query: string): Promise<EmployeesResponse> {
        return this.get<EmployeesResponse>(`${this.endpoint}/search`, {
            params: { q: query }
        });
    }
}

export const employeeService = new EmployeeService();