"use client";

import { useEffect, useState } from "react";
import styles from "./searchDropdown.module.css";
import Select, { ActionMeta } from "react-select";
import { Options, SelectType } from "@/types/selectOptions";

export default function SearchDropdown({
  options,
  placeholder,
  subheader,
  setSelectedOption,
  selectDropdown = "tableModal",
  isMulti = false,
}: {
  options: Options[];
  placeholder: string;
  subheader: string;
  selectDropdown: "tableModal" | "settingsModal";
  setSelectedOption: (selectedOption: SelectType) => void;
  isMulti?: boolean;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const customStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: "rgb(var(--background-rgb))",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "rgb(var(--foreground-rgb))",
    }),
    option: (base: any, state: any) => ({
      ...base,
      color: "rgb(var(--foreground-rgb))",
      backgroundColor: state.isSelected
        ? "rgba(var(--button-rgb),.9)"
        : "rgb(var(--background-rgb))",
      padding: ".5rem 3rem .5rem .5rem",
      cursor: "pointer",
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "rgba(var(--button-rgb), 0.75)",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "rgb(var(--foreground-rgb))",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: "rgb(var(--foreground-rgb))",
      ":hover": {
        backgroundColor: "rgb(var(--button-rgb))",
      },
    }),
    menu: (base: any) => ({
      ...base,
      // override border radius to match the box
      borderRadius: 0,
      // kill the gap
      marginTop: 0,
    }),
    menuList: (base: any) => ({
      ...base,
      // kill the white space on first and last option
      padding: 0,
    }),
  };

  return (
    <div className={styles.searchDropdownContainer}>
      <h2 className={styles.subheader}>{subheader}</h2>
      {isMounted && (
        <Select
          className={styles[selectDropdown]}
          styles={customStyles}
          options={options}
          name={subheader}
          placeholder={placeholder}
          isMulti={isMulti}
          onChange={(selectedOptions: SelectType, _: ActionMeta<Options>) =>
            setSelectedOption(selectedOptions)
          }
        />
      )}
    </div>
  );
}
