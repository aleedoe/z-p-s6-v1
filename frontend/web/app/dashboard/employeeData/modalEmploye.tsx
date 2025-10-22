"use client";

import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import React from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import App from "./tableEmployeeSchedule";


interface ModalEmployeeProps {
    isOpen: boolean;
    onClose: () => void;
    employee?: any; // bisa ganti ke tipe Employee jika ada
}

const ModalEmployee: React.FC<ModalEmployeeProps> = ({ isOpen, onClose, employee }) => {
    return (
        <Modal isOpen={isOpen} size="4xl" onClose={onClose}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Edit Employee
                        </ModalHeader>
                        <ModalBody>
                            <div className="flex w-full flex-col">
                                <Tabs aria-label="Options">
                                    <Tab key="photos" title="Photos">
                                        <Card>
                                            <CardBody>
                                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                            </CardBody>
                                        </Card>
                                    </Tab>
                                    <Tab key="music" title="Music">
                                        <App />
                                    </Tab>
                                </Tabs>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Close
                            </Button>
                            <Button color="primary" onPress={onClose}>
                                Save Changes
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default ModalEmployee;
