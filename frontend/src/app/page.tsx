import styles from "./home.module.css";
import Search from "@/components/search/search";
import AdminTable from "@/components/adminTable/table";
import TableButtons from "@/components/addButton/button";
import User from "@/types/user";
import Head from "next/head";

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

export default function Home() {
  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.homeHeader}>Users</h1>
      <p className={styles.subHeading}>Add, Modify, and Remove your users</p>
      <Search />
      <TableButtons />
      <AdminTable users={users} />
    </div>
  );
}
