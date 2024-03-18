"use client";

import Dashboard from "@/components/adminDashboard/adminDashboard";
import Navbar from "@/components/navbar/navbar";
import User from "@/types/user";
import React, { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

export const AdminContext = React.createContext<{
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
}>({ users: [], setUsers: () => {} });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [name, setName] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (localStorage.getItem("name")) {
      setName(String(localStorage.getItem("name")));
    }
  }, []);

  return (
    <AdminContext.Provider value={{ users, setUsers }}>
      <Navbar page="admin" />
      <Dashboard users={users} setUsers={setUsers} />
      {children}
    </AdminContext.Provider>
  );
}
