"use client";

import React from "react";
import TableAttendanceData from "./tableAttendanceData";

export default function AttendanceDataPage() {
    return (
        <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
            <h3 className="text-xl font-semibold">Attendance Records</h3>
            <div className="flex justify-between flex-wrap gap-4 items-center">
                <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
                    <p className="text-sm text-default-500">
                        View all employee attendance records
                    </p>
                </div>
            </div>
            <div className="max-w-[95rem] mx-auto w-full">
                <TableAttendanceData />
            </div>
        </div>
    );
}