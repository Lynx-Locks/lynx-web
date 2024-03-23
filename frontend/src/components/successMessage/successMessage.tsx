import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import styles from "./successMessage.module.css";

const SuccessMessage: React.FC = () => {
  return (
    <div className={styles.successMessageContainer}>
      <div className={styles.successMessage}>
        <div className={styles.icon}>
          <FaCheckCircle size={48} color="#4CAF50" />
        </div>
        <div className={styles.text}>
          <p>Success! You may now close this window.</p>
        </div>
        <div className={styles.confetti}>
          <span role="img" aria-label="confetti" style={{ fontSize: "24px" }}>
            🎉
          </span>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;
