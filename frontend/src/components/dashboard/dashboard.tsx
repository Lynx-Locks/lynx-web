import styles from "./dashboard.module.css";
import Search from "@/components/search/search";
import AdminTable from "@/components/adminTable/table";
import ButtonsRow from "@/components/buttonsRow/buttonsRow";
import User from "@/types/user";
import { useEffect } from "react";
import axios from "@/axios/client";

const users: User[] = [
  {
    id: 1,
    name: "Leanne Graham",
    username: "Bret",
    email: "leannegraham@lynxlocks.com",
    timeIn: "00:00:00",
    date: "2024/01/01",
  },
  {
    id: 2,
    name: "Ervin Howell",
    username: "Antonette",
    email: "ervinhowell@lynxlocks.com",
    timeIn: "00:00:00",
    date: "2024/01/01",
  },
  {
    id: 3,
    name: "Clementine Bauch",
    username: "Samantha",
    email: "clementinebauch@lynxlocks.com",
    timeIn: "00:00:00",
    date: "2024/01/01",
  },
  {
    id: 4,
    name: "Patricia Lebsack",
    username: "Karianne",
    email: "patricialebsack@lynxlocks.com",
    timeIn: "00:00:00",
    date: "2024/01/01",
  },
];

export default function Dashboard() {
  useEffect(() => {
    const f = async () => {
      const users = axios.get("/users");
    };
  }, []);
  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardHeader}>Users</h1>
      <p className={styles.subHeading}>Add, Modify, and Remove your users</p>
      <div className={styles.homeSearch}>
        <Search placeholder="Search here" />
      </div>
      <ButtonsRow />
      <AdminTable users={users} />
    </div>
  );
}
