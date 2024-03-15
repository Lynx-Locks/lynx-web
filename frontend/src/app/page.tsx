"use client";

import Navbar from "@/components/navbar/navbar";
import { useEffect, useState } from "react";
import Dashboard from "@/components/userDashboard/userDashboard";

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
