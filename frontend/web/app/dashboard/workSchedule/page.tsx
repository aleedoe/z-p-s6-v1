"use client";

import React, { useState } from "react";
import TableWorkSchedule from "./tableWorkSchedule";
import ModalAddWorkSchedule from "./modalAddWorkSchedule";
import { Button } from "@heroui/button";

export default function WorkSchedulePage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAddSuccess = () => {
        // Trigger refresh of table data
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
            <h3 className="text-xl font-semibold">Work Schedules</h3>
            <div className="flex justify-between flex-wrap gap-4 items-center">
                <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
                    {/* Search input can be added here later */}
                </div>
                <div className="flex flex-row flex-wrap">
                    <Button
                        color="primary"
                        onPress={() => setIsAddModalOpen(true)}
                    >
                        Add Work Schedule
                    </Button>
                </div>
            </div>
            <div className="max-w-[95rem] mx-auto w-full">
                <TableWorkSchedule key={refreshKey} />
            </div>
            <ModalAddWorkSchedule
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />
        </div>
    );
}