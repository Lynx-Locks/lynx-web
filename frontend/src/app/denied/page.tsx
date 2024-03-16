"use client";

import Navbar from "@/components/navbar/navbar";
import { useEffect, useState } from "react";
import styles from "./denied.module.css";

export default function DeniedPage() {
  const [name, setName] = useState<string>("");
  useEffect(() => {
    if (localStorage.getItem("name")) {
      setName(String(localStorage.getItem("name")));
    }
  }, []);

  return (
    <div>
      <Navbar name={name} />
      <div className={styles.unauthorized}>
        <h1>401 - Unauthorized</h1>
        <p>Sorry, you do not have access to view this page.</p>
        <p>Please contact your administrator for more information.</p>
      </div>
    </div>
  );
}
