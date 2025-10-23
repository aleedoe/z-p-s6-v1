import React from "react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { EmployeeSchedule } from "@/types/api/employee";
import { Tooltip } from "@heroui/tooltip";
import { Card, CardBody } from "@heroui/card";

interface TableEmployeeScheduleProps {
    schedules: EmployeeSchedule[];
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
            case "actions":
                return (
                    <div className="relative flex justify-center gap-2">
                        <Tooltip content="Edit employee">
                            <span
                                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                onClick={() => console.log("Edit")}
                            >
                                <EditIcon />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete employee">
                            <span
                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                onClick={() => console.log("Delete")}
                            >
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
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
        <>
            <Card>
                <CardBody>
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
                </CardBody>
            </Card>
        </>
    );
};

export default TableEmployeeSchedule;