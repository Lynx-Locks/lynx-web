"use client";

import { useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { useSearchParams } from "next/navigation";
import axios from "@/axios/client";
import LoadingStatus from "@/types/loadingStatus";
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types";
import { SubmitButton } from "@/components/button/button";
import styles from "./authorize.module.css";
import Loader from "@/components/loader/loader";

export default function AuthorizeUser() {
  const searchParams = useSearchParams();
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(
    LoadingStatus.Nil,
  );

  async function loginWithPasskey() {
    setLoadingStatus(LoadingStatus.Loading);
    const doorId = searchParams.get("doorId");

    try {
      const resp = await axios.post(`/auth/authorize/request`);
      // Do webauthn stuff
      const options: PublicKeyCredentialRequestOptionsJSON = resp.data;
      // Prompt user to user passkey
      const credential = await startAuthentication(options);
      // verify the credential
      // TODO: send door_id to ensure user has door access
      const verifyResp = await axios.post(
        `/auth/authorize/response/${doorId}/${btoa(options.challenge)}`, // bas64 encode the challenge because it will not parse chars like '-' and '_'
        {
          ...credential,
        },
      );

      if (verifyResp.status === 200) {
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
        <SubmitButton onClick={() => loginWithPasskey()} text="Log In" />
      )}
      {loadingStatus === LoadingStatus.Loading && <Loader />}
      {loadingStatus === LoadingStatus.Success && (
        <div>Success. You may now close this window.</div>
      )}
      {loadingStatus === LoadingStatus.Error && (
        <div>
          Error. Something went wrong with your request. Please verify your
          credentials and contact your administrator if issue persists.
        </div>
      )}
    </div>
  );
}
