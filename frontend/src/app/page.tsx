import styles from "./home.module.css";
import Search from "@/components/search/search";
import UsersTable from "@/components/adminTable/table";
import TableButtons from "@/components/tableButtons/tableButtons";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export default function Home() {
  const users: User[] = [
    {
      id: 1,
      name: "Leanne Graham",
      username: "Bret",
      email: "leannegraham@lynxlocks.com",
    },
    {
      id: 2,
      name: "Ervin Howell",
      username: "Antonette",
      email: "ervinhowell@lynxlocks.com",
    },
    {
      id: 3,
      name: "Clementine Bauch",
      username: "Samantha",
      email: "clementinebauch@lynxlocks.com",
    },
    {
      id: 4,
      name: "Patricia Lebsack",
      username: "Karianne",
      email: "patricialebsack@lynxlocks.com",
    },
  ];

  return (
    <div className={styles.homeContainer}>
      <div>Users</div>
      <div>Add, Modify, and Remove your users</div>
      <Search />
      <TableButtons />
      <UsersTable users={users} />
    </div>
  );
}
