"use client";

import Modal from "@/components/modal/modal";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/axios/client";
import User from "@/types/user";
import SearchDropdown from "@/components/searchDropdown/searchDropdown";
import { Options, SelectType } from "@/types/selectOptions";
import styles from "../modals.module.css";
import { SubmitButton } from "@/components/button/button";
import { getRoleOptions } from "@/data/roles";

export default function EditSelectionModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [disabled, setDisabled] = useState(false);
  const [users, setUsers] = useState<Options[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SelectType>(null);
  const [user, setUser] = useState<{
    id?: number;
    name?: string;
    isAdmin?: boolean;
  }>({});
  const [roles, setRoles] = useState<Options[]>([]);
  const [selectedRoleOption, setSelectedRoleOption] =
    useState<SelectType>(null);

  useEffect(() => {
    const f = async () => {
      const usersResp = await axios.get("/users", {
        params: {
          users: searchParams.get("users"),
        },
      });
      console.log(usersResp);
      setUsers(
        usersResp.data.map((user: User) => ({
          label: user.email,
          value: user.id.toString(),
        })),
      );
      setSelectedUsers(
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
    };
    f();
  }, [searchParams]);

  const handleModalSubmit = async () => {
    setDisabled(true);

    router.push("/admin");
  };

  const handleModalClose = () => {
    router.push("/admin");
  };

  const editSelectionModalContent = (
    <div className={styles.modalContentContainer}>
      <SearchDropdown
        defaultValue={Array.isArray(selectedUsers) ? selectedUsers : []}
        options={users}
        placeholder="Select User(s)..."
        subheader="Users"
        selectDropdown="tableModal"
        setSelectedOption={setSelectedUsers}
        isMulti
      />
      <SearchDropdown
        options={roles}
        placeholder="Select Role(s)..."
        subheader="Roles"
        selectDropdown="tableModal"
        setSelectedOption={setSelectedRoleOption}
        isMulti
      />
      {Array.isArray(selectedUsers) &&
        !selectedUsers.some((u) => parseInt(u.value) === user.id) && (
          <div className={styles.settingsButtonGroup}>
            <button className={styles.deleteButton} onClick={() => {}}>
              Revoke Keys
            </button>
            <button className={styles.deleteButton} onClick={() => {}}>
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
  );

  return (
    <Modal
      closeModal={handleModalClose}
      title="Edit Selected Users"
      content={editSelectionModalContent}
    />
  );
}
