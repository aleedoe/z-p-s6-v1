import React from "react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { EmployeeSchedule } from "@/types/api/employee";

interface TableEmployeeScheduleProps {
    schedules: EmployeeSchedule[];
}

const columns = [
    { name: "DAY", uid: "day_name" },
    { name: "SCHEDULE", uid: "schedule_name" },
    { name: "START TIME", uid: "start_time" },
    { name: "END TIME", uid: "end_time" },
    { name: "TOLERANCE", uid: "tolerance_minutes" },
];

const TableEmployeeSchedule: React.FC<TableEmployeeScheduleProps> = ({ schedules }) => {
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
            default:
                return cellValue;
        }
    }, []);

    if (schedules.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <p className="text-default-500">No schedules assigned</p>
            </div>
        );
    }

    return (
        <Table aria-label="Employee schedule table">
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn key={column.uid} align="start">
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody items={schedules}>
                {(item) => (
                    <TableRow key={`${item.day_id}-${item.schedule_id}`}>
                        {(columnKey) => (
                            <TableCell>
                                {renderCell(item, columnKey as string)}
                            </TableCell>
                        )}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

export default TableEmployeeSchedule;