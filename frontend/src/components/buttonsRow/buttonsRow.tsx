"use client";

import { useState } from "react";
import styles from "./buttonsRow.module.css";
import modalStyles from "@/components/modal/modal.module.css";
import { AddButton, SubmitButon } from "@/components/addButton/button";
import Modal from "@/components/modal/modal";
import Dropdown from "@/components/dropdown/dropdown";
import SearchDropdown from "@/components/searchDropdown/searchDropdown";

const roles = ["A", "B", "C", "D"];

const emails = ["abc@lynx.com", "efg@lynx.com", "hij@lynx.com"];

export default function ButtonRow() {
  const [newKeyModal, setNewKeyModal] = useState(false);
  const [newRoleModal, setNewRoleModal] = useState(false);

  const buttons = [
    {
      id: 1,
      name: "New Key",
      onClick: () => setNewKeyModal(true),
    },
    {
      id: 2,
      name: "New Role",
      onClick: () => setNewRoleModal(true),
    },
  ];

  const newKeyModalContent = (
    <div>
      <h2 className={modalStyles.modalSubheader}>Email</h2>
      <SearchDropdown placeholder="Add Email..." options={emails} />
      <h2 className={modalStyles.modalSubheader}>Role</h2>
      <Dropdown options={roles} />
      <SubmitButon text="Submit" onClick={() => setNewKeyModal(false)} />
    </div>
  );

  const newKeyRoleContent = <div>Some text in the Modal..</div>;

  return (
    <div className={styles.buttonRowContainer}>
      {buttons.map(({ id, name, onClick }) => (
        <AddButton key={id} text={name} onClick={() => onClick()} />
      ))}
      {newKeyModal && (
        <Modal
          setShowModal={setNewKeyModal}
          title="New Key"
          content={newKeyModalContent}
        />
      )}
      {newRoleModal && (
        <Modal
          setShowModal={setNewRoleModal}
          title="New Role"
          content={newKeyRoleContent}
        />
      )}
    </div>
  );
}
