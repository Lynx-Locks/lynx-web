"use client";

import Modal from "@/components/modal/modal";
import { useEffect, useState } from "react";
import styles from "./newUserModal.module.css";
import SearchDropdown from "@/components/searchDropdown/searchDropdown";
import { Options, SelectType } from "@/types/selectOptions";
import { SubmitButton } from "@/components/button/button";
import { getRoleOptions } from "@/data/roles";
import { useRouter } from "next/navigation";
import axios from "@/axios/client";
import React from "react";
import { AdminContext } from "../layout";
import User from "@/types/user";

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

export default function NewUserModal() {
  const [newUser, setNewUser] = useState<{ name: string; email: string }>({
    name: "",
    email: "",
  });
  const [selectedRoleOption, setSelectedRoleOption] =
    useState<SelectType>(null);
  const [roles, setRoles] = useState<Options[]>([]);
  const [disabled, setDisabled] = useState(false);
  const router = useRouter();
  const { users, setUsers } = React.useContext(AdminContext);

  useEffect(() => {
    const f = async () => {
      setRoles(await getRoleOptions());
    };
    f();
  }, []);

  const handleModalClose = () => {
    router.push("/admin");
  };

  const handleModalSubmit = async () => {
    setDisabled(true);
    // handle adding new user
    if (emailRegex.test(newUser.email)) {
      const userResp = await axios.post("/users", {
        name: newUser.name,
        email: newUser.email,
        roles: Array.isArray(selectedRoleOption)
          ? selectedRoleOption.map((role: Options) => ({
              id: parseInt(role.value),
            }))
          : [],
      });

      const user = userResp.data;
      // Save user to state
      setUsers([...users, user]);

      // Send email for user to register a key
      await axios.post(`/users/register`, {
        email: newUser.email,
      });
      router.push("/admin");
    }
  };

  const newUserModalContent = (
    <div>
      <h2 className={styles.subheader}>Name</h2>
      <input
        className={styles.modalInput}
        type="text"
        value={newUser.name}
        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
      />
      <h2 className={styles.subheader}>Email</h2>
      <input
        className={styles.modalInput}
        type="text"
        value={newUser.email}
        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
      />
      <SearchDropdown
        options={roles}
        placeholder="Select Role(s)..."
        subheader="Roles"
        selectDropdown="tableModal"
        setSelectedOption={setSelectedRoleOption}
        isMulti
      />
      <SubmitButton
        disabled={disabled}
        text="Submit"
        onClick={handleModalSubmit}
      />
    </div>
  );

  return (
    <Modal
      closeModal={handleModalClose}
      title="New User"
      content={newUserModalContent}
    />
  );
}
