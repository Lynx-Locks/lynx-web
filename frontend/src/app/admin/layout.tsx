"use client";

import Dashboard from "@/components/adminDashboard/adminDashboard";
import Navbar from "@/components/navbar/navbar";
import User from "@/types/user";
import { Dispatch, SetStateAction, createContext, useEffect } from "react";
import { useState } from "react";

export const AdminContext = createContext<{
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
}>({ users: [], setUsers: () => {} });

export const SubmitSelectedUsersContext = createContext<{
  submitted: boolean;
  setSubmitted: Dispatch<SetStateAction<boolean>>;
}>({ submitted: false, setSubmitted: () => {} });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [submittedUserSelection, setSubmittedUserSelection] =
    useState<boolean>(false);

  return (
    <AdminContext.Provider value={{ users, setUsers }}>
      <SubmitSelectedUsersContext.Provider
        value={{
          submitted: submittedUserSelection,
          setSubmitted: setSubmittedUserSelection,
        }}
      >
        <Navbar page="admin" />
        <Dashboard
          users={users}
          setUsers={setUsers}
          submittedUserSelection={submittedUserSelection}
          setSubmittedUserSelection={setSubmittedUserSelection}
        />
        {children}
      </SubmitSelectedUsersContext.Provider>
    </AdminContext.Provider>
  );
}
