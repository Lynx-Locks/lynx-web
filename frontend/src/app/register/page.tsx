"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "@/axios/client";
import { startRegistration } from "@simplewebauthn/browser";
import { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/types";
import { SubmitButton } from "@/components/button/button";
import LoadingStatus from "@/types/loadingStatus";
import styles from "./register.module.css";
import Loader from "@/components/loader/loader";

export default function RegisterUser() {
  const searchParams = useSearchParams();
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(
    LoadingStatus.Nil,
  );
  const [yubiKeySerial, setYubiKeySerial] = useState("");

  async function registerPasskey() {
    const token = searchParams.get("token");

    // Decode token & check validity
    // TODO: verify token is valid in backend during registerRequest
    try {
      // parse YubiKey OTP
      let yubiKeyId;
      if (yubiKeySerial.length) {
        if (yubiKeySerial.length !== 44) {
          alert("Invalid YubiKey OTP");
          return;
        }
        yubiKeyId = yubiKeySerial.slice(0, 12);
      }

      setLoadingStatus(LoadingStatus.Loading);
      const resp = await axios.post(`/auth/register/request/${token}`, {
        yubiKeyId,
      });
      // Do webauthn stuff
      const options: PublicKeyCredentialCreationOptionsJSON = resp.data;
      // Prompt user to generate a passkey
      const credential = await startRegistration(options);
      // send public key to backend
      const status = await axios.post(`/auth/register/response/${token}`, {
        ...credential,
        challenge: options.challenge,
      });
      if (status.status === 200) {
        setLoadingStatus(LoadingStatus.Success);
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
      {loadingStatus === LoadingStatus.Success && (
        <div>Success. You may now close this window.</div>
      )}
      {loadingStatus === LoadingStatus.Error && (
        <div>
          Error. Something went wrong with your request. Please contact your
          administrator.
        </div>
      )}
    </div>
  );
}
