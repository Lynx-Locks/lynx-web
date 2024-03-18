"use client";

import { useState } from "react";
import styles from "./buttonsRow.module.css";
import { AddButton, SubmitButton } from "@/components/button/button";
import Modal from "@/components/modal/modal";
import SearchDropdown from "../searchDropdown/searchDropdown";
import { SelectType } from "@/types/selectOptions";
import axios from "@/axios/client";
import User from "@/types/user";
import { useRouter } from "next/navigation";

export default function ButtonRow({ users }: { users: User[] }) {
  const [newKeyModal, setNewKeyModal] = useState(false);
  const [selectedEmailOption, setSelectedEmailOption] =
    useState<SelectType>(null);
  const [disabled, setDisabled] = useState(false);
  const router = useRouter();

  const emails = users.map((user) => ({
    label: user.email,
    value: user.id.toString(),
  }));

  const buttons = [
    {
      id: 1,
      name: "New User",
      onClick: () => {
        router.push("/admin/newUserModal");
      },
    },
    {
      id: 2,
      name: "New Key",
      onClick: () => {
        setDisabled(false);
        setNewKeyModal(true);
      },
    },
    {
      id: 3,
      name: "New Role",
      onClick: () => {
        router.push("/admin/newRoleModal");
      },
    },
  ];

  const handleModalClose = () => {
    setNewKeyModal(false);
    setSelectedEmailOption(null);
  };

  const handleModalSubmit = async () => {
    setDisabled(true);
    if (newKeyModal && selectedEmailOption) {
      // Send email for user to register a key
      await axios.post(`/users/register`, {
        // @ts-ignore
        email: selectedEmailOption.label,
      });
    }

    setSelectedEmailOption(null);
    setNewKeyModal(false);
    setDisabled(false);
  };

  const newKeyModalContent = (
    <div>
      <SearchDropdown
        options={emails}
        placeholder="Add Email..."
        subheader="Email"
        selectDropdown="tableModal"
        setSelectedOption={setSelectedEmailOption}
      />
      <SubmitButton
        disabled={disabled}
        text="Submit"
        onClick={handleModalSubmit}
      />
    </div>
  );

  return (
    <div className={styles.buttonRowContainer}>
      {buttons.map(({ id, name, onClick }) => (
        <AddButton key={id} text={name} onClick={() => onClick()} />
      ))}
      {newKeyModal && (
        <Modal
          closeModal={handleModalClose}
          title="New Key"
          content={newKeyModalContent}
        />
      )}
    </div>
  );
}
