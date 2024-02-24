"use client";

import { startAuthentication } from '@simplewebauthn/browser';
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/axios/client";
import base64url from "base64url";
import { LoginRequest, ResponseCredential } from "@/types/webAuthn";
import { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';

enum LoadingStatus {
  Loading,
  Success,
  Error,
}

export default function AuthorizeUser() {
  const searchParams = useSearchParams();
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(
    LoadingStatus.Loading
  );

  async function f() {
    const token = searchParams.get("token");

    // TODO: decode token to get door_id & check if token is valid

    const resp = await axios.post("/auth/signin/request", {
      id: 1,
    });

    if (resp.status === 200) {
      // Do webauthn stuff
      const options: LoginRequest = resp.data;
      const credential = await startAuthentication(options);
      // verify the credential
      const verifyResp = await axios.post("/auth/signin/response", {
        ...credential,
        challenge: options.challenge,
      });

      if (verifyResp.status === 200) {
        setLoadingStatus(LoadingStatus.Success);
      } else {
        setLoadingStatus(LoadingStatus.Error);
      }
    } else {
      setLoadingStatus(LoadingStatus.Error);
    }
  }

  return (
    <div>
      <button onClick={()=>f()}> HERE</button>
      {loadingStatus === LoadingStatus.Loading && <p>Loading...</p>}
      {loadingStatus === LoadingStatus.Success && <p>Success</p>}
      {loadingStatus === LoadingStatus.Error && <p>Error</p>}
    </div>
  );
}
