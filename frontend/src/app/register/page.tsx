"use client";

import { useEffect, useState } from "react";
import styles from "./register.module.css";
import { useSearchParams } from "next/navigation";
import axios from "@/axios/client";
import { startRegistration } from "@simplewebauthn/browser";
import { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/types";

enum LoadingStatus {
  Loading,
  Success,
  Error,
}

export default function RegisterUser() {
  const searchParams = useSearchParams();
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(
    LoadingStatus.Loading,
  );

  async function f() {
    // Decode token & check validity
    const token = searchParams.get("token");

    // TODO: verify token is valid in backend during registerRequest

    const resp = await axios.post(`/auth/register/request`);
    if (resp.status === 200) {
      // Do webauthn stuff
      const options: PublicKeyCredentialCreationOptionsJSON = resp.data;
      console.log(options);
      // Prompt user to generate a passkey
      const credential = await startRegistration(options);

      console.log(credential)
      // send public key to backend
      const status = await axios.post(
        "/auth/register/response", {
          ...credential,
          challenge: options.challenge,
        }
      );
      setLoadingStatus(LoadingStatus.Success);
    } else {
      setLoadingStatus(LoadingStatus.Error);
    }
  }

  return (
    <div className={styles.container}>
      <button onClick={()=>f()}> HERE</button>
      {loadingStatus === LoadingStatus.Success && (
        <div>Success. You may now close this window.</div>
      )}
      {loadingStatus === LoadingStatus.Error && (
        <div>
          Error. Something went wrong with your request. Please contact your
          administrator.
        </div>
      )}
      {loadingStatus === LoadingStatus.Loading && (
        <div className={styles.loader} />
      )}
    </div>
  );
}
