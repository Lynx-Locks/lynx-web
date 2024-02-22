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
      const rawResp: LoginRequest = resp.data;
      console.log(rawResp)
      debugger;
      const options: PublicKeyCredentialRequestOptionsJSON = {
        // allowCredentials: rawResp.allowCredentials.map((cred) => (
        //    {
        //     id:cred.id,
        //     type: cred.type,
        //     transports: cred.transports,}
        // )          ),
        challenge: rawResp.challenge,
        rpId: rawResp.rpId,
        timeout: rawResp.timeout,
        userVerification: rawResp.userVerification
      }

      const credential = await startAuthentication(options);

      console.log(credential);
      debugger;
      
      // verify the credential
      const verifyResp = await axios.post("/auth/signin/response", {
        ...credential,
        challenge: rawResp.challenge,
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
