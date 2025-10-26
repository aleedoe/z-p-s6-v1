"use client";
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { EmployeeSchedule, DailySchedule, WorkSchedule } from "@/types/api/employee";
import { Tooltip } from "@heroui/tooltip";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import { employeeService } from "@/services/employee.service";

interface TableEmployeeScheduleProps {
    schedules: EmployeeSchedule[];
    employeeId?: number;
    onScheduleAdded?: () => void;
}

const columns = [
    { name: "DAY", uid: "day_name" },
    { name: "SCHEDULE", uid: "schedule_name" },
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

type FormMode = 'view' | 'add' | 'edit';

const TableEmployeeSchedule: React.FC<TableEmployeeScheduleProps> = ({
    schedules,
    employeeId,
    onScheduleAdded
}) => {
    const [formMode, setFormMode] = useState<FormMode>('view');
    const [dailySchedules, setDailySchedules] = useState<DailySchedule[]>([]);
    const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);

    // Form state
    const [selectedDay, setSelectedDay] = useState<string>("");
    const [selectedSchedule, setSelectedSchedule] = useState<string>("");
    const [editingSchedule, setEditingSchedule] = useState<EmployeeSchedule | null>(null);

    // Fetch available schedules when form is opened
    useEffect(() => {
        if ((formMode === 'add' || formMode === 'edit') && employeeId) {
            fetchAvailableSchedules();
        }
    }, [formMode, employeeId]);

    const fetchAvailableSchedules = async () => {
        if (!employeeId) return;

        try {
            setLoadingSchedules(true);
            const response = await employeeService.getAvailableSchedules(employeeId);
            setDailySchedules(response.daily_schedules);
            setWorkSchedules(response.work_schedules);
        } catch (error: any) {
            console.error('Error fetching available schedules:', error);
            alert(`Failed to load schedules: ${error.message}`);
        } finally {
            setLoadingSchedules(false);
        }
    };

    const handleEdit = (schedule: EmployeeSchedule) => {
        setEditingSchedule(schedule);
        setSelectedDay(schedule.day_id.toString());
        setSelectedSchedule(schedule.schedule_id.toString());
        setFormMode('edit');
    };

    const handleDelete = async (schedule: EmployeeSchedule) => {
        if (!employeeId) {
            alert("Employee ID is missing");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete this schedule?\n\nDay: ${schedule.day_name}\nSchedule: ${schedule.schedule_name}`
        );

        if (!confirmed) return;

        try {
            setDeleting(schedule.employee_schedule_id);
            await employeeService.deleteEmployeeSchedule(
                employeeId,
                schedule.employee_schedule_id
            );

            alert("Schedule deleted successfully!");

            // Notify parent to refresh data
            if (onScheduleAdded) {
                onScheduleAdded();
            }
        } catch (error: any) {
            console.error('Error deleting schedule:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete schedule';
            alert(`Failed to delete schedule: ${errorMessage}`);
        } finally {
            setDeleting(null);
        }
    };

    const handleSave = async () => {
        if (!selectedDay || !selectedSchedule) {
            alert("Please select both day and schedule");
            return;
        }

        if (!employeeId) {
            alert("Employee ID is missing");
            return;
        }

        try {
            setSubmitting(true);

            if (formMode === 'edit' && editingSchedule) {
                // Update existing schedule
                const response = await employeeService.updateEmployeeSchedule(
                    employeeId,
                    editingSchedule.employee_schedule_id,
                    {
                        daily_schedules_id: parseInt(selectedDay),
                        work_schedules_id: parseInt(selectedSchedule)
                    }
                );
                alert(response.message || "Schedule updated successfully!");
            } else {
                // Add new schedule
                const response = await employeeService.addEmployeeSchedule(employeeId, {
                    daily_schedules_id: parseInt(selectedDay),
                    work_schedules_id: parseInt(selectedSchedule)
                });
                alert(response.message || "Schedule added successfully!");
            }

            // Reset form
            handleCancel();

            // Notify parent to refresh data
            if (onScheduleAdded) {
                onScheduleAdded();
            }
        } catch (error: any) {
            console.error('Error saving schedule:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save schedule';
            alert(`Failed to save schedule: ${errorMessage}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setSelectedDay("");
        setSelectedSchedule("");
        setEditingSchedule(null);
        setFormMode('view');
    };

    // Get selected work schedule details for preview
    const selectedWorkSchedule = workSchedules.find(
        ws => ws.id.toString() === selectedSchedule
    );

    const renderCell = React.useCallback((schedule: EmployeeSchedule, columnKey: string) => {
        const cellValue = schedule[columnKey as keyof EmployeeSchedule];

        switch (columnKey) {
            case "day_name":
                return <p className="text-sm font-semibold">{schedule.day_name}</p>;
            case "schedule_name":
                return <p className="text-sm">{schedule.schedule_name}</p>;
            case "start_time":
                return <p className="text-sm">{schedule.start_time}</p>;
            case "end_time":
                return <p className="text-sm">{schedule.end_time}</p>;
            case "tolerance_minutes":
                return <p className="text-sm">{schedule.tolerance_minutes} minutes</p>;
            case "actions":
                return (
                    <div className="relative flex justify-center gap-2">
                        <Tooltip content="Edit schedule">
                            <span
                                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                onClick={() => handleEdit(schedule)}
                            >
                                <EditIcon />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete schedule">
                            <span
                                className={`text-lg text-danger cursor-pointer active:opacity-50 ${
                                    deleting === schedule.employee_schedule_id ? 'opacity-50 pointer-events-none' : ''
                                }`}
                                onClick={() => handleDelete(schedule)}
                            >
                                {deleting === schedule.employee_schedule_id ? (
                                    <Spinner size="sm" color="danger" />
                                ) : (
                                    <DeleteIcon />
                                )}
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, [deleting]);

    return (
        <div className="flex flex-col gap-3">
            {formMode === 'view' ? (
                <>
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-large">Schedule List</h3>
                        <Button color="primary" onPress={() => setFormMode('add')}>
                            Add Schedule
                        </Button>
                    </div>
                    <Card className="shadow-none">
                        <CardBody>
                            {schedules.length === 0 ? (
                                <div className="text-center py-8 text-default-400">
                                    No schedules assigned yet
                                </div>
                            ) : (
                                <Table aria-label="Employee schedule table">
                                    <TableHeader columns={columns}>
                                        {(column) => (
                                            <TableColumn key={column.uid}>{column.name}</TableColumn>
                                        )}
                                    </TableHeader>
                                    <TableBody items={schedules}>
                                        {(item) => (
                                            <TableRow key={`${item.day_id}-${item.schedule_id}`}>
                                                {(columnKey) => (
                                                    <TableCell>{renderCell(item, columnKey as string)}</TableCell>
                                                )}
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardBody>
                    </Card>
                </>
            ) : (
                <>
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-large">
                            {formMode === 'edit' ? 'Edit Schedule' : 'Add New Schedule'}
                        </h3>
                        <div className="flex gap-2">
                            <Button
                                variant="light"
                                color="danger"
                                onPress={handleCancel}
                                isDisabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleSave}
                                isLoading={submitting}
                                isDisabled={!selectedDay || !selectedSchedule || submitting}
                            >
                                {formMode === 'edit' ? 'Update' : 'Save'}
                            </Button>
                        </div>
                    </div>

                    <Card className="shadow-none mt-2">
                        <CardBody className="flex flex-col gap-4">
                            {loadingSchedules ? (
                                <div className="flex justify-center py-8">
                                    <Spinner label="Loading available schedules..." />
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Day Selector */}
                                        <div className="flex-1">
                                            <Select
                                                label="Hari"
                                                placeholder="Pilih hari"
                                                selectedKeys={selectedDay ? [selectedDay] : []}
                                                onSelectionChange={(keys) => {
                                                    const value = Array.from(keys)[0] as string;
                                                    setSelectedDay(value);
                                                }}
                                                isRequired
                                            >
                                                {dailySchedules.map((day) => (
                                                    <SelectItem key={day.id.toString()}>
                                                        {day.name}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </div>

                                        {/* Work Schedule Selector */}
                                        <div className="flex-1">
                                            <Select
                                                label="Jadwal Kerja"
                                                placeholder="Pilih jadwal kerja"
                                                selectedKeys={selectedSchedule ? [selectedSchedule] : []}
                                                onSelectionChange={(keys) => {
                                                    const value = Array.from(keys)[0] as string;
                                                    setSelectedSchedule(value);
                                                }}
                                                isRequired
                                            >
                                                {workSchedules.map((schedule) => (
                                                    <SelectItem
                                                        key={schedule.id.toString()}
                                                        textValue={schedule.name}
                                                    >
                                                        {schedule.name} ({schedule.start_time} - {schedule.end_time})
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Schedule Details Preview */}
                                    {selectedWorkSchedule && (
                                        <Card className="bg-default-100">
                                            <CardBody>
                                                <h4 className="text-sm font-semibold mb-2">Schedule Details:</h4>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-default-500">Start Time:</span>
                                                        <p className="font-medium">{selectedWorkSchedule.start_time}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-default-500">End Time:</span>
                                                        <p className="font-medium">{selectedWorkSchedule.end_time}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-default-500">Tolerance:</span>
                                                        <p className="font-medium">{selectedWorkSchedule.tolerance_minutes} minutes</p>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    )}
                                </>
                            )}
                        </CardBody>
                    </Card>
                </>
            )}
        </div>
    );
};

export default TableEmployeeSchedule;