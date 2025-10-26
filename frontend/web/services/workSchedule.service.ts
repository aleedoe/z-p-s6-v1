import { WorkScheduleDetailResponse, WorkSchedulesResponse } from "@/types/api/workSchedule";
import { BaseService } from "./base.service";

class WorkScheduleService extends BaseService {
    private readonly endpoint = '/admin/work-schedulesOP';

    async getAll(): Promise<WorkSchedulesResponse> {
        return this.get<WorkSchedulesResponse>(this.endpoint);
    }

    async getById(id: number): Promise<WorkScheduleDetailResponse> {
        return this.get<WorkScheduleDetailResponse>(`${this.endpoint}/${id}`);
    }

    async create(data: {
        name: string;
        start_time: string;
        end_time: string;
        tolerance_minutes: number;
    }): Promise<{ message: string; id: number }> {
        return this.post<{ message: string; id: number }>(this.endpoint, data);
    }

    async update(id: number, data: {
        name?: string;
        start_time?: string;
        end_time?: string;
        tolerance_minutes?: number;
    }): Promise<{ message: string }> {
        return this.put<{ message: string }>(`${this.endpoint}/${id}`, data);
    }

    async deleteById(id: number): Promise<{ message: string }> {
        return this.delete<{ message: string }>(`${this.endpoint}/${id}`);
    }
}

export const workScheduleService = new WorkScheduleService();