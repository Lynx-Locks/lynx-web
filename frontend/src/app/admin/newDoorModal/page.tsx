"use client";

import Modal from "@/components/modal/modal";
import { useEffect, useState } from "react";
import styles from "../modals.module.css";
import SearchDropdown from "@/components/searchDropdown/searchDropdown";
import { Options, SelectType } from "@/types/selectOptions";
import { SubmitButton } from "@/components/button/button";
import { getRoleOptions } from "@/data/roles";
import { useRouter } from "next/navigation";
import axios from "@/axios/client";
import React from "react";

export default function NewDoorModal() {
  const router = useRouter();
  const [newDoor, setNewDoor] = useState<{ name: string; description: string }>(
    {
      name: "",
      description: "",
    },
  );
  const [selectedRoleOption, setSelectedRoleOption] =
    useState<SelectType>(null);
  const [roles, setRoles] = useState<Options[]>([]);
  const [disabled, setDisabled] = useState(false);

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

    await axios.post("/doors", {
      name: newDoor.name,
      description: newDoor.description,
      roles: Array.isArray(selectedRoleOption)
        ? selectedRoleOption.map((r) => ({ id: parseInt(r.value) }))
        : [],
    });

    router.push("/admin");
  };

  const newDoorModalContent = (
    <div>
      <h2 className={styles.subheader}>Name</h2>
      <input
        className={styles.modalInput}
        type="text"
        value={newDoor.name}
        onChange={(e) => setNewDoor({ ...newDoor, name: e.target.value })}
      />
      <h2 className={styles.subheader}>Description</h2>
      <input
        className={styles.modalInput}
        type="text"
        value={newDoor.description}
        onChange={(e) =>
          setNewDoor({ ...newDoor, description: e.target.value })
        }
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
      title="New Door"
      content={newDoorModalContent}
    />
  );
}
