import React from "react";
import { FaExclamationCircle } from "react-icons/fa";
import styles from "./errorMessage.module.css";

const ErrorMessage: React.FC = () => {
  return (
    <div className={styles.errorMessage}>
      <div className={styles.icon}>
        <FaExclamationCircle size={48} color="#f44336" />
      </div>
      <div className={styles.text}>
        <p>
          Error. Something went wrong with your request. Please contact your
          administrator
        </p>
      </div>
      <div className={styles.warning}>
        <span role="img" aria-label="warning" style={{ fontSize: "24px" }}>
          ⚠️
        </span>
      </div>
    </div>
  );
};

export default ErrorMessage;
