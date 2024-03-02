import styles from "./dashboard.module.css";
import Search from "@/components/search/search";
import AdminTable from "@/components/adminTable/table";
import ButtonsRow from "@/components/buttonsRow/buttonsRow";
import User from "@/types/user";
import { useEffect, useState } from "react";
import axios from "@/axios/client";

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const getUsers = async () => {
      const users = await axios.get("/users");
      setUsers(
        users.data.map((user: User) => {
          user.timeIn = new Date().toLocaleTimeString(); // TODO: parse these from response
          user.date = new Date().toLocaleDateString();
          return user;
        })
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
      <ButtonsRow />
      <AdminTable
        users={users.filter((user) =>
          user.name.toLowerCase().includes(searchInput.toLowerCase())
        )}
      />
    </div>
  );
}
