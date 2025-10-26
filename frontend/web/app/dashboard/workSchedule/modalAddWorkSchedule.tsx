"use client";

import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import React, { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { workScheduleService } from "@/services/workSchedule.service";

interface ModalAddWorkScheduleProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const ModalAddWorkSchedule: React.FC<ModalAddWorkScheduleProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [formData, setFormData] = useState({
        name: "",
        start_time: "",
        end_time: "",
        tolerance_minutes: "0"
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Schedule name is required";
        }
        if (!formData.start_time) {
            newErrors.start_time = "Start time is required";
        }
        if (!formData.end_time) {
            newErrors.end_time = "End time is required";
        }

        // Validate start time must be earlier than end time
        if (formData.start_time && formData.end_time) {
            if (formData.start_time >= formData.end_time) {
                newErrors.end_time = "End time must be later than start time";
            }
        }

        const tolerance = parseInt(formData.tolerance_minutes);
        if (isNaN(tolerance) || tolerance < 0) {
            newErrors.tolerance_minutes = "Tolerance must be a positive number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            name: "",
            start_time: "",
            end_time: "",
            tolerance_minutes: "0"
        });
        setErrors({});
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setSubmitting(true);
            await workScheduleService.create({
                name: formData.name,
                start_time: formData.start_time,
                end_time: formData.end_time,
                tolerance_minutes: parseInt(formData.tolerance_minutes)
            });
            alert("Work schedule created successfully");
            resetForm();
            onSuccess?.();
            onClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to create work schedule";
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
                            Add New Work Schedule
                        </ModalHeader>
                        <ModalBody>
                            <Card>
                                <CardBody>
                                    <div className="w-full space-y-4 flex flex-col gap-2">
                                        <Input
                                            isRequired
                                            label="Schedule Name"
                                            labelPlacement="outside"
                                            name="name"
                                            placeholder="e.g., Morning Shift, Night Shift"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            isInvalid={!!errors.name}
                                            errorMessage={errors.name}
                                        />
                                        <Input
                                            isRequired
                                            label="Start Time"
                                            labelPlacement="outside"
                                            name="start_time"
                                            placeholder="HH:MM"
                                            type="time"
                                            value={formData.start_time}
                                            onChange={(e) => handleInputChange("start_time", e.target.value)}
                                            isInvalid={!!errors.start_time}
                                            errorMessage={errors.start_time}
                                        />
                                        <Input
                                            isRequired
                                            label="End Time"
                                            labelPlacement="outside"
                                            name="end_time"
                                            placeholder="HH:MM"
                                            type="time"
                                            value={formData.end_time}
                                            onChange={(e) => handleInputChange("end_time", e.target.value)}
                                            isInvalid={!!errors.end_time}
                                            errorMessage={errors.end_time}
                                        />
                                        <Input
                                            isRequired
                                            label="Tolerance (Minutes)"
                                            labelPlacement="outside"
                                            name="tolerance_minutes"
                                            placeholder="e.g., 15"
                                            type="number"
                                            min="0"
                                            value={formData.tolerance_minutes}
                                            onChange={(e) => handleInputChange("tolerance_minutes", e.target.value)}
                                            isInvalid={!!errors.tolerance_minutes}
                                            errorMessage={errors.tolerance_minutes}
                                            description="Late tolerance in minutes"
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleSubmit}
                                isLoading={submitting}
                            >
                                Create Schedule
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default ModalAddWorkSchedule;