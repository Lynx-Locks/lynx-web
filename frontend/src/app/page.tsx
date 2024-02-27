"use client";
import Dashboard from "@/components/dashboard/dashboard";
import Navbar from "@/components/navbar/navbar";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [token, setToken] = useState("");

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    } else {
      // Redirect to login
      redirect("/login");
    }
  }, []);

  return (
    <div>
      {token ? (
        <div>
          <Navbar />
          <Dashboard />;
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}
