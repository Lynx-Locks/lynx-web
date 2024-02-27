"use client";

import { useState } from "react";
import styles from "./login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            className={styles.input}
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
