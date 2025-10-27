import { AttendancesResponse } from "@/types/api/attendance";
import { BaseService } from "./base.service";

class AttendanceService extends BaseService {
    private readonly endpoint = '/admin/attendance';

    async getAll(): Promise<AttendancesResponse> {
        return this.get<AttendancesResponse>(this.endpoint);
    }
}

export const attendanceService = new AttendanceService();