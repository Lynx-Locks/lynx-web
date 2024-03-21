"use client";

import styles from "./adminDashboard.module.css";
import Search from "@/components/search/search";
import AdminTable from "@/components/adminTable/table";
import ButtonsRow from "@/components/buttonsRow/buttonsRow";
import User from "@/types/user";
import React, { useEffect, useState } from "react";
import axios from "@/axios/client";

export default function AdminDashboard({
  users,
  setUsers,
}: {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}) {
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const getUsers = async () => {
      const usersResp = await axios.get("/users");
      setUsers(
        usersResp.data.map((user: User & { lastTimeIn: number }) => {
          const timeIn = user.lastTimeIn
            ? new Date(user.lastTimeIn * 1000)
            : null;
          return {
            ...user,
            timeIn: timeIn && timeIn.toLocaleTimeString(),
            lastDateIn: timeIn && timeIn.toLocaleDateString(),
          };
        }),
      );
    };
    getUsers();
  }, [setUsers]);

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardHeader}>Users</h1>
      <p className={styles.subHeading}>Add, Modify, and Remove your users</p>
      <div className={styles.homeSearch}>
        <Search
          placeholder="Search here"
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        />
      </div>
      <ButtonsRow />
      <AdminTable users={users} searchInput={searchInput} />
    </div>
  );
}
