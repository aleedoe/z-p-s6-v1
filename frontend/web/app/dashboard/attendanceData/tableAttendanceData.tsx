"use client"

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Attendance } from "@/types/api/attendance";
import { attendanceService } from "@/services/attendance.service";

const columns = [
    { name: "NO", uid: "no" },
    { name: "EMPLOYEE NAME", uid: "employee_name" },
    { name: "POSITION", uid: "position" },
    { name: "ATTENDANCE DATE", uid: "attendance_date" },
    { name: "STATUS", uid: "status" },
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
                hour12: false
            })
        };
    };

    const getAttendanceStatus = (dateString: string) => {
        const date = new Date(dateString);
        const hour = date.getHours();

        // Simple logic: before 9 AM = On Time, after = Late
        if (hour < 9) {
            return { status: "On Time", color: "success" as const };
        } else if (hour < 10) {
            return { status: "Late", color: "warning" as const };
        } else {
            return { status: "Very Late", color: "danger" as const };
        }
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
                        <p className="text-xs text-default-400">ID: {attendance.employee_id}</p>
                    </div>
                );
            case "position":
                return (
                    <p className="text-sm font-medium capitalize">{attendance.position}</p>
                );
            case "attendance_date":
                const { date, time } = formatDateTime(attendance.attendance_date);
                return (
                    <div className="flex flex-col">
                        <p className="text-sm font-semibold">{date}</p>
                        <p className="text-xs text-default-400">{time}</p>
                    </div>
                );
            case "status":
                const { status, color } = getAttendanceStatus(attendance.attendance_date);
                return (
                    <Chip
                        className="capitalize"
                        color={color}
                        size="sm"
                        variant="flat"
                    >
                        {status}
                    </Chip>
                );
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
                            align={column.uid === "status" ? "center" : "start"}
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