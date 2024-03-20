"use client";

import NavLogo from "@/components/navLogo/navLogo";
import styles from "./navbar.module.css";
import { useRouter } from "next/navigation";
import axios from "@/axios/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCookie } from "cookies-next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";

export default function Navbar({
  page = "",
}: {
  page?: "portal" | "admin" | "";
}) {
  const [user, setUser] = useState<{ name?: string; isAdmin?: boolean }>({});
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("user")) {
      const user = JSON.parse(String(localStorage.getItem("user")));
      setUser(user);
    }
  }, []);

  const handleClickSettings = () => {
    if (page === "admin") {
      router.push("/admin/settings");
    } else {
      router.push("/settings");
    }
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
        <FontAwesomeIcon
          className={styles.navSettings}
          icon={faGear}
          onClick={handleClickSettings}
        />
      </div>
    </nav>
  );
}
