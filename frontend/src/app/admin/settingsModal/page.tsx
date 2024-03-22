"use client";

import Modal from "@/components/modal/modal";
import { Options, SelectType } from "@/types/selectOptions";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import axios from "@/axios/client";
import User from "@/types/user";
import { AdminContext } from "../layout";
import { getRoleOptions, getRolesForUser } from "@/data/roles";
import styles from "../modals.module.css";
import SearchDropdown from "@/components/searchDropdown/searchDropdown";
import { SubmitButton } from "@/components/button/button";
import Loader from "@/components/loader/loader";

export default function SettingsModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [settingsUser, setSettingsUser] = useState<User | null>(null);
  const [selectedRoleOption, setSelectedRoleOption] =
    useState<SelectType>(null);
  const [roles, setRoles] = useState<Options[]>([]);
  const [user, setUser] = useState<{
    id?: number;
    name?: string;
    isAdmin?: boolean;
  }>({});
  const { users, setUsers } = useContext(AdminContext);

  const userId = searchParams.get("userId");

  useEffect(() => {
    const f = async () => {
      if (userId) {
        setSelectedRoleOption(await getRolesForUser(parseInt(userId)));
        setRoles(await getRoleOptions());
        const userResp = await axios.get(`/users/${userId}`);
        setSettingsUser(userResp.data);
      }
    };
    f();
    if (localStorage.getItem("user")) {
      const user = JSON.parse(String(localStorage.getItem("user")));
      setUser(user);
    }
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

  const handleModalClose = () => {
    router.push("/admin");
  };

  const handleSubmitSettings = () => {
    updateUser(settingsUser!, selectedRoleOption);
    handleModalClose();
  };

  const handleGetToken = () => {
    router.push(`/admin/settingsModal/tokenConfirmation`);
  };

  const handleDeleteUser = async () => {
    if (confirm("Are you sure you want to delete this user?") && settingsUser) {
      await axios.delete(`/users`, {
        data: {
          users: [settingsUser.id],
        },
      });
      const newUsers = users.filter((u) => u.id !== settingsUser.id);
      setUsers(newUsers);
      handleModalClose();
    }
  };

  const handleRevokeKey = async () => {
    if (confirm("Are you sure you want to revoke this user's keys?")) {
      const resp = await axios.delete(`/users/creds`, {
        data: {
          users: [settingsUser?.id],
        },
      });
      if (resp.status === 200) {
        alert("Keys revoked successfully");
        handleModalClose();
      }
    }
  };

  const handleRefreshSessionData = async () => {
    if (confirm("Are you sure you want to refresh the session data?")) {
      await axios.delete(`/credentials/session`);
      handleModalClose();
    }
  };

  const handleSettingsTextChange = (
    user: User,
    key: "name" | "email",
    value: string,
  ) => {
    setSettingsUser({ ...user, [key]: value });
  };

  return (
    <Modal
      closeModal={handleModalClose}
      title={settingsUser ? `Settings for ${settingsUser.name}` : "Settings"}
      content={
        settingsUser ? (
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
                  handleSettingsTextChange(
                    settingsUser,
                    "email",
                    e.target.value,
                  )
                }
              />
              <div className={styles.settingsInputLabel}>Roles:</div>
              <SearchDropdown
                defaultValue={
                  Array.isArray(selectedRoleOption) ? selectedRoleOption : []
                }
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
              {user?.id === settingsUser.id ? (
                <button
                  className={styles.deleteButton}
                  onClick={handleGetToken}
                >
                  Get Access Token
                </button>
              ) : (
                <button
                  className={styles.deleteButton}
                  onClick={handleDeleteUser}
                >
                  Delete User
                </button>
              )}
              {user?.id === settingsUser.id && (
                <button
                  className={styles.deleteButton}
                  onClick={handleRefreshSessionData}
                >
                  Refresh Session Data
                </button>
              )}
            </div>
            <div className={styles.modalButtonGroup}>
              <SubmitButton
                text="Submit Changes"
                onClick={handleSubmitSettings}
              />
            </div>
          </div>
        ) : (
          Loader()
        )
      }
    />
  );
}
