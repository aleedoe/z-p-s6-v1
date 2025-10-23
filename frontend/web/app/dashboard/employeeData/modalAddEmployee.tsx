"use client";

import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import React, { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { employeeService } from "@/services/employee.service";
import { ScrollShadow } from "@heroui/scroll-shadow";

interface ModalAddEmployeeProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const ModalAddEmployee: React.FC<ModalAddEmployeeProps> = ({
    isOpen,
    onClose,
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
    const [submitting, setSubmitting] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState(new Set(["Male"]));
    const [errors, setErrors] = useState<Record<string, string>>({});

    const selectedValue = React.useMemo(
        () => Array.from(selectedKeys).join(", "),
        [selectedKeys]
    );

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleGenderChange = (keys: any) => {
        setSelectedKeys(keys);
        const gender = Array.from(keys)[0] as string;
        setFormData(prev => ({ ...prev, gender }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.nik.trim()) {
            newErrors.nik = "NIK is required";
        }
        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!formData.position.trim()) {
            newErrors.position = "Position is required";
        }
        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            nik: "",
            name: "",
            email: "",
            position: "",
            gender: "Male",
            password: ""
        });
        setSelectedKeys(new Set(["Male"]));
        setErrors({});
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            await employeeService.create({
                nik: formData.nik,
                name: formData.name,
                email: formData.email,
                position: formData.position,
                gender: formData.gender,
                password: formData.password
            });
            alert('Employee created successfully');
            resetForm();
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create employee';
            alert(`Error: ${errorMessage}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setSubmitting(true);
            await employeeService.create(formData);
            alert("Employee created successfully");
            resetForm();
            onSuccess?.();
            onClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to create employee";
            alert(`Error: ${errorMessage}`);
        } finally {
            setSubmitting(false);
        }
    };


    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} size="2xl" onClose={handleClose}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Add New Employee
                        </ModalHeader>
                        <ModalBody>
                            <Card>
                                <CardBody>
                                    <ScrollShadow hideScrollBar className="w-full max-h-[60vh]">
                                    <form className="w-full space-y-4 flex flex-col gap-2" onSubmit={onSubmit}>
                                        <Input
                                            isRequired
                                            label="NIK"
                                            labelPlacement="outside"
                                            name="nik"
                                            placeholder="Enter NIK"
                                            type="text"
                                            value={formData.nik}
                                            onChange={(e) => handleInputChange("nik", e.target.value)}
                                            isInvalid={!!errors.nik}
                                            errorMessage={errors.nik}
                                        />
                                        <Input
                                            isRequired
                                            label="Name"
                                            labelPlacement="outside"
                                            name="name"
                                            placeholder="Enter full name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            isInvalid={!!errors.name}
                                            errorMessage={errors.name}
                                        />
                                        <Input
                                            isRequired
                                            label="Email"
                                            labelPlacement="outside"
                                            name="email"
                                            placeholder="Enter email address"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            isInvalid={!!errors.email}
                                            errorMessage={errors.email}
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
                                            isInvalid={!!errors.position}
                                            errorMessage={errors.position}
                                        />
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium">
                                                Gender <span className="text-danger">*</span>
                                            </label>
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
                                            isRequired
                                            label="Password"
                                            labelPlacement="outside"
                                            name="password"
                                            placeholder="Enter password (min. 6 characters)"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => handleInputChange("password", e.target.value)}
                                            isInvalid={!!errors.password}
                                            errorMessage={errors.password}
                                        />
                                        <Button
                                            color="primary"
                                            type="submit" // ✅ ini kuncinya
                                            isLoading={submitting}
                                            className="hidden"
                                        >
                                            Create Employee
                                        </Button>
                                    </form>
                                    </ScrollShadow>
                                </CardBody>
                            </Card>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleSubmit} // ✅ tidak pakai FormEvent
                                isLoading={submitting}
                            >
                                Create Employee
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default ModalAddEmployee;