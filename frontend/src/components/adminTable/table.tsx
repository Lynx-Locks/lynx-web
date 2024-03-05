"use client";

import User from "@/types/user";
import styles from "./table.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretUp,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import Modal from "@/components/modal/modal";
import { SubmitButton } from "@/components/button/button";
import SearchDropdown from "../searchDropdown/searchDropdown";
import { employeeRoles } from "@/constants/roles";

export default function AdminTable({
  users,
  updateUser,
}: {
  users: User[];
  updateUser: (user: User) => void;
}) {
  const [settingsUser, setSettingsUser] = useState<User | null>(null);
  const [columnHeaders, setColumnHeaders] = useState([
    {
      name: "Name",
      sort: "",
    },
    {
      name: "Email",
      sort: "",
    },
    {
      name: "Last Time In",
      sort: "",
    },
    {
      name: "Date",
      sort: "",
    },
  ]);
  const [sortedUsers, setSortedUsers] = useState(users);

  useEffect(() => {
    const sortBy = columnHeaders.find((header) => header.sort !== "");
    const newUsers = [...users];
    newUsers.sort((a, b) => {
      const first = sortBy?.sort === "asc" ? a : b;
      const second = sortBy?.sort === "asc" ? b : a;
      if (sortBy?.name === "Last Time In") {
        return first.timeIn.localeCompare(second.timeIn);
      } else if (sortBy?.name === "Date") {
        return first.lastDateIn.localeCompare(second.lastDateIn);
      } else if (sortBy?.name === "Email") {
        return first.email.localeCompare(second.email);
      } else if (sortBy?.name === "Name") {
        return first.name.localeCompare(second.name);
      }
      return 0;
    });
    setSortedUsers(newUsers);
  }, [columnHeaders, setSortedUsers, users]);

  const handleClickSettings = (idx: number) => {
    setSettingsUser(sortedUsers[idx]);
  };

  const closeModal = (_: boolean) => {
    setSettingsUser(null);
  };

  const handleSort = (idx: number) => {
    const newColumnHeaders = columnHeaders.map((header, i) => {
      if (i === idx) {
        return {
          ...header,
          sort: header.sort === "asc" ? "desc" : "asc",
        };
      }
      return {
        ...header,
        sort: "",
      };
    });
    setColumnHeaders(newColumnHeaders);
  };

  const handleSettingsTextChange = (
    user: User,
    key: "name" | "email",
    value: string
  ) => {
    setSettingsUser({ ...user, [key]: value });
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table} border={1} rules="rows">
        <thead className={styles.tableHeader}>
          <tr>
            <th className={styles.tableCell}>
              <input type="checkbox" />
            </th>
            {columnHeaders.map((header, idx) => (
              <th key={idx} className={styles.tableCell}>
                <p className={styles.columnHeader}>{header.name}</p>
                <button onClick={() => handleSort(idx)}>
                  {header.sort === "asc" ? (
                    <FontAwesomeIcon icon={faCaretUp} size="lg" />
                  ) : (
                    <FontAwesomeIcon icon={faCaretDown} size="lg" />
                  )}
                </button>
              </th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user, idx) => (
            <tr
              key={user.id}
              className={
                idx < users.length - 1 ? styles.tableRow : styles.tableLastRow
              }
            >
              <td className={styles.tableCell}>
                <input type="checkbox" />
              </td>
              <td className={styles.tableCell}>{user.name}</td>
              <td className={styles.tableCell}>{user.email}</td>
              <td className={styles.tableCell}>{user.timeIn}</td>
              <td className={styles.tableCell}>{user.lastDateIn}</td>
              <td>
                <FontAwesomeIcon
                  className={styles.settingsIcon}
                  icon={faGear}
                  onClick={() => handleClickSettings(idx)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sortedUsers.length === 0 && (
        <h1 className={styles.emptyTable}>Could not display any users</h1>
      )}
      {settingsUser && (
        <Modal
          setShowModal={closeModal}
          title={`Settings for ${settingsUser.name}`}
          content={
            <div className={styles.settingsModal}>
              <div className={styles.settingsInputContainer}>
                <div className={styles.settingsInputLabel}>Name:</div>
                <input
                  className={styles.settingsInput}
                  type="text"
                  value={settingsUser.name}
                  onChange={(e) =>
                    handleSettingsTextChange(
                      settingsUser,
                      "name",
                      e.target.value
                    )
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
                      e.target.value
                    )
                  }
                />
                <div className={styles.settingsInputLabel}>Roles:</div>
                <SearchDropdown
                  options={employeeRoles}
                  placeholder="Select Role..."
                  subheader=""
                  isMulti
                />
              </div>
              <div className={styles.settingsButtonGroup}>
                <button className={styles.settingsButton}>
                  Revoke Credentials
                </button>
                <button className={styles.deleteButton}>Delete User</button>
              </div>
              <SubmitButton
                text="Submit Changes"
                onClick={() => {
                  updateUser(settingsUser);
                  setSettingsUser(null);
                }}
              />
            </div>
          }
        />
      )}
    </div>
  );
}
