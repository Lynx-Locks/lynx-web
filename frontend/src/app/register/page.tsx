"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "@/axios/client";
import { startRegistration } from "@simplewebauthn/browser";
import { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/types";
import { SubmitButton } from "@/components/button/button";
import LoadingStatus from "@/types/loadingStatus";
import styles from "./register.module.css";
import Loader from "@/components/loader/loader";
import NavLogo from "@/components/navLogo/navLogo";
import ErrorMessage from "@/components/errorMessage/errorMessage";

const modhex = {
  c: "0",
  b: "1",
  d: "2",
  e: "3",
  f: "4",
  g: "5",
  h: "6",
  i: "7",
  j: "8",
  k: "9",
  l: "a",
  n: "b",
  r: "c",
  t: "d",
  u: "e",
  v: "f",
};

function modhexToHex(input: string): string {
  return input
    .split("")
    .map((char) => (modhex as Record<string, string>)[char] || char)
    .join("");
}

export default function RegisterUser() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(
    LoadingStatus.Nil,
  );
  const [yubiKeySerial, setYubiKeySerial] = useState("");

  async function registerPasskey() {
    const token = searchParams.get("token");

    // Decode token & check validity
    try {
      // parse YubiKey OTP
      let yubiKeyId;
      if (yubiKeySerial.length) {
        if (yubiKeySerial.length !== 44) {
          alert("Invalid YubiKey OTP");
          return;
        }
        yubiKeyId = parseInt(modhexToHex(yubiKeySerial.slice(0, 12)), 16);
      }

      setLoadingStatus(LoadingStatus.Loading);
      const resp = await axios.post(`/auth/register/request/${token}`);
      // Do webauthn stuff
      const options: PublicKeyCredentialCreationOptionsJSON = resp.data;
      // Prompt user to generate a passkey
      const credential = await startRegistration(options);
      // send public key to backend
      const status = await axios.post(
        `/auth/register/response/${token}/${yubiKeyId}`,
        {
          ...credential,
          challenge: options.challenge,
        },
      );
      if (status.status === 200) {
        router.push(`/authorize/success`);
      }
    } catch (error) {
      console.error(error);
      setLoadingStatus(LoadingStatus.Error);
    }
  }

  return (
    <div className={styles.container}>
      {loadingStatus === LoadingStatus.Nil && (
        <div>
          <div className={styles.registerButton}>
            <NavLogo size={128} />
            <SubmitButton
              onClick={() => registerPasskey()}
              text="Create a New Passkey"
            />
          </div>
          <input
            className={styles.textInput}
            type="text"
            placeholder="Paste YubiKey OTP (leave blank for passkeys)"
            value={yubiKeySerial}
            onChange={(e) => setYubiKeySerial(e.target.value)}
          />
        </div>
      )}
      {loadingStatus === LoadingStatus.Loading && <Loader />}
      {loadingStatus === LoadingStatus.Error && (
        <div>
          <ErrorMessage setLoadingStatus={setLoadingStatus} />
        </div>
      )}
    </div>
  );
}
