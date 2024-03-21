"use client";

import { useEffect, useState } from "react";
import styles from "../modals.module.css";
import { getRoleOptions } from "@/data/roles";
import { Options, SelectType } from "@/types/selectOptions";
import SearchDropdown from "@/components/searchDropdown/searchDropdown";
import { SubmitButton } from "@/components/button/button";
import Modal from "@/components/modal/modal";
import { useRouter } from "next/navigation";
import axios from "@/axios/client";
import { Door } from "@/types/door";

export default function EditRoles() {
  const router = useRouter();
  const [roles, setRoles] = useState<Options[]>([]);
  const [doors, setDoors] = useState<Options[]>([]);
  const [selectedRole, setSelectedRole] = useState<SelectType>(null);
  const [roleName, setRoleName] = useState<string>("");
  const [selectedDoorOption, setSelectedDoorOption] =
    useState<SelectType>(null);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const f = async () => {
      setRoles(await getRoleOptions());
    };
    f();
  }, []);

  const onSelectRole = async (selectedOption: SelectType) => {
    const selectedRole = selectedOption as Options;
    if (selectedOption) {
      const doors = await axios.get(`/roles/${selectedRole.value}/doors`);
      const allDoors = await axios.get(`/doors`);
      setSelectedDoorOption(
        doors.data.map((d: Door) => ({
          label: d.name,
          value: d.id.toString(),
        })),
      );
      setDoors(
        allDoors.data.map((d: Door) => ({
          label: `${d.name} (${d.description})`,
          value: d.id.toString(),
        })),
      );
      setRoleName(selectedRole.label);
    }

    setSelectedRole(selectedRole);
  };

  const handleModalSubmit = async () => {
    setDisabled(true);
    const role = selectedRole as Options;

    await axios.put(`/roles`, {
      id: parseInt(role.value),
      name: roleName,
      doors: Array.isArray(selectedDoorOption)
        ? selectedDoorOption.map((d) => ({ id: parseInt(d.value) }))
        : [],
    });

    router.push("/admin");
  };

  const handleModalClose = () => {
    router.push("/admin");
  };

  const editRolesModalContent = (
    <div className={styles.modalContentContainer}>
      <SearchDropdown
        options={roles}
        placeholder="Select Role to Change..."
        subheader="Roles"
        selectDropdown="tableModal"
        setSelectedOption={onSelectRole}
      />
      {selectedRole && (
        <div>
          <h2 className={styles.subheader}>Name</h2>
          <input
            className={styles.modalInput}
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
          <SearchDropdown
            defaultValue={
              Array.isArray(selectedDoorOption) ? selectedDoorOption : []
            }
            options={doors}
            placeholder="Add Entrypoints..."
            subheader="Entrypoints"
            selectDropdown="tableModal"
            setSelectedOption={setSelectedDoorOption}
            isMulti
          />
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
      title="Edit Roles"
      content={editRolesModalContent}
    />
  );
}
