"use client";

import Modal from "@/components/modal/modal";
import { Options, SelectType } from "@/types/selectOptions";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import axios from "@/axios/client";
import User from "@/types/user";
import { AdminContext } from "../layout";
import { getRoleOptions, getUserRoles } from "@/data/roles";
import styles from "../modals.module.css";
import SearchDropdown from "@/components/searchDropdown/searchDropdown";
import { SubmitButton } from "@/components/button/button";

export default function SettingsModal() {
  const router = useRouter();
  const [settingsUser, setSettingsUser] = useState<User | null>(null);
  const searchParams = useSearchParams();
  const [selectedRoleOption, setSelectedRoleOption] =
    useState<SelectType>(null);
  const [defaultRoles, setDefaultRoles] = useState<Options[]>([]);
  const [roles, setRoles] = useState<Options[]>([]);
  const { users, setUsers } = useContext(AdminContext);

  const userId = searchParams.get("userId");

  useEffect(() => {
    const f = async () => {
      if (userId) {
        setDefaultRoles(await getUserRoles(parseInt(userId)));
        setRoles(await getRoleOptions());
        const userResp = await axios.get(`/users/${userId}`);
        setSettingsUser(userResp.data);
      }
    };
    f();
  }, [userId]);

  if (!userId) {
    router.push("/admin");
    return <div />;
  }

  const updateUser = async (user: User, roles: SelectType) => {
    const newUserResp = await axios.put(`/users`, {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: Array.isArray(roles)
        ? roles.map((r) => ({ id: parseInt(r.value) }))
        : [],
    });
    const newUser = newUserResp.data;
    const newUsers = users.map((u) => {
      if (u.id === newUser.id) {
        return user;
      }
      return u;
    });
    setUsers(newUsers);
  };

  const deleteUser = async (user: User) => {
    axios.delete(`/users/${user.id}`);
    const newUsers = users.filter((u) => u.id !== user.id);
    setUsers(newUsers);
  };

  const closeModal = () => {
    router.push("/admin");
  };

  const handleSubmitSettings = () => {
    updateUser(settingsUser!, selectedRoleOption);
    closeModal();
  };

  const handleDeleteUser = () => {
    if (confirm("Are you sure you want to delete this user?") && settingsUser) {
      deleteUser(settingsUser).then(() => closeModal());
    }
  };

  const handleRevokeKey = async () => {
    if (confirm("Are you sure you want to revoke this user's keys?")) {
      const resp = await axios.delete(`/users/${settingsUser?.id}/creds`);
      if (resp.status === 200) {
        alert("Keys revoked successfully");
      }
    }
  };

  const handleSettingsTextChange = (
    user: User,
    key: "name" | "email",
    value: string,
  ) => {
    setSettingsUser({ ...user, [key]: value });
  };

  return settingsUser ? (
    <Modal
      closeModal={closeModal}
      title={`Settings for ${settingsUser.name}`}
      content={
        <div className={styles.settingsModal}>
          <div className={styles.settingsInputContainer}>
            <div className={styles.settingsInputLabel}>Name:</div>
            <input
              className={styles.settingsInput}
              type="text"
              value={settingsUser.name}
              onChange={(e) =>
                handleSettingsTextChange(settingsUser, "name", e.target.value)
              }
            />
            <div className={styles.settingsInputLabel}>Email:</div>
            <input
              className={styles.settingsInput}
              type="text"
              value={settingsUser.email}
              onChange={(e) =>
                handleSettingsTextChange(settingsUser, "email", e.target.value)
              }
            />
            <div className={styles.settingsInputLabel}>Roles:</div>
            <SearchDropdown
              defaultValue={defaultRoles}
              options={roles}
              placeholder="Select Role(s)..."
              subheader=""
              setSelectedOption={setSelectedRoleOption}
              selectDropdown="settingsModal"
              isMulti
            />
          </div>
          <div className={styles.settingsButtonGroup}>
            <button className={styles.deleteButton} onClick={handleRevokeKey}>
              Revoke Key
            </button>
            <button className={styles.deleteButton} onClick={handleDeleteUser}>
              Delete User
            </button>
          </div>
          <SubmitButton text="Submit Changes" onClick={handleSubmitSettings} />
        </div>
      }
    />
  ) : (
    <div />
  );
}
