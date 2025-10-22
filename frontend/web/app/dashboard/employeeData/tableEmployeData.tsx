"use client"

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Spinner } from "@heroui/spinner";
import { Employee } from "@/types/api/employee";
import { employeeService } from "@/services/employee.service";

// Kolom tabel
const columns = [
    { name: "NO", uid: "no" },
    { name: "NIK", uid: "nik" },
    { name: "NAME", uid: "name" },
    { name: "POSITION", uid: "position" },
    { name: "GENDER", uid: "gender" },
    { name: "ACTIONS", uid: "actions" },
];

// Warna gender (opsional)
const genderColorMap: Record<string, "primary" | "secondary"> = {
    Male: "primary",
    Female: "secondary",
};

// Icons
const EyeIcon = (props: any) => (
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
            d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
        <path
            d="M9.99999 16.8916C12.9417 16.8916 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00831 17.5917 7.83331C15.6833 4.83331 12.9417 3.09998 9.99999 3.09998C7.05833 3.09998 4.31666 4.83331 2.40833 7.83331C1.65833 9.00831 1.65833 10.9833 2.40833 12.1583C4.31666 15.1583 7.05833 16.8916 9.99999 16.8916Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
    </svg>
);

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

const TableEmployeeData: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data dari API
    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await employeeService.getAll();
            setEmployees(response.employees);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch employees');
            console.error('Error fetching employees:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handler untuk actions
    const handleView = (employee: Employee) => {
        console.log('View employee:', employee);
        // Implementasi logic untuk view detail
    };

    const handleEdit = (employee: Employee) => {
        console.log('Edit employee:', employee);
        // Implementasi logic untuk edit
    };

    const handleDelete = async (employee: Employee) => {
        if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
            try {
                // await employeeService.delete(employee.id);
                // Refresh data setelah delete
                setEmployees(employees.filter(emp => emp.id !== employee.id));
                console.log('Deleted employee:', employee);
            } catch (err: any) {
                alert(`Failed to delete employee: ${err.message}`);
            }
        }
    };

    const renderCell = React.useCallback((employee: Employee, columnKey: string, index: number) => {
        const cellValue = employee[columnKey as keyof Employee];

        switch (columnKey) {
            case "no":
                return <p className="text-sm">{index + 1}</p>;
            case "nik":
                return <p className="text-sm font-semibold">{employee.nik}</p>;
            case "name":
                return (
                    <div className="flex flex-col">
                        <p className="text-sm font-semibold">{employee.name}</p>
                        <p className="text-xs text-default-400">{employee.email}</p>
                    </div>
                );
            case "position":
                return (
                    <p className="text-sm font-medium capitalize">{employee.position}</p>
                );
            case "gender":
                return (
                    <Chip
                        className="capitalize"
                        color={genderColorMap[employee.gender] || "default"}
                        size="sm"
                        variant="flat"
                    >
                        {employee.gender}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex justify-center gap-2">
                        <Tooltip content="Edit employee">
                            <span
                                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                onClick={() => handleEdit(employee)}
                            >
                                <EditIcon />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete employee">
                            <span
                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                onClick={() => handleDelete(employee)}
                            >
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, [employees]);

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner size="lg" label="Loading employees..." />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-danger text-lg font-semibold mb-2">Error</p>
                    <p className="text-default-500">{error}</p>
                    <button
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
                        onClick={fetchEmployees}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (employees.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <p className="text-default-500 text-lg">No employees found</p>
            </div>
        );
    }

    return (
        <Table aria-label="Employee table with data from API">
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
            <TableBody items={employees}>
                {(item) => (
                    <TableRow key={item.id}>
                        {(columnKey) => (
                            <TableCell>
                                {renderCell(
                                    item,
                                    columnKey as string,
                                    employees.findIndex(emp => emp.id === item.id)
                                )}
                            </TableCell>
                        )}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

export default TableEmployeeData;