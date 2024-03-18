"use client";

import Dashboard from "@/components/adminDashboard/adminDashboard";
import Navbar from "@/components/navbar/navbar";
import User from "@/types/user";
import React, { Dispatch, SetStateAction } from "react";
import { useState } from "react";

export const AdminContext = React.createContext<{
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
}>({ users: [], setUsers: () => {} });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [users, setUsers] = useState<User[]>([]);

  return (
    <AdminContext.Provider value={{ users, setUsers }}>
      <Navbar page="admin" />
      <Dashboard users={users} setUsers={setUsers} />
      {children}
    </AdminContext.Provider>
  );
}
