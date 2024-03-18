"use client";

import { useState } from "react";
import styles from "./buttonsRow.module.css";
import { AddButton, SubmitButton } from "@/components/button/button";
import Modal from "@/components/modal/modal";
import SearchDropdown from "../searchDropdown/searchDropdown";
import { Options, SelectType } from "@/types/selectOptions";
import { getDoorOptions } from "@/data/doors";
import axios from "@/axios/client";
import User from "@/types/user";
import { useRouter } from "next/navigation";

export default function ButtonRow({ users }: { users: User[] }) {
  const [newKeyModal, setNewKeyModal] = useState(false);
  const [newRoleModal, setNewRoleModal] = useState(false);
  const [newRole, setNewRole] = useState<{ name: string }>({
    name: "",
  });
  const [selectedEmailOption, setSelectedEmailOption] =
    useState<SelectType>(null);
  const [selectedRoleOption, setSelectedRoleOption] =
    useState<SelectType>(null);
  const [selectedDoorOption, setSelectedDoorOption] =
    useState<SelectType>(null);
  const [roles, setRoles] = useState<Options[]>([]);
  const [doors, setDoors] = useState<Options[]>([]);
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
      onClick: async () => {
        setDisabled(false);
        setDoors(await getDoorOptions());
        setNewRoleModal(true);
      },
    },
  ];

  const handleModalClose = () => {
    setNewKeyModal(false);
    setNewRoleModal(false);
    setNewRole({ name: "" });
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
    } else if (newRoleModal) {
      // handle adding new role
      const rolesResp = await axios.post("/roles", {
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
      const role = rolesResp.data;
      setRoles([...roles, { label: role.name, value: role.id.toString() }]);
    }

    setSelectedEmailOption(null);
    setSelectedDoorOption(null);
    setNewKeyModal(false);
    setNewRoleModal(false);
    setDisabled(false);
    setNewRole({ name: "" });
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
