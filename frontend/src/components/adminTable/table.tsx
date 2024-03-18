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
import Loader from "@/components/loader/loader";
import { useRouter } from "next/navigation";

export default function AdminTable({ users }: { users: User[] }) {
  const router = useRouter();
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
        return (
          (first.timeIn &&
            second.timeIn &&
            first.timeIn.localeCompare(second.timeIn)) ||
          (sortBy?.sort === "asc" ? 1 : -1)
        );
      } else if (sortBy?.name === "Date") {
        return (
          (first.lastDateIn &&
            second.lastDateIn &&
            first.lastDateIn.localeCompare(second.lastDateIn)) ||
          (sortBy?.sort === "asc" ? 1 : -1)
        );
      } else if (sortBy?.name === "Email") {
        return first.email.localeCompare(second.email);
      } else if (sortBy?.name === "Name") {
        return first.name.localeCompare(second.name);
      }
      return 0;
    });
    setSortedUsers(newUsers);
  }, [columnHeaders, setSortedUsers, users]);

  const handleClickSettings = async (idx: number) => {
    const user = sortedUsers[idx];
    router.push(`/admin/settingsModal/?userId=${user.id}`);
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

  return (
    <div className={styles.tableContainer}>
      {sortedUsers.length === 0 ? (
        <Loader />
      ) : (
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
                <td className={styles.tableCell}>{user.timeIn || "N/A"}</td>
                <td className={styles.tableCell}>{user.lastDateIn || "N/A"}</td>
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
      )}
    </div>
  );
}
