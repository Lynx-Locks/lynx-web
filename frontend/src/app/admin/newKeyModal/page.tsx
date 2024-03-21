"use client";

import Modal from "@/components/modal/modal";
import { useState } from "react";
import SearchDropdown from "@/components/searchDropdown/searchDropdown";
import { SelectType } from "@/types/selectOptions";
import { SubmitButton } from "@/components/button/button";
import { useRouter } from "next/navigation";
import axios from "@/axios/client";
import React from "react";
import { AdminContext } from "../layout";
import styles from "../modals.module.css";

export default function NewKeyModal() {
  const [selectedEmailOption, setSelectedEmailOption] =
    useState<SelectType>(null);
  const [disabled, setDisabled] = useState(false);
  const router = useRouter();
  const { users } = React.useContext(AdminContext);

  const emails = users.map((user) => ({
    label: user.email,
    value: user.id.toString(),
  }));

  const handleModalClose = () => {
    router.push("/admin");
  };

  const handleModalSubmit = async () => {
    setDisabled(true);
    // Send email for user to register a key
    await axios.post(`/users/register`, {
      // @ts-ignore
      email: selectedEmailOption.label,
    });
    router.push("/admin");
  };

  const newKeyModalContent = (
    <div className={styles.modalContentContainer}>
      <SearchDropdown
        options={emails}
        placeholder="Add Email..."
        subheader="Email"
        selectDropdown="tableModal"
        setSelectedOption={setSelectedEmailOption}
      />
      <div className={styles.modalButtonGroup}>
        <SubmitButton
          disabled={disabled}
          text="Submit"
          onClick={handleModalSubmit}
        />
      </div>
    </div>
  );

  return (
    <Modal
      closeModal={handleModalClose}
      title="New Key"
      content={newKeyModalContent}
    />
  );
}
