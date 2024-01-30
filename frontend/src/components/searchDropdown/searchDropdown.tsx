"use client";

import { useEffect, useState } from "react";
import styles from "./searchDropdown.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function SearchDropdown({
  options,
  placeholder,
}: {
  options: string[];
  placeholder: string;
}) {
  const [searchOptions, setSearchOptions] = useState<string[]>([]);
  const [searchActive, setSearchActive] = useState(false);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    setSearchOptions(options);
  }, [setSearchOptions, options]);

  const filterSearchOptions = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filteredOptions = options.filter((option) => {
      return option.toLowerCase().includes(e.target.value.toLowerCase());
    });
    setSearchOptions(filteredOptions);
    setSelected(e.target.value);
  };

  const keyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      e.currentTarget.blur();
    }
  };

  return (
    <div className={styles.searchDropdownContainer}>
      <span className={styles.searchDropdownIcon}>
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </span>
      <input
        className={styles.searchDropdownInput}
        type="text"
        placeholder={placeholder}
        onFocus={() => setSearchActive(true)}
        onBlur={() => setSearchActive(false)}
        onChange={filterSearchOptions}
        onKeyDown={keyDown}
        value={selected}
      />
      {searchActive && (
        <ul className={styles.dropdownSelect} id="dropdownOptions">
          {searchOptions.map((searchOption) => (
            <li
              key={searchOption}
              className={styles.dropdownSelectItem}
              value={searchOption}
              onMouseDown={() => setSelected(searchOption)}
            >
              {searchOption}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
