"use client";

import { useEffect, useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { useSearchParams } from "next/navigation";
import axios from "@/axios/client";
import LoadingStatus from "@/types/loadingStatus";
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types";
import { SubmitButton } from "@/components/button/button";
import styles from "./authorize.module.css";
import Loader from "@/components/loader/loader";
import SuccessMessage from "@/components/successMessage/successMessage";
import NavLogo from "@/components/navLogo/navLogo";
import ErrorMessage from "@/components/errorMessage/errorMessage";

export default function AuthorizeUser() {
  const searchParams = useSearchParams();
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(
    LoadingStatus.Nil,
  );
  const [authText, setAuthText] = useState<string>("Open");
  const doorId = searchParams.get("doorId");

  useEffect(() => {
    async function getDoorName() {
      const doorInfo = await axios.get(`/doors/${doorId}`);
      setAuthText(`Open ${doorInfo.data.name}`);
    }
    getDoorName();
  });

  async function authorizeWithPasskey() {
    setLoadingStatus(LoadingStatus.Loading);

    try {
      const resp = await axios.post(`/auth/authorize/request`);
      // Do webauthn stuff
      const options: PublicKeyCredentialRequestOptionsJSON = resp.data;
      // Prompt user to user passkey
      const credential = await startAuthentication(options);
      // verify the credential
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
        <div>
          <NavLogo size={128} />
          <SubmitButton
            onClick={() => authorizeWithPasskey()}
            text={authText}
          />
        </div>
      )}
      {loadingStatus === LoadingStatus.Loading && <Loader />}
      {loadingStatus === LoadingStatus.Success && <SuccessMessage />}
      {loadingStatus === LoadingStatus.Error && <ErrorMessage />}
    </div>
  );
}
