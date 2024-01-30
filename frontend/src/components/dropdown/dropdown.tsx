"use client";

import styles from "./dropdown.module.css";

export default function Dropdown({ options }: { options: string[] }) {
  return (
    <div className={styles.dropdownContainer}>
      <select className={styles.dropdownSelect}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
