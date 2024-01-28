"use client";

import { useState } from "react";
import styles from "./buttonsRow.module.css";
import Button from "@/components/addButton/button";
import Modal from "@/components/modal/modal";

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

  return (
    <div className={styles.buttonRowContainer}>
      {buttons.map(({ id, name, onClick }) => (
        <Button key={id} text={name} onClick={() => onClick()} />
      ))}
      {newKeyModal && <Modal setShowModal={setNewKeyModal} />}
      {newRoleModal && <Modal setShowModal={setNewRoleModal} />}
    </div>
  );
}
