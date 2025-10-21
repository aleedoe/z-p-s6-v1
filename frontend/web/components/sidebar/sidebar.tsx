"use client";

import React from "react";
import { Sidebar } from "./sidebar.styles";
import { HomeIcon } from "../icons/sidebar/home-icon";
import { SidebarItem } from "./sidebar-item";
import { SidebarMenu } from "./sidebar-menu";
import { useSidebarContext } from "../layoutD/layout-context";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/button";
// import { AcmeLogo } from "../icons/acmelogo";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@heroui/modal";
import { UsersIcon } from "../icons/breadcrumb/users-icon";
import { ReportsIcon } from "../icons/sidebar/reports-icon";
import { CustomersIcon } from "../icons/sidebar/customers-icon";

export const SidebarWrapper = () => {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarContext();
  const router = useRouter();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleLogout = (onClose: () => void) => {
    // hapus token & user
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    onClose(); // tutup modal
    router.push("/login"); // redirect ke login
  };

  return (
    <aside className="h-screen z-[20] sticky top-0">
      {collapsed ? (
        <div className={Sidebar.Overlay()} onClick={setCollapsed} />
      ) : null}
      <div
        className={Sidebar({
          collapsed: collapsed,
        })}
      >
        <div className={Sidebar.Header()}>
          <div className="flex items-center gap-2">
            {/* <AcmeLogo /> */}
            <h3 className="text-xl font-medium m-0 text-default-900 whitespace-nowrap">
              {"Joglo Narto"}
            </h3>
          </div>
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className={Sidebar.Body()}>
            <SidebarItem
              title="Home"
              icon={<HomeIcon />}
              isActive={pathname === "/dashboard"}
              href="/dashboard"
            />
            <SidebarMenu title="Main Menu">
              <SidebarItem
                isActive={pathname === "/dashboard/employeeData"}
                title="employee data"
                icon={<UsersIcon />}
                href="/dashboard/employeeData"
              />
            </SidebarMenu>
            <SidebarMenu title="Attendance">
              <SidebarItem
                isActive={pathname === "/dashboard/attendanceSchedule"}
                title="schedule"
                icon={<ReportsIcon />}
                href="/dashboard/attendanceSchedule"
              />
              <SidebarItem
                isActive={pathname === "/dashboard/attendanceData"}
                title="data"
                icon={<ReportsIcon />}
                href="/dashboard/attendanceData"
              />
            </SidebarMenu>
          </div>
          <div className={Sidebar.Footer()}>
            <Button color="danger" className="w-full" onPress={onOpen}>
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Logout */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Konfirmasi Logout
              </ModalHeader>
              <ModalBody>
                <p>Apakah Anda yakin ingin keluar dari akun ini?</p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="danger"
                  onPress={() => handleLogout(onClose)}
                >
                  Ya, Logout
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </aside>
  );
};
