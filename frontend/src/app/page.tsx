"use client";
import Dashboard from "@/components/dashboard/dashboard";
import Navbar from "@/components/navbar/navbar";
import { startAuthentication } from "@simplewebauthn/browser";
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types";
import axios from "axios";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [token, setToken] = useState("");

  const handleLogin = async (email: string) => {
    try {
      const response = await axios.post("/users/login", {
        email,
      });

      const options: PublicKeyCredentialRequestOptionsJSON = response.data;
      // Prompt user to user passkey
      const credential = await startAuthentication(options);
      // verify the credential
      const verifyResp = await axios.post(`/users/login`, {
        ...credential,
        challenge: options.challenge,
        uid: response.data.uid,
      });

      const { token } = verifyResp.data;
      if (verifyResp.status === 200 && token) {
        setToken(token);
        localStorage.setItem("token", token);
      } else {
        throw new Error("Error validating credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login error: ", error);
    }
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        jwt.verify(token, "secret");
        setToken(token);
        return;
      } catch (error) {
        console.error("Token error: ", error);
        localStorage.removeItem("token");
      }
    }
    // Redirect to login
    redirect("/login");
  }, []);

  return (
    <div>
      {token ? (
        <div>
          <Navbar />
          <Dashboard />;
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}
