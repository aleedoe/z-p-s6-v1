"use client";

import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import React, { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { workScheduleService } from "@/services/workSchedule.service";
import { WorkScheduleDetailResponse } from "@/types/api/workSchedule";

interface ModalWorkScheduleProps {
    isOpen: boolean;
    onClose: () => void;
    schedule: WorkScheduleDetailResponse | null;
    loading?: boolean;
    onSuccess?: () => void;
}

const ModalWorkSchedule: React.FC<ModalWorkScheduleProps> = ({
    isOpen,
    onClose,
    schedule,
    loading = false,
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

    useEffect(() => {
        if (schedule) {
            setFormData({
                name: schedule.name,
                start_time: schedule.start_time,
                end_time: schedule.end_time,
                tolerance_minutes: schedule.tolerance_minutes.toString()
            });
        }
    }, [schedule]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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

    const handleSubmit = async () => {
        if (!validateForm() || !schedule) return;

        try {
            setSubmitting(true);
            await workScheduleService.update(schedule.id, {
                name: formData.name,
                start_time: formData.start_time,
                end_time: formData.end_time,
                tolerance_minutes: parseInt(formData.tolerance_minutes)
            });
            alert("Work schedule updated successfully");
            onSuccess?.();
            onClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to update work schedule";
            alert(`Error: ${errorMessage}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    return (
        <Modal isOpen={isOpen} size="2xl" onClose={handleClose}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Edit Work Schedule
                        </ModalHeader>
                        <ModalBody>
                            {loading ? (
                                <div className="flex justify-center items-center min-h-[300px]">
                                    <Spinner size="lg" label="Loading schedule details..." />
                                </div>
                            ) : (
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
                                            {schedule?.employee_count !== undefined && (
                                                <div className="p-3 bg-default-100 rounded-lg">
                                                    <p className="text-sm text-default-600">
                                                        <span className="font-semibold">Assigned to:</span> {schedule.employee_count} employee(s)
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleSubmit}
                                isLoading={submitting}
                                isDisabled={loading}
                            >
                                Update Schedule
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default ModalWorkSchedule;