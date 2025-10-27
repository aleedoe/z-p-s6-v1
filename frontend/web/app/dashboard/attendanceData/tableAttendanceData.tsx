"use client"

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Spinner } from "@heroui/spinner";
import { Attendance } from "@/types/api/attendance";
import { attendanceService } from "@/services/attendance.service";

const columns = [
    { name: "NO", uid: "no" },
    { name: "EMPLOYEE NAME", uid: "employee_name" },
    { name: "ATTENDANCE DATE", uid: "attendance_date" },
    { name: "CHECK-IN TIME", uid: "time" },
];

const TableAttendanceData: React.FC = () => {
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAttendances();
    }, []);

    const fetchAttendances = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await attendanceService.getAll();
            setAttendances(response.attendances);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch attendance records');
            console.error('Error fetching attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            })
        };
    };

    const renderCell = React.useCallback((attendance: Attendance, columnKey: string, index: number) => {
        const cellValue = attendance[columnKey as keyof Attendance];

        switch (columnKey) {
            case "no":
                return <p className="text-sm">{index + 1}</p>;
            case "employee_name":
                return (
                    <div className="flex flex-col">
                        <p className="text-sm font-semibold">{attendance.employee_name}</p>
                        <p className="text-xs text-default-400">{attendance.position}</p>
                    </div>
                );
            case "attendance_date":
                const { date } = formatDateTime(attendance.attendance_date);
                return <p className="text-sm">{date}</p>;
            case "time":
                const { time } = formatDateTime(attendance.attendance_date);
                return <p className="text-sm font-mono">{time}</p>;
            default:
                return cellValue;
        }
    }, [attendances]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner size="lg" label="Loading attendance records..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-danger text-lg font-semibold mb-2">Error</p>
                    <p className="text-default-500">{error}</p>
                    <button
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
                        onClick={fetchAttendances}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (attendances.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <p className="text-default-500 text-lg">No attendance records found</p>
            </div>
        );
    }

    return (
        <>
            <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-default-500">
                    Total Records: <span className="font-semibold">{attendances.length}</span>
                </p>
            </div>
            <Table aria-label="Attendance table with data from API">
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align="start"
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={attendances}>
                    {(item) => (
                        <TableRow key={item.attendance_id}>
                            {(columnKey) => (
                                <TableCell>
                                    {renderCell(
                                        item,
                                        columnKey as string,
                                        attendances.findIndex(att => att.attendance_id === item.attendance_id)
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    );
};

export default TableAttendanceData;