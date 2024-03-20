"use client";

import NavLogo from "@/components/navLogo/navLogo";
import styles from "./navbar.module.css";
import { useRouter } from "next/navigation";
import axios from "@/axios/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCookie } from "cookies-next";

export default function Navbar({
  page = "",
}: {
  page?: "portal" | "admin" | "";
}) {
  const [user, setUser] = useState<{
    id?: number;
    name?: string;
    isAdmin?: boolean;
  }>({});
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("user")) {
      const user = JSON.parse(String(localStorage.getItem("user")));
      setUser(user);
    }
  }, []);

  const handleLogout = async () => {
    await axios.post("/logout");
    localStorage.removeItem("name");
    router.push("/login");
  };

  return (
    <nav className={styles.navContainer}>
      <div className={styles.navLeft}>
        <NavLogo />
      </div>
      <div className={styles.navRight}>
        <p className={styles.navUser}>{user.name}</p>
        {user.isAdmin && page === "portal" && (
          <Link className={styles.navLink} href="/admin">
            Admin Page
          </Link>
        )}
        {user.isAdmin && page === "admin" && (
          <Link className={styles.navLink} href="/">
            Portal Page
          </Link>
        )}
        <button className={styles.navLogout} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
