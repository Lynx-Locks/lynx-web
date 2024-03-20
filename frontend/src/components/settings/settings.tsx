"use client";

import Modal from "@/components/modal/modal";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "@/axios/client";
import { getRoleOptions } from "@/data/roles";
import styles from "./settings.module.css";
import SearchDropdown from "@/components/searchDropdown/searchDropdown";
import { SubmitButton } from "@/components/button/button";
import { getCookie } from "cookies-next";

export default function Settings({
  page = "",
}: {
  page?: "portal" | "admin" | "";
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; isAdmin?: boolean }>({});

  useEffect(() => {
    if (localStorage.getItem("user")) {
      const user = JSON.parse(String(localStorage.getItem("user")));
      setUser(user);
    }
  }, []);

  const handleModalClose = () => {
    if (page == "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  const tokenConfirmation = () => {
    if (page == "admin") {
      router.push("/admin/settings/tokenConfirmation");
    } else {
      router.push("/settings/tokenConfirmation");
    }
  };

  const handleLogout = async () => {
    await axios.post("/logout");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const accountSettingsModalContent = (
    <div>
      {user.isAdmin && (
        <SubmitButton
          disabled={false}
          text="Get Access Token"
          onClick={tokenConfirmation}
        />
      )}
      <SubmitButton disabled={false} text="Logout" onClick={handleLogout} />
    </div>
  );

  return (
    <Modal
      closeModal={handleModalClose}
      title="Settings"
      content={accountSettingsModalContent}
    />
  );
}
