"use client";

import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import React from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import App from "./tableEmployeeSchedule";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";


interface ModalEmployeeProps {
    isOpen: boolean;
    onClose: () => void;
    employee?: any; // bisa ganti ke tipe Employee jika ada
}

const ModalEmployee: React.FC<ModalEmployeeProps> = ({ isOpen, onClose, employee }) => {

    const onSubmit = (e: any) => {
        e.preventDefault();
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
                            <div className="flex w-full flex-col">
                                <Tabs aria-label="Options">
                                    <Tab key="photos" title="Photos">
                                        <Card>
                                            <CardBody>
                                                <Form className="w-full max-w-xs" validationBehavior="aria" onSubmit={onSubmit}>
                                                    <Input
                                                        isRequired
                                                        label="Username"
                                                        labelPlacement="outside"
                                                        name="username"
                                                        placeholder="Enter your username"
                                                        type="text"
                                                        validate={(value) => {
                                                            if (value.length < 3) {
                                                                return "Username must be at least 3 characters long";
                                                            }

                                                            return value === "admin" ? "Nice try!" : null;
                                                        }}
                                                    />
                                                    <Button type="submit" variant="bordered">
                                                        Submit
                                                    </Button>
                                                </Form>
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
