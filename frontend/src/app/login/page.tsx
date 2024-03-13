"use client";

import { useEffect, useState } from "react";
import styles from "./login.module.css";
import axios from "@/axios/client";
import { startAuthentication } from "@simplewebauthn/browser";
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types";
import { useRouter, useSearchParams } from "next/navigation";

const isValidEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

const Login = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const referrer = searchParams.get("token");

  const handleLogin = async () => {
    try {
      const userResp = await axios.get("/users/login", {
        params: {
          email,
        },
      });

      const user = userResp.data;
      const response = await axios.post(`/login/request/${user.id}`);
      const options: PublicKeyCredentialRequestOptionsJSON = response.data;
      // Prompt user to user passkey
      const credential = await startAuthentication(options);
      // verify the credential
      const verifyResp = await axios.post(`/login/${user.id}`, {
        ...credential,
        challenge: options.challenge,
      });

      if (verifyResp.status === 200) {
        // We can set any non-private user info in local storage to avoid addition requests
        localStorage.setItem("name", user.name);
        if (referrer) {
          router.push(referrer);
        } else if (user.isAdmin) {
          router.push("/admin/");
        } else {
          router.push("/");
        }
      } else {
        throw new Error("Error validating credentials. Please try again.");
      }
    } catch (error) {
      alert(`Error validating credentials. Please try again.`);
      console.error("Login error: ", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.loginTitle}>Login</h2>
      <div className={styles.inputGroup}>
        <h3 className={styles.inputLabel}>Email</h3>
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
        disabled={email == ""}
        style={
          email.match(isValidEmail)
            ? {}
            : {
                backgroundColor: "grey",
                cursor: "not-allowed",
              }
        }
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
};

export default Login;
