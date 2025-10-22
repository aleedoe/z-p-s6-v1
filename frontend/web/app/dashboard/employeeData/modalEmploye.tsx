"use client";

import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import React from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import App from "./tableEmployeeSchedule";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";


interface ModalEmployeeProps {
    isOpen: boolean;
    onClose: () => void;
    employee?: any; // bisa ganti ke tipe Employee jika ada
}

const ModalEmployee: React.FC<ModalEmployeeProps> = ({ isOpen, onClose, employee }) => {

    const [selectedKeys, setSelectedKeys] = React.useState(new Set(["Gender"]));

    const selectedValue = React.useMemo(
        () => Array.from(selectedKeys).join(", ").replace(/_/g, ""),
        [selectedKeys],
    );

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
                                                        label="Email"
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
                                                    <Input
                                                        isRequired
                                                        label="Name"
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
                                                    <Input
                                                        isRequired
                                                        label="NIK"
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
                                                    <Input
                                                        isRequired
                                                        label="Position"
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
                                                    <Dropdown>
                                                        <DropdownTrigger>
                                                            <Button className="capitalize" variant="bordered">
                                                                {selectedValue}
                                                            </Button>
                                                        </DropdownTrigger>
                                                        <DropdownMenu
                                                            label="Gender"
                                                            labelPlacement="outside"
                                                            disallowEmptySelection
                                                            aria-label="Single selection example"
                                                            selectedKeys={selectedKeys}
                                                            selectionMode="single"
                                                            variant="flat"
                                                        // onSelectionChange={setSelectedKeys}
                                                        >
                                                            <DropdownItem key="Male">Male</DropdownItem>
                                                            <DropdownItem key="Female">Female</DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                    <Input
                                                        isRequired
                                                        label="Password"
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
