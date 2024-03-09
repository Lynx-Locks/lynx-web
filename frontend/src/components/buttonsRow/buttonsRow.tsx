"use client";

import { useState } from "react";
import styles from "./buttonsRow.module.css";
import { AddButton, SubmitButton } from "@/components/button/button";
import Modal from "@/components/modal/modal";
import SearchDropdown from "../searchDropdown/searchDropdown";
import { employeeRoles } from "@/constants/roles";
import { entrypoints } from "@/constants/entrypoints";
import { SelectType } from "@/types/selectOptions";

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

export default function ButtonRow({
  emails,
}: {
  emails: { label: string; value: string }[];
}) {
  const [newKeyModal, setNewKeyModal] = useState(false);
  const [newRoleModal, setNewRoleModal] = useState(false);
  const [newUserModal, setNewUserModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedEmailOption, setSelectedEmailOption] =
    useState<SelectType>(null);
  const [selectedRoleOption, setSelectedRoleOption] =
    useState<SelectType>(null);

  const buttons = [
    {
      id: 1,
      name: "New User",
      onClick: () => setNewUserModal(true),
    },
    {
      id: 2,
      name: "New Key",
      onClick: () => setNewKeyModal(true),
    },
    {
      id: 3,
      name: "New Role",
      onClick: () => setNewRoleModal(true),
    },
  ];

  const handleModalClose = () => {
    setNewKeyModal(false);
    setNewUserModal(false);
    setNewRoleModal(false);
    setSelectedEmailOption(null);
    setSelectedRoleOption(null);
  };

  const handleModalSubmit = () => {
    console.log(selectedEmailOption, selectedRoleOption);
    if (newKeyModal) {
      // handle adding new key
    } else if (newRoleModal) {
      // handle adding new role
    } else if (newUserModal) {
      // handle adding new user
      if (emailRegex.test(userEmail)) {
        // TODO: add user & send email
      }
    }
    // TODO: uncomment these lines when the functionality is implemented
    // setSelectedEmailOption(null);
    // setSelectedRoleOption(null);
    // setNewKeyModal(false);
  };

  const newUserModalContent = (
    <div>
      <h2 className={styles.subheader}>Email</h2>
      <input
        className={styles.modalInput}
        type="text"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
      />
      <SearchDropdown
        options={employeeRoles}
        placeholder="Select Role(s)..."
        subheader="Role"
        selectDropdown="tableModal"
        setSelectedOption={setSelectedRoleOption}
        isMulti
      />
      <SubmitButton text="Submit" onClick={handleModalSubmit} />
    </div>
  );

  const newKeyModalContent = (
    <div>
      <SearchDropdown
        options={emails}
        placeholder="Add Email..."
        subheader="Email"
        selectDropdown="tableModal"
        setSelectedOption={setSelectedEmailOption}
      />
      <SearchDropdown
        options={employeeRoles}
        placeholder="Select Role..."
        subheader="Role"
        selectDropdown="tableModal"
        setSelectedOption={setSelectedRoleOption}
        isMulti
      />
      <SubmitButton text="Submit" onClick={handleModalSubmit} />
    </div>
  );

  const newRoleModalContent = (
    <div>
      <SearchDropdown
        options={emails}
        placeholder="Add Email..."
        subheader="Email"
        selectDropdown="tableModal"
        setSelectedOption={setSelectedEmailOption}
        isMulti
      />
      <SearchDropdown
        options={entrypoints}
        placeholder="Add Entrypoint..."
        subheader="Entrypoints"
        selectDropdown="tableModal"
        setSelectedOption={setSelectedRoleOption}
        isMulti
      />
      <SubmitButton text="Submit" onClick={handleModalSubmit} />
    </div>
  );

  return (
    <div className={styles.buttonRowContainer}>
      {buttons.map(({ id, name, onClick }) => (
        <AddButton key={id} text={name} onClick={() => onClick()} />
      ))}
      {newUserModal && (
        <Modal
          closeModal={handleModalClose}
          title="New User"
          content={newUserModalContent}
        />
      )}
      {newKeyModal && (
        <Modal
          closeModal={handleModalClose}
          title="New Key"
          content={newKeyModalContent}
        />
      )}
      {newRoleModal && (
        <Modal
          closeModal={handleModalClose}
          title="New Role"
          content={newRoleModalContent}
        />
      )}
    </div>
  );
}
