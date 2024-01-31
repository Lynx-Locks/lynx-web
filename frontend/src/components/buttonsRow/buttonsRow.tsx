"use client";

import { useState } from "react";
import styles from "./buttonsRow.module.css";
import { AddButton, SubmitButon } from "@/components/addButton/button";
import Modal from "@/components/modal/modal";
import Select from "react-select";
import SearchDropdown from "../searchDropdown/searchDropdown";

const employeeRoles = [
  { label: "Security", value: "security" },
  { label: "CEO", value: "ceo" },
  { label: "Janitor", value: "janitor" },
  { label: "Delivery", value: "delivery" },
  { label: "IT Specialist", value: "it_specialist" },
  { label: "Human Resources", value: "human_resources" },
  { label: "Marketing Manager", value: "marketing_manager" },
  { label: "Accountant", value: "accountant" },
  { label: "Customer Service Representative", value: "customer_service_rep" },
  { label: "Project Manager", value: "project_manager" },
];

const emails = [
  {
    label: "email1@example.com",
    value: "60936b22-39f4-4dab-9b32-54b780ff245c",
  },
  {
    label: "email2@example.com",
    value: "b4b57384-6a72-46bd-8163-10dc1d59e44a",
  },
  {
    label: "email3@example.com",
    value: "8c68531b-d6bc-4a1a-9c7e-5c75c8702249",
  },
  {
    label: "email4@example.com",
    value: "f50a7a63-874d-49a4-a09f-9a36a5505980",
  },
  {
    label: "email5@example.com",
    value: "2b4f82f9-4d12-41f5-8713-7b7f2824428d",
  },
  {
    label: "email6@example.com",
    value: "7a5cf1d2-2c5a-4f6a-813d-aa2fc7d7df62",
  },
  {
    label: "email7@example.com",
    value: "fc8376c8-0c06-4f78-a3d9-b48b0e1ea46c",
  },
  {
    label: "email8@example.com",
    value: "e062f0b2-8ec7-42da-a17d-42a26ef11c1e",
  },
  {
    label: "email9@example.com",
    value: "c8f72e77-9b92-4e0d-9f32-9e36516b5298",
  },
  {
    label: "email10@example.com",
    value: "9c2e3e2d-93da-4f9d-a1f2-d18139d4a97b",
  },
];

const entrypoints = [
  { label: "Main Entrance", value: "main_entrance" },
  { label: "Side Entrance A", value: "side_entrance_a" },
  { label: "Side Entrance B", value: "side_entrance_b" },
  { label: "Back Entrance", value: "back_entrance" },
  { label: "Emergency Exit 1", value: "emergency_exit_1" },
  { label: "Emergency Exit 2", value: "emergency_exit_2" },
  { label: "Front Lobby Exit", value: "front_lobby_exit" },
  { label: "Parking Lot Gate", value: "parking_lot_gate" },
  { label: "Stairwell Exit", value: "stairwell_exit" },
  { label: "Conference Room Exit", value: "conference_room_exit" },
];

export default function ButtonRow() {
  const [newKeyModal, setNewKeyModal] = useState(false);
  const [newRoleModal, setNewRoleModal] = useState(true);

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
      <SearchDropdown
        options={emails}
        placeholder="Add Email..."
        subheader="Email"
      />
      <SearchDropdown
        options={employeeRoles}
        placeholder="Select Role..."
        subheader="Role"
        isMulti
      />
      <SubmitButon text="Submit" onClick={() => setNewKeyModal(false)} />
    </div>
  );

  const newRoleModalContent = (
    <div>
      <SearchDropdown
        options={emails}
        placeholder="Add Email..."
        subheader="Email"
        isMulti
      />
      <SearchDropdown
        options={entrypoints}
        placeholder="Add Entrypoint..."
        subheader="Entrypoints"
        isMulti
      />
      <SubmitButon text="Submit" onClick={() => setNewRoleModal(false)} />
    </div>
  );

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
          content={newRoleModalContent}
        />
      )}
    </div>
  );
}
