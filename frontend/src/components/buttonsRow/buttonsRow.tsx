"use client";

import { useEffect, useState } from "react";
import styles from "./buttonsRow.module.css";
import { AddButton, SubmitButton } from "@/components/button/button";
import Modal from "@/components/modal/modal";
import SearchDropdown from "../searchDropdown/searchDropdown";
import { Options, SelectType } from "@/types/selectOptions";
import { getRoleOptions } from "@/data/roles";
import { getDoorOptions } from "@/data/doors";
import axios from "@/axios/client";

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

export default function ButtonRow({
  emails,
}: {
  emails: { label: string; value: string }[];
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

  useEffect(() => {
    async function fetchRoles() {
      const roles = await getRoleOptions();
      setRoles(roles);
    }

    async function fetchDoors() {
      const doors = await getDoorOptions();
      setDoors(doors);
    }

    fetchRoles();
    fetchDoors();
  }, []);

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
    setNewUser({ name: "", email: "" });
    setNewRole({ name: "" });
    setSelectedEmailOption(null);
    setSelectedRoleOption(null);
  };

  const handleModalSubmit = async () => {
    console.log(selectedEmailOption, selectedRoleOption);
    if (newKeyModal) {
      // TODO: handle adding new key (call email workflow to send email to user to register key)
    } else if (newRoleModal) {
      // handle adding new role
      // TODO: verify this flow is correct once user <-> role relationship is implemented
      await axios.post("/roles", {
        name: newRole.name,
        users: Array.isArray(selectedEmailOption)
          ? selectedEmailOption.map((email: Options) => parseInt(email.value))
          : [],
        doors: Array.isArray(selectedDoorOption)
          ? selectedDoorOption.map((door: Options) => parseInt(door.value))
          : [],
      });
    } else if (newUserModal) {
      // handle adding new user
      if (emailRegex.test(newUser.email)) {
        const userResp = await axios.post("/users", {
          name: newUser.name,
          email: newUser.email,
          roles: Array.isArray(selectedRoleOption)
            ? selectedRoleOption.map((role: Options) => parseInt(role.value))
            : [],
        });

        const user = userResp.data;

        // TODO: this should be part of posting to users
        const rolesResp = await axios.post(`/users/${user.id}/roles`, {
          roleIds: Array.isArray(selectedRoleOption)
            ? selectedRoleOption.map((role: Options) => parseInt(role.value))
            : [],
        });

        // TODO: save user to state

        // TODO: send email for user to register a key
      }
    }

    // TODO: uncomment these lines when the functionality is implemented
    // setSelectedEmailOption(null);
    // setSelectedRoleOption(null);
    // setNewKeyModal(false);
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
      <SubmitButton text="Submit" onClick={handleModalSubmit} />
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
