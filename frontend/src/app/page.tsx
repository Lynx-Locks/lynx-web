import Search from "./search";
import UsersTable from "./table";

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
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div>Users</div>
      <Search />
      <div className="mt-6">
        <UsersTable users={users} />
      </div>
    </main>
  );
}
