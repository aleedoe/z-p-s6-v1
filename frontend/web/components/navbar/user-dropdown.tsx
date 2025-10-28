"use client";

import React, { useEffect, useState } from "react";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { NavbarItem } from "@heroui/navbar";

interface UserData {
  id: number;
  name: string;
  email: string;
  access_token: string;
}

export const UserDropdown = () => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Dropdown>
      <NavbarItem>
        <DropdownTrigger>
          <Avatar
            as="button"
            color="secondary"
            size="md"
            // src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
          />
        </DropdownTrigger>
      </NavbarItem>
      <DropdownMenu aria-label="User menu actions">
        <DropdownItem
          key="profile"
          className="flex flex-col justify-start w-full items-start"
        >
          <p className="font-medium">
            {user?.name || "Unknown User"}
          </p>
          <p className="text-sm text-gray-600">{user?.email || "No email"}</p>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
