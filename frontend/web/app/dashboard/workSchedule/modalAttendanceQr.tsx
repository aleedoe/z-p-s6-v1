"use client";

import React, { useEffect, useState, useRef } from "react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import QRCode from "react-qr-code";
import { WorkSchedule } from "@/types/api/workSchedule";
import { workScheduleService } from "@/services/workSchedule.service";

interface ModalAttendanceQrProps {
    isOpen: boolean;
    onClose: () => void;
    schedule: WorkSchedule | null;
}

const ModalAttendanceQr: React.FC<ModalAttendanceQrProps> = ({
    isOpen,
    onClose,
    schedule
}) => {
    const [qrData, setQrData] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const autoRefreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Fetch QR when modal opens
    useEffect(() => {
        if (isOpen && schedule) {
            generateQr();
        } else {
            // Cleanup on close
            cleanup();
        }
        
        return () => cleanup();
    }, [isOpen, schedule]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Auto refresh when expired
                        if (autoRefresh && isOpen && schedule) {
                            generateQr();
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }
    }, [timeLeft, autoRefresh, isOpen, schedule]);

    const cleanup = () => {
        setQrData("");
        setTimeLeft(0);
        setError(null);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (autoRefreshRef.current) {
            clearTimeout(autoRefreshRef.current);
            autoRefreshRef.current = null;
        }
    };

    const generateQr = async () => {
        if (!schedule) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const response = await workScheduleService.getQrCode(schedule.id);
            setQrData(response.qr_token);
            setTimeLeft(response.expires_in);
            
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to generate QR Code";
            setError(errorMessage);
            console.error("QR generation error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        cleanup();
        onClose();
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose}
            size="lg"
            backdrop="blur"
            isDismissable={false}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 items-center border-b">
                            <h2 className="text-xl font-bold">Scan QR Code untuk Absensi</h2>
                            {schedule && (
                                <div className="text-center">
                                    <p className="text-sm text-default-500 font-normal">
                                        {schedule.name}
                                    </p>
                                    <p className="text-xs text-default-400">
                                        {schedule.start_time} - {schedule.end_time} (Toleransi: {schedule.tolerance_minutes} menit)
                                    </p>
                                </div>
                            )}
                        </ModalHeader>
                        
                        <ModalBody className="flex flex-col items-center justify-center py-8">
                            {loading ? (
                                <div className="h-[280px] w-[280px] flex flex-col items-center justify-center gap-4">
                                    <Spinner size="lg" color="primary" />
                                    <p className="text-sm text-default-500">Generating QR Code...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center p-6 bg-danger-50 rounded-lg border border-danger-200 max-w-sm">
                                    <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <p className="font-semibold text-danger mb-2">Error</p>
                                    <p className="text-sm text-danger-600 mb-4">{error}</p>
                                    <Button 
                                        size="sm" 
                                        color="danger" 
                                        variant="flat" 
                                        onPress={generateQr}
                                    >
                                        Retry
                                    </Button>
                                </div>
                            ) : qrData ? (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="p-5 bg-white rounded-2xl shadow-xl border-2 border-default-200">
                                        <QRCode 
                                            value={qrData} 
                                            size={256}
                                            level="H"
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        />
                                    </div>
                                    
                                    <div className="text-center space-y-2">
                                        <div className="flex items-center gap-2 justify-center text-sm text-default-500">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>QR Code berlaku selama:</span>
                                        </div>
                                        <div className={`text-3xl font-bold font-mono ${
                                            timeLeft < 10 ? 'text-danger' : 
                                            timeLeft < 30 ? 'text-warning' : 
                                            'text-primary'
                                        }`}>
                                            {timeLeft}s
                                        </div>
                                        {autoRefresh && (
                                            <p className="text-xs text-default-400">
                                                Auto-refresh aktif
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="autoRefresh"
                                            checked={autoRefresh}
                                            onChange={(e) => setAutoRefresh(e.target.checked)}
                                            className="w-4 h-4 text-primary border-default-300 rounded focus:ring-primary"
                                        />
                                        <label htmlFor="autoRefresh" className="text-sm text-default-600 cursor-pointer">
                                            Refresh otomatis saat expired
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[280px] flex items-center justify-center">
                                    <p className="text-default-500">No QR Code generated</p>
                                </div>
                            )}
                        </ModalBody>
                        
                        <ModalFooter className="justify-between border-t">
                            <Button color="default" variant="light" onPress={handleClose}>
                                Close
                            </Button>
                            <Button 
                                color="primary" 
                                onPress={generateQr}
                                isLoading={loading}
                                isDisabled={loading}
                                startContent={!loading && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                        <path d="M3 3v5h5"/>
                                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                                        <path d="M16 16h5v5"/>
                                    </svg>
                                )}
                            >
                                {loading ? "Generating..." : "Regenerate QR"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default ModalAttendanceQr;