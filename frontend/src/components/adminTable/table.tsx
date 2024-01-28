"use client";

import User from "@/types/user";
import styles from "./table.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Modal from "@/components/modal/modal";

export default function AdminTable({ users }: { users: User[] }) {
  const [settingsModal, setSettingsModal] = useState(-1);
  const handleClickSettings = (idx: number) => {
    setSettingsModal(idx);
  };

  const closeModal = (open: boolean) => {
    if (!open) {
      setSettingsModal(-1);
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table} border={1} rules="rows">
        <thead className={styles.tableHeader}>
          <tr>
            <th className={styles.tableCell}>
              <input type="checkbox" />
            </th>
            <th className={styles.tableCell}>Name</th>
            <th className={styles.tableCell}>Username</th>
            <th className={styles.tableCell}>Email</th>
            <th className={styles.tableCell}>Last Time In</th>
            <th className={styles.tableCell}>Date</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
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
              <td className={styles.tableCell}>{user.username}</td>
              <td className={styles.tableCell}>{user.email}</td>
              <td className={styles.tableCell}>{user.timeIn}</td>
              <td className={styles.tableCell}>{user.date}</td>
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
      {users.length === 0 && (
        <h1 className={styles.emptyTable}>Could not display any users</h1>
      )}
      {settingsModal >= 0 && <Modal setShowModal={closeModal} />}
    </div>
  );
}
