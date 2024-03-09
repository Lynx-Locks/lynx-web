"use client";

import styles from "./adminDashboard.module.css";
import Search from "@/components/search/search";
import AdminTable from "@/components/adminTable/table";
import ButtonsRow from "@/components/buttonsRow/buttonsRow";
import User from "@/types/user";
import { useEffect, useState } from "react";
import axios from "@/axios/client";
import { SelectType } from "@/types/selectOptions";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchInput, setSearchInput] = useState("");

  const updateUser = async (user: User, roles: SelectType) => {
    const newUserResp = await axios.put(`/users/${user.id}`, {
      name: user.name,
      email: user.email,
      roles: Array.isArray(roles) && roles.map((r) => r.value),
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
      const users = await axios.get("/users");
      setUsers(
        users.data.map((user: User) => {
          // TODO: parse these from response, obtain timezone from TZ environment variable
          user.timeIn = new Date().toLocaleTimeString();
          user.lastDateIn = new Date().toLocaleDateString();
          return user;
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
      <ButtonsRow users={users} setUsers={setUsers} />
      <AdminTable
        users={users.filter(
          (user) =>
            user.name.toLowerCase().includes(searchInput.toLowerCase()) ||
            user.email.toLowerCase().includes(searchInput.toLowerCase()) ||
            user.timeIn.toLowerCase().includes(searchInput.toLowerCase()) ||
            user.lastDateIn.toLowerCase().includes(searchInput.toLowerCase()),
        )}
        updateUser={updateUser}
        deleteUser={deleteUser}
      />
    </div>
  );
}
