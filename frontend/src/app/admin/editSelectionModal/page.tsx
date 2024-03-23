"use client";

import Modal from "@/components/modal/modal";
import { useSearchParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import axios from "@/axios/client";
import User from "@/types/user";
import SearchDropdown from "@/components/searchDropdown/searchDropdown";
import { Options, SelectType } from "@/types/selectOptions";
import styles from "../modals.module.css";
import { SubmitButton } from "@/components/button/button";
import { getRoleOptions } from "@/data/roles";
import Loader from "@/components/loader/loader";
import { AdminContext, SubmitSelectedUsersContext } from "../layout";

export default function EditSelectionModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [disabled, setDisabled] = useState(false);
  const [userOptions, setUserOptions] = useState<Options[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SelectType>(null);
  const [user, setUser] = useState<{
    id?: number;
    name?: string;
    isAdmin?: boolean;
  }>({});
  const [roles, setRoles] = useState<Options[]>([]);
  const [selectedRoleOption, setSelectedRoleOption] =
    useState<SelectType>(null);
  const { users, setUsers } = useContext(AdminContext);
  const { setSubmitted } = useContext(SubmitSelectedUsersContext);

  useEffect(() => {
    const f = async () => {
      if (searchParams.get("users")) {
        const usersResp = await axios.get("/users", {
          params: {
            users: searchParams.get("users"),
          },
        });
        setSelectedUsers(
          usersResp.data.map((user: User) => ({
            label: user.name,
            value: user.id.toString(),
          })),
        );
        const options = await axios.get("/users");
        setUserOptions(
          options.data.map((user: User) => ({
            label: user.name,
            value: user.id.toString(),
          })),
        );
        setUserOptions(
          usersResp.data.map((user: User) => ({
            label: user.email,
            value: user.id.toString(),
          })),
        );
        setRoles(await getRoleOptions());
        if (localStorage.getItem("user")) {
          const user = JSON.parse(String(localStorage.getItem("user")));
          setUser(user);
        }
      }
    };
    f();
  }, [searchParams]);

  const handleModalSubmit = async () => {
    setDisabled(true);
    setSubmitted(true);

    const users = selectedUsers as Options[];
    const roles = (selectedRoleOption as Options[]).map((role) => ({
      id: parseInt(role.value),
    }));
    for (const user of users) {
      await axios.put(`/users`, {
        id: parseInt(user.value),
        roles,
      });
    }

    router.push("/admin");
  };

  const handleModalClose = () => {
    router.push("/admin");
  };

  const handleDeleteUsers = async () => {
    if (
      confirm("Are you sure you want to delete these users?") &&
      Array.isArray(selectedUsers)
    ) {
      await axios.delete(`/users`, {
        data: {
          users: selectedUsers.map((u) => parseInt(u.value)),
        },
      });
      const newUsers = users.filter(
        (u) => !selectedUsers.some((s) => parseInt(s.value) === u.id),
      );
      setUsers(newUsers);
      setSubmitted(true);
      handleModalClose();
    }
  };

  const handleRevokeKeys = async () => {
    if (
      confirm("Are you sure you want to revoke this user's keys?") &&
      Array.isArray(selectedUsers)
    ) {
      const resp = await axios.delete(`/users/creds`, {
        data: {
          users: selectedUsers.map((u) => parseInt(u.value)),
        },
      });
      if (resp.status === 200) {
        alert("Keys revoked successfully");
        handleModalClose();
      }
    }
  };

  const editSelectionModalContent = (
    <div className={styles.modalContentContainer}>
      <SearchDropdown
        defaultValue={Array.isArray(selectedUsers) ? selectedUsers : []}
        options={userOptions}
        placeholder="Select User(s)..."
        subheader="Users"
        setSelectedOption={setSelectedUsers}
        selectDropdown="tableModal"
        isMulti
      />
      {Array.isArray(selectedUsers) && selectedUsers.length > 0 && (
        <div className={styles.modalContentContainer}>
          <SearchDropdown
            options={roles}
            placeholder="Select Role(s)..."
            subheader="Roles"
            selectDropdown="tableModal"
            setSelectedOption={setSelectedRoleOption}
            isMulti
          />
          {!selectedUsers.some((u) => parseInt(u.value) === user.id) && (
            <div className={styles.settingsButtonGroup}>
              <button
                className={styles.deleteButton}
                onClick={handleRevokeKeys}
              >
                Revoke Keys
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleDeleteUsers}
              >
                Delete Users
              </button>
            </div>
          )}
          <div className={styles.modalButtonGroup}>
            <SubmitButton
              disabled={disabled}
              text="Submit"
              onClick={handleModalSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      closeModal={handleModalClose}
      title="Edit Selected Users"
      content={
        disabled || !selectedUsers ? Loader() : editSelectionModalContent
      }
    />
  );
}
