import AdminDashboard from "@/components/adminDashboard/adminDashboard";
import Navbar from "@/components/navbar/navbar";
import { useEffect, useState } from "react";

export default function Home() {
  const [name, setName] = useState<string>("");
  useEffect(() => {
    if (localStorage.getItem("name")) {
      setName(String(localStorage.getItem("name")));
    }
  }, []);

  return (
    <div>
      <Navbar name={name} />
      <Dashboard />
    </div>
  );
}
