"use client";

import { useEffect, useState } from "react";
import styles from "../modals.module.css";
import { Options, SelectType } from "@/types/selectOptions";
import SearchDropdown from "@/components/searchDropdown/searchDropdown";
import { SubmitButton } from "@/components/button/button";
import Modal from "@/components/modal/modal";
import { useRouter } from "next/navigation";
import axios from "@/axios/client";
import { getDoorOptions } from "@/data/doors";

// ^ = start of string, $ = end of string, .+ = one or more of any character, \s = whitespace, \( = open parenthesis, \) = close parenthesis
const regex = /^(.+)\s\((.+)\)$/;

const parseDoorInfo = (door: Options) => {
  const match = door.label.match(regex)!;

  return {
    name: match[1],
    description: match[2],
  };
};

export default function EditDoors() {
  const router = useRouter();
  const [doors, setDoors] = useState<Options[]>([]);
  const [selectedDoor, setSelectedDoor] = useState<SelectType>(null);
  const [doorInfo, setDoorInfo] = useState<{
    name: string;
    description: string;
  }>({ name: "", description: "" });
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const f = async () => {
      setDoors(await getDoorOptions());
    };
    f();
  }, []);

  const onSelectDoor = async (selectedOption: SelectType) => {
    const selectedDoor = selectedOption as Options;
    if (selectedOption) {
      const data = parseDoorInfo(selectedDoor);
      setDoorInfo(data);
    }

    setSelectedDoor(selectedDoor);
  };

  const handleModalSubmit = async () => {
    setDisabled(true);
    const door = selectedDoor as Options;

    await axios.put(`/doors`, {
      id: parseInt(door.value),
      name: doorInfo.name,
      description: doorInfo.description,
    });

    router.push("/admin");
  };

  const handleModalClose = () => {
    router.push("/admin");
  };

  const editDoorsModalContent = (
    <div className={styles.modalContentContainer}>
      <SearchDropdown
        options={doors}
        placeholder="Select Door to Change..."
        subheader="Doors"
        selectDropdown="tableModal"
        setSelectedOption={onSelectDoor}
      />
      {selectedDoor && (
        <div>
          <h2 className={styles.subheader}>Name</h2>
          <input
            className={styles.modalInput}
            type="text"
            value={doorInfo.name}
            onChange={(e) => setDoorInfo({ ...doorInfo, name: e.target.value })}
          />
          <h2 className={styles.subheader}>Description</h2>
          <input
            className={styles.modalInput}
            type="text"
            value={doorInfo.description}
            onChange={(e) =>
              setDoorInfo({ ...doorInfo, description: e.target.value })
            }
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
      title="Edit Doors"
      content={editDoorsModalContent}
    />
  );
}
