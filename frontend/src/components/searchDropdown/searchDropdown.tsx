"use client";

import { useEffect, useState } from "react";
import styles from "./searchDropdown.module.css";
import Select from "react-select";

interface Options {
  label: string;
  value: string;
}

export default function SearchDropdown({
  options,
  placeholder,
  subheader,
  isMulti = false,
}: {
  options: Options[];
  placeholder: string;
  subheader: string;
  isMulti?: boolean;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  return (
    <div className={styles.searchDropdownContainer}>
      <h2 className={styles.subheader}>{subheader}</h2>
      {isMounted && (
        <Select
          className={styles.selectDropdown}
          options={options}
          name={subheader}
          placeholder={placeholder}
          isMulti={isMulti}
        />
      )}
    </div>
  );
}
