"use client";

import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";

import { EmployeeDetailResponse, EmployeeSchedule } from "@/types/api/employee";
import TabEmployeeDetails from "./TabEmployeeDetails";
import TableEmployeeSchedule from "./tabEmployeeSchedule";
import { ScrollShadow } from "@heroui/scroll-shadow";

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
    onSuccess,
}) => {
    const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);

    useEffect(() => {
        if (employee?.schedules) {
            setSchedules(employee.schedules);
        }
    }, [employee]);

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
                                <Tabs aria-label="Employee tabs">
                                    <Tab key="details" title="Details">
                                        <Card>
                                            <CardBody>
                                                <ScrollShadow hideScrollBar className="w-full max-h-[50vh]">
                                                    <TabEmployeeDetails
                                                        employee={employee}
                                                        onClose={onClose}
                                                        onSuccess={onSuccess}
                                                    />
                                                </ScrollShadow>
                                            </CardBody>
                                        </Card>
                                    </Tab>
                                    <Tab key="schedules" title="Schedules">
                                        <ScrollShadow hideScrollBar className="w-full max-h-[50vh]">
                                            <TableEmployeeSchedule schedules={schedules} />
                                        </ScrollShadow>
                                    </Tab>
                                </Tabs>
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
