"use client";

import User from "@/types/user";
import styles from "./table.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretUp,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { useEffect, useState } from "react";
import Loader from "@/components/loader/loader";
import { useRouter } from "next/navigation";

const sliceUsers = (users: User[], page: number, usersPerPage: number) => {
  return users.slice(
    page * usersPerPage,
    Math.min((page + 1) * usersPerPage, users.length),
  );
};

const filterUsers = (users: User[], searchInput: string) => {
  if (searchInput === "") {
    return users;
  }
  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      user.email.toLowerCase().includes(searchInput.toLowerCase()) ||
      user.timeIn?.toLowerCase().includes(searchInput.toLowerCase()) ||
      user.lastDateIn?.toLowerCase().includes(searchInput.toLowerCase()),
  );
};

export default function AdminTable({
  users,
  searchInput,
}: {
  users: User[];
  searchInput: string;
}) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [usersPerPage, setUsersPerPage] = useState(25);
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
  const [sortedUsers, setSortedUsers] = useState(
    sliceUsers(filterUsers(users, searchInput), page, usersPerPage),
  );
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false); // Track select all checkbox state

  useEffect(() => {
    setSelectedRows([]);
    setSelectAll(false);
  }, [searchInput]);

  useEffect(() => {
    const sortBy = columnHeaders.find((header) => header.sort !== "");
    const newUsers = filterUsers(users, searchInput);
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
    setSortedUsers(sliceUsers(newUsers, page, usersPerPage));
  }, [columnHeaders, page, searchInput, users, usersPerPage]);

  // Handle checkbox change
  const handleCheckboxChange = (id: number) => {
    const newSelectedRows = selectedRows.includes(id)
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === sortedUsers.length);
  };

  // Handle select all checkbox change
  const handleSelectAllChange = () => {
    if (selectAll) {
      // Deselect all rows
      setSelectedRows([]);
    } else {
      // Select all rows
      const allIds = sortedUsers.map((u) => u.id);
      setSelectedRows(allIds);
    }
    setSelectAll(!selectAll); // Toggle select all checkbox state
  };

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

  return sortedUsers.length === 0 ? (
    <div className={styles.loaderContainer}>
      <Loader />
    </div>
  ) : (
    <div className={styles.tableContent}>
      <div className={styles.tableContainer}>
        <table className={styles.table} border={1} rules="rows">
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableCell}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
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
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                  />
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
      </div>
      <div className={styles.tableFooter}>
        <p className={styles.paginationLabel}>Rows per page:</p>
        <select
          className={styles.paginationSelect}
          value={usersPerPage}
          onChange={(e) => setUsersPerPage(parseInt(e.target.value))}
        >
          {[10, 25, 50, 75].map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className={styles.footerPageGroup}>
          <p>
            {page * usersPerPage + 1} -{" "}
            {Math.min((page + 1) * usersPerPage, users.length)} of{" "}
            {users.length}
          </p>
        </div>
        <button
          className={styles.paginationButton}
          onClick={() => setPage(page - 1)}
          disabled={page === 0}
        >
          <RxCaretLeft size={24} />
        </button>
        <button
          className={styles.paginationButton}
          onClick={() => setPage(page + 1)}
          disabled={page === Math.floor(users.length / usersPerPage)}
        >
          <RxCaretRight size={24} />
        </button>
      </div>
    </div>
  );
}
