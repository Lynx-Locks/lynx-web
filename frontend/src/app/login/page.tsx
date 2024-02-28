"use client";

import { useState } from "react";
import styles from "./login.module.css";
import axios from "@/axios/client";
import { startAuthentication } from "@simplewebauthn/browser";
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types";

const Login = () => {
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    try {
      const userResp = await axios.get("/users/login", {
        params: {
          email,
        },
      });

      const user = userResp.data;

      console.log(user);

      const response = await axios.post(`/auth/signin/request/${user.id}`);

      const options: PublicKeyCredentialRequestOptionsJSON = response.data;
      // Prompt user to user passkey
      const credential = await startAuthentication(options);
      // verify the credential
      const verifyResp = await axios.post(`/admin/login/${user.id}`, {
        ...credential,
        challenge: options.challenge,
      });

      const { token } = verifyResp.data;
      // debugger;
      if (verifyResp.status === 200 && token) {
        // setToken(token);
        localStorage.setItem("token", token);
      } else {
        throw new Error("Error validating credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login error: ", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Login</h2>
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
      <button
        type="submit"
        className={styles.submitButton}
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
};

export default Login;
