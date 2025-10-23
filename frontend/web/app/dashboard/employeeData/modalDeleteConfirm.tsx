"use client";

import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import React from "react";

interface ModalDeleteConfirmProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    employeeName: string;
}

const ModalDeleteConfirm: React.FC<ModalDeleteConfirmProps> = ({
    isOpen,
    onClose,
    onConfirm,
    employeeName
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Confirm Delete
                        </ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col gap-2">
                                <p className="text-default-700">
                                    Are you sure you want to delete employee:
                                </p>
                                <p className="text-lg font-semibold text-danger">
                                    {employeeName}
                                </p>
                                <p className="text-sm text-default-500">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="default" variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button color="danger" onPress={onConfirm}>
                                Delete
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default ModalDeleteConfirm;