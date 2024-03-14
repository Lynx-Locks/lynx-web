"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "./buttonsRow.module.css";
import { AddButton, SubmitButton } from "@/components/button/button";
import Modal from "@/components/modal/modal";
import SearchDropdown from "../searchDropdown/searchDropdown";
import { Options, SelectType } from "@/types/selectOptions";
import { getRoleOptions } from "@/data/roles";
import { getDoorOptions } from "@/data/doors";
import axios from "@/axios/client";
import User from "@/types/user";

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

export default function ButtonRow({
  users,
  setUsers,
}: {
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
}) {
  const [newKeyModal, setNewKeyModal] = useState(false);
  const [newRoleModal, setNewRoleModal] = useState(false);
  const [newUserModal, setNewUserModal] = useState(false);
  const [newUser, setNewUser] = useState<{ name: string; email: string }>({
    name: "",
    email: "",
  });
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

  const emails = users.map((user) => ({
    label: user.email,
    value: user.id.toString(),
  }));

  const buttons = [
    {
      id: 1,
      name: "New User",
      onClick: async () => {
        setDisabled(false);
        setRoles(await getRoleOptions());
        setNewUserModal(true);
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
    setNewUserModal(false);
    setNewRoleModal(false);
    setNewUser({ name: "", email: "" });
    setNewRole({ name: "" });
    setSelectedEmailOption(null);
    setSelectedRoleOption(null);
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
    } else if (newUserModal) {
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
      }
    }

    setSelectedEmailOption(null);
    setSelectedRoleOption(null);
    setSelectedDoorOption(null);
    setNewKeyModal(false);
    setNewRoleModal(false);
    setNewUserModal(false);
    setDisabled(false);
    setNewUser({ name: "", email: "" });
    setNewRole({ name: "" });
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
