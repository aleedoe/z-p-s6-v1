"use client"

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Spinner } from "@heroui/spinner";
import { WorkSchedule, WorkScheduleDetailResponse } from "@/types/api/workSchedule";
import { workScheduleService } from "@/services/workSchedule.service";
import ModalWorkSchedule from "./modalEditWorkSchedule";
import ModalDeleteConfirm from "./modalDeleteConfirm";
import ModalAttendanceQr from "./modalAttendanceQr";
import { ReportsIcon } from "@/components/icons/sidebar/reports-icon";

const columns = [
    { name: "NO", uid: "no" },
    { name: "NAME", uid: "name" },
    { name: "START TIME", uid: "start_time" },
    { name: "END TIME", uid: "end_time" },
    { name: "TOLERANCE", uid: "tolerance_minutes" },
    { name: "ACTIONS", uid: "actions" },
];

const EditIcon = (props: any) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        {...props}
    >
        <path
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
    </svg>
);

const DeleteIcon = (props: any) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 20 20"
        width="1em"
        {...props}
    >
        <path
            d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
        <path
            d="M7.08331 4.14169L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
        <path
            d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
        <path
            d="M8.60834 13.75H11.3833"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
        <path
            d="M7.91669 10.4167H12.0834"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
    </svg>
);

const TableWorkSchedule: React.FC = () => {
    const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<WorkScheduleDetailResponse | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState<WorkSchedule | null>(null);
    
    // States for Attendance Modal
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedAttendanceSchedule, setSelectedAttendanceSchedule] = useState<WorkSchedule | null>(null);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await workScheduleService.getAll();
            setSchedules(response.work_schedules);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch work schedules');
            console.error('Error fetching work schedules:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (schedule: WorkSchedule) => {
        try {
            setLoadingDetail(true);
            setIsEditModalOpen(true);
            const detail = await workScheduleService.getById(schedule.id);
            setSelectedSchedule(detail);
        } catch (err: any) {
            console.error('Error fetching schedule detail:', err);
            alert(`Failed to load schedule details: ${err.message}`);
            setIsEditModalOpen(false);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleDelete = (schedule: WorkSchedule) => {
        setScheduleToDelete(schedule);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!scheduleToDelete) return;

        try {
            await workScheduleService.deleteById(scheduleToDelete.id);
            setSchedules(schedules.filter(sch => sch.id !== scheduleToDelete.id));
            setIsDeleteModalOpen(false);
            setScheduleToDelete(null);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message;
            alert(`Failed to delete schedule: ${errorMessage}`);
        }
    };

    const handleAttendance = (schedule: WorkSchedule) => {
        setSelectedAttendanceSchedule(schedule);
        setIsAttendanceModalOpen(true);
    };


    const handleModalClose = () => {
        setIsEditModalOpen(false);
        setSelectedSchedule(null);
    };

    const handleAttendanceModalClose = () => {
        setIsAttendanceModalOpen(false);
        setSelectedAttendanceSchedule(null);
    }

    const handleUpdateSuccess = () => {
        fetchSchedules();
        handleModalClose();
    };

    const renderCell = React.useCallback((schedule: WorkSchedule, columnKey: string, index: number) => {
        const cellValue = schedule[columnKey as keyof WorkSchedule];

        switch (columnKey) {
            case "no":
                return <p className="text-sm">{index + 1}</p>;
            case "name":
                return <p className="text-sm font-semibold">{schedule.name}</p>;
            case "start_time":
                return <p className="text-sm">{schedule.start_time}</p>;
            case "end_time":
                return <p className="text-sm">{schedule.end_time}</p>;
            case "tolerance_minutes":
                return (
                    <Chip
                        size="sm"
                        variant="flat"
                        color={schedule.tolerance_minutes > 0 ? "success" : "default"}
                    >
                        {schedule.tolerance_minutes} min
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex justify-center gap-2">
                        {/* Edit */}
                        <Tooltip content="Edit schedule">
                            <span
                                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                onClick={() => handleEdit(schedule)}
                            >
                                <EditIcon />
                            </span>
                        </Tooltip>

                        {/* Delete */}
                        <Tooltip color="danger" content="Delete schedule">
                            <span
                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                onClick={() => handleDelete(schedule)}
                            >
                                <DeleteIcon />
                            </span>
                        </Tooltip>

                        {/* Attendance */}
                        <Tooltip color="primary" content="Make Attendance">
                            <span
                                className="text-lg text-primary cursor-pointer active:opacity-50"
                                onClick={() => handleAttendance(schedule)}
                            >
                                <ReportsIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, [schedules]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner size="lg" label="Loading work schedules..." />
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
                        onClick={fetchSchedules}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (schedules.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <p className="text-default-500 text-lg">No work schedules found</p>
            </div>
        );
    }

    return (
        <>
            <Table aria-label="Work schedule table with data from API">
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={column.uid === "actions" ? "center" : "start"}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={schedules}>
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => (
                                <TableCell>
                                    {renderCell(
                                        item,
                                        columnKey as string,
                                        schedules.findIndex(sch => sch.id === item.id)
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            
            <ModalWorkSchedule
                isOpen={isEditModalOpen}
                onClose={handleModalClose}
                schedule={selectedSchedule}
                loading={loadingDetail}
                onSuccess={handleUpdateSuccess}
            />
            
            <ModalDeleteConfirm
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                scheduleName={scheduleToDelete?.name || ''}
            />

            <ModalAttendanceQr
                isOpen={isAttendanceModalOpen}
                onClose={handleAttendanceModalClose}
                schedule={selectedAttendanceSchedule}
            />
        </>
    );
};

export default TableWorkSchedule;
