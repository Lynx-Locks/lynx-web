"use client";

import styles from "./adminDashboard.module.css";
import Search from "@/components/search/search";
import AdminTable from "@/components/adminTable/table";
import ButtonsRow from "@/components/buttonsRow/buttonsRow";
import User from "@/types/user";
import React, { useEffect, useState } from "react";
import axios from "@/axios/client";
import { SelectType } from "@/types/selectOptions";

export default function AdminDashboard({
  users,
  setUsers,
}: {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}) {
  const [searchInput, setSearchInput] = useState("");

  const updateUser = async (user: User, roles: SelectType) => {
    const newUserResp = await axios.put(`/users`, {
      id: user.id,
      name: user.name,
      email: user.email,
      roles:
        Array.isArray(roles) && roles.map((r) => ({ id: parseInt(r.value) })),
    });
    const newUser = newUserResp.data;
    const newUsers = users.map((u) => {
      if (u.id === newUser.id) {
        return user;
      }
      return u;
    });
    setUsers(newUsers);
  };

  const deleteUser = async (user: User) => {
    axios.delete(`/users/${user.id}`);
    const newUsers = users.filter((u) => u.id !== user.id);
    setUsers(newUsers);
  };

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
  }, []);

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
      <ButtonsRow users={users} />
      <AdminTable
        users={users.filter(
          (user) =>
            user.name.toLowerCase().includes(searchInput.toLowerCase()) ||
            user.email.toLowerCase().includes(searchInput.toLowerCase()) ||
            user.timeIn?.toLowerCase().includes(searchInput.toLowerCase()) ||
            user.lastDateIn?.toLowerCase().includes(searchInput.toLowerCase()),
        )}
        updateUser={updateUser}
        deleteUser={deleteUser}
      />
    </div>
  );
}
