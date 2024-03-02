"use client";

import React from "react";
import styles from "./search.module.css";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Search({
  placeholder,
  searchInput,
  setSearchInput,
}: {
  placeholder: string;
  searchInput: string;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSearchInput(e.target.value);
  };

  return (
    <div className={styles.searchContainer}>
      <span className={styles.searchIcon}>
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        onChange={handleChange}
        value={searchInput}
        className={styles.searchInput}
      />
    </div>
  );
}
