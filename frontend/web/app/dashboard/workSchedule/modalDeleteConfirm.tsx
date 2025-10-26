"use client";

import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import React from "react";

interface ModalDeleteConfirmProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    scheduleName: string;
}

const ModalDeleteConfirm: React.FC<ModalDeleteConfirmProps> = ({
    isOpen,
    onClose,
    onConfirm,
    scheduleName
}) => {
    return (
        <Modal isOpen={isOpen} size="md" onClose={onClose}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Confirm Delete
                        </ModalHeader>
                        <ModalBody>
                            <p className="text-default-600">
                                Are you sure you want to delete the work schedule <span className="font-semibold">{scheduleName}</span>?
                            </p>
                            <p className="text-sm text-danger mt-2">
                                This action cannot be undone. The schedule will be permanently deleted.
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="default" variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button
                                color="danger"
                                onPress={onConfirm}
                            >
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