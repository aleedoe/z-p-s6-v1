"use client";

import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import React, { useEffect, useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { EmployeeDetailResponse, EmployeeSchedule } from "@/types/api/employee";
import { employeeService } from "@/services/employee.service";
import { Spinner } from "@heroui/spinner";
import TableEmployeeSchedule from "./tableEmployeeSchedule";

interface ModalEmployeeProps {
    isOpen: boolean;
    onClose: () => void;
    employee?: EmployeeDetailResponse | null;
    loading?: boolean;
    onSuccess?: () => void;
}

const ModalEmployee: React.FC<ModalEmployeeProps> = ({
    isOpen,
    onClose,
    employee,
    loading = false,
    onSuccess
}) => {
    const [formData, setFormData] = useState({
        nik: "",
        name: "",
        email: "",
        position: "",
        gender: "Male",
        password: ""
    });
    const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState(new Set(["Male"]));

    useEffect(() => {
        if (employee) {
            setFormData({
                nik: employee.nik || "",
                name: employee.name || "",
                email: employee.email || "",
                position: employee.position || "",
                gender: employee.gender || "Male",
                password: ""
            });
            setSchedules(employee.schedules || []);
            setSelectedKeys(new Set([employee.gender || "Male"]));
        }
    }, [employee]);

    const selectedValue = React.useMemo(
        () => Array.from(selectedKeys).join(", "),
        [selectedKeys]
    );

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenderChange = (keys: any) => {
        setSelectedKeys(keys);
        const gender = Array.from(keys)[0] as string;
        setFormData(prev => ({ ...prev, gender }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!employee) return;

        try {
            setSubmitting(true);
            const updateData: any = {
                nik: formData.nik,
                name: formData.name,
                email: formData.email,
                position: formData.position,
                gender: formData.gender,
            };

            // Only include password if it's been filled
            if (formData.password) {
                updateData.password = formData.password;
            }

            await employeeService.update(employee.id, updateData);
            alert('Employee updated successfully');
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            alert(`Failed to update employee: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} size="4xl" onClose={onClose}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Edit Employee
                        </ModalHeader>
                        <ModalBody>
                            {loading ? (
                                <div className="flex justify-center items-center min-h-[300px]">
                                    <Spinner size="lg" label="Loading employee data..." />
                                </div>
                            ) : (
                                <div className="flex w-full flex-col">
                                    <Tabs aria-label="Employee tabs">
                                        <Tab key="details" title="Details">
                                            <Card>
                                                <CardBody>
                                                    <form className="w-full space-y-4" onSubmit={onSubmit}>
                                                        <Input
                                                            isRequired
                                                            label="Email"
                                                            labelPlacement="outside"
                                                            name="email"
                                                            placeholder="Enter email"
                                                            type="email"
                                                            value={formData.email}
                                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                                        />
                                                        <Input
                                                            isRequired
                                                            label="Name"
                                                            labelPlacement="outside"
                                                            name="name"
                                                            placeholder="Enter name"
                                                            type="text"
                                                            value={formData.name}
                                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                                        />
                                                        <Input
                                                            isRequired
                                                            label="NIK"
                                                            labelPlacement="outside"
                                                            name="nik"
                                                            placeholder="Enter NIK"
                                                            type="text"
                                                            value={formData.nik}
                                                            onChange={(e) => handleInputChange("nik", e.target.value)}
                                                        />
                                                        <Input
                                                            isRequired
                                                            label="Position"
                                                            labelPlacement="outside"
                                                            name="position"
                                                            placeholder="Enter position"
                                                            type="text"
                                                            value={formData.position}
                                                            onChange={(e) => handleInputChange("position", e.target.value)}
                                                        />
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-sm font-medium">Gender</label>
                                                            <Dropdown>
                                                                <DropdownTrigger>
                                                                    <Button className="capitalize justify-start" variant="bordered">
                                                                        {selectedValue}
                                                                    </Button>
                                                                </DropdownTrigger>
                                                                <DropdownMenu
                                                                    disallowEmptySelection
                                                                    aria-label="Gender selection"
                                                                    selectedKeys={selectedKeys}
                                                                    selectionMode="single"
                                                                    variant="flat"
                                                                    onSelectionChange={handleGenderChange}
                                                                >
                                                                    <DropdownItem key="Male">Male</DropdownItem>
                                                                    <DropdownItem key="Female">Female</DropdownItem>
                                                                </DropdownMenu>
                                                            </Dropdown>
                                                        </div>
                                                        <Input
                                                            label="Password"
                                                            labelPlacement="outside"
                                                            name="password"
                                                            placeholder="Leave empty to keep current password"
                                                            type="password"
                                                            value={formData.password}
                                                            onChange={(e) => handleInputChange("password", e.target.value)}
                                                            description="Leave empty if you don't want to change password"
                                                        />
                                                        <Button
                                                            type="submit"
                                                            color="primary"
                                                            isLoading={submitting}
                                                            className="w-full"
                                                        >
                                                            Update Employee
                                                        </Button>
                                                    </form>
                                                </CardBody>
                                            </Card>
                                        </Tab>
                                        <Tab key="schedules" title="Schedules">
                                            <Card>
                                                <CardBody>
                                                    <TableEmployeeSchedule schedules={schedules} />
                                                </CardBody>
                                            </Card>
                                        </Tab>
                                    </Tabs>
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Close
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default ModalEmployee;