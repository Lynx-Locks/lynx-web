"use client";
import Dashboard from "@/components/dashboard/dashboard";
import Navbar from "@/components/navbar/navbar";
import jwt from "jsonwebtoken";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [email, setEmail] = useState<null | string>(null);
  const router = useRouter();

  const handleLogout = () => {
    setEmail(null);
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const user = jwt.verify(token, "secret");
        if (typeof user == "object" && user.isAdmin && user.email) {
          setEmail(user.email);
          return;
        } else {
          new Error("Invalid token parameters");
        }
      } catch (error) {
        console.error("Token error: ", error);
        localStorage.removeItem("token");
      }
    }
    // Redirect to login
    redirect("/login/?referrer=/");
  }, []);

  return (
    <div>
      {email ? (
        <div>
          <Navbar email={email} handleLogout={handleLogout} />
          <Dashboard />
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}
