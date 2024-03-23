import React, { Dispatch, SetStateAction } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import styles from "./errorMessage.module.css";
import LoadingStatus from "@/types/loadingStatus";

export default function ErrorMessage({
  setLoadingStatus,
  text = "Error. Something went wrong with your request. Please contact your administrator.",
}: {
  setLoadingStatus?: Dispatch<SetStateAction<LoadingStatus>>;
  text?: string;
}) {
  return (
    <div className={styles.errorMessage}>
      <div className={styles.icon}>
        <FaExclamationCircle size={48} color="#f44336" />
      </div>
      <div className={styles.text}>
        <p>{text}</p>
      </div>
      <div className={styles.warning}>
        <span role="img" aria-label="warning" style={{ fontSize: "24px" }}>
          ⚠️
        </span>
      </div>
      {setLoadingStatus && (
        <button
          className={styles.tryAgainButton}
          onClick={() => setLoadingStatus(LoadingStatus.Nil)}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
