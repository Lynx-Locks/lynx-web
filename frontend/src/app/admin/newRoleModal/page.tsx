"use client";

import Modal from "@/components/modal/modal";
import { useEffect, useState } from "react";
import styles from "../modals.module.css";
import SearchDropdown from "@/components/searchDropdown/searchDropdown";
import { Options, SelectType } from "@/types/selectOptions";
import { SubmitButton } from "@/components/button/button";
import { useRouter } from "next/navigation";
import axios from "@/axios/client";
import React from "react";
import { AdminContext } from "../layout";
import { getDoorOptions } from "@/data/doors";

export default function NewRoleModal() {
  const [newRole, setNewRole] = useState<{ name: string }>({
    name: "",
  });
  const [selectedDoorOption, setSelectedDoorOption] =
    useState<SelectType>(null);
  const [doors, setDoors] = useState<Options[]>([]);
  const [selectedEmailOption, setSelectedEmailOption] =
    useState<SelectType>(null);
  const [disabled, setDisabled] = useState(false);
  const router = useRouter();
  const { users } = React.useContext(AdminContext);

  const emails = users.map((user) => ({
    label: user.email,
    value: user.id.toString(),
  }));

  useEffect(() => {
    const f = async () => {
      setDoors(await getDoorOptions());
    };
    f();
  }, []);

  const handleModalClose = () => {
    router.push("/admin");
  };

  const handleModalSubmit = async () => {
    setDisabled(true);
    // handle adding new role
    await axios.post("/roles", {
      name: newRole.name,
      users: Array.isArray(selectedEmailOption)
        ? selectedEmailOption.map((email: Options) => ({
            id: parseInt(email.value),
          }))
        : [],
      doors: Array.isArray(selectedDoorOption)
        ? selectedDoorOption.map((door: Options) => ({
            id: parseInt(door.value),
          }))
        : [],
    });
    router.push("/admin");
  };

  const newRoleModalContent = (
    <div>
      <h2 className={styles.subheader}>Name</h2>
      <input
        className={styles.modalInput}
        type="text"
        value={newRole.name}
        onChange={(e) => setNewRole({ name: e.target.value })}
      />
      <SearchDropdown
        options={emails}
        placeholder="Add Emails..."
        subheader="Emails"
        selectDropdown="tableModal"
        setSelectedOption={setSelectedEmailOption}
        isMulti
      />
      <SearchDropdown
        options={doors}
        placeholder="Add Entrypoint..."
        subheader="Entrypoints"
        selectDropdown="tableModal"
        setSelectedOption={setSelectedDoorOption}
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
      title="New Role"
      content={newRoleModalContent}
    />
  );
}
