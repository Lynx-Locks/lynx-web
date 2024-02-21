"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/axios/client";
import base64url from "base64url";
import { LoginRequest, ResponseCredential } from "@/types/webAuthn";

// endpoints: /auth/signin/request

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

  useEffect(() => {
    async function f() {
      const token = searchParams.get("token");

      // TODO: decode token to get door_id & check if token is valid

      const resp = await axios.post("/auth/signin/request", {
        id: 1,
      });

      if (resp.status === 200) {
        // Do webauthn stuff
        const rawResp: LoginRequest = resp.data;
        const options: PublicKeyCredentialRequestOptions = {
          // allowCredentials: rawResp.allowCredentials.map((cred) => (
          //    {
          //     id: Uint8Array.from(cred.id, (c) => c.charCodeAt(0)),
          //     type: cred.type,
          //     transports: cred.transports,}
          // )          ),
          allowCredentials: [], 
          challenge: Uint8Array.from(rawResp.challenge, (c) => c.charCodeAt(0)),
          rpId: rawResp.rpId,
          timeout: rawResp.timeout,
          userVerification: rawResp.userVerification
        }

        // Invoke the WebAuthn get() method.
        console.log("HERE")
        const cred: any = await navigator.credentials.get({
          publicKey: options,
          // Request a conditional UI.
          mediation: "conditional",
        });
        console.log("HERE")
        // Add an ability to authenticate with a passkey: Verify the credential.
        const credential: ResponseCredential = {
          id: cred.id,
          rawId: base64url.encode(cred?.id || ""), // Pass a Base64URL encoded ID string.
          type: cred.type,
          challenge: rawResp.challenge
        };

        console.log("got credential", credential);
        console.log(cred)
        console.log(rawResp)
        debugger;

        // Base64URL encode some values.
        const clientDataJSON = base64url.encode(cred.response.clientDataJSON);
        const authenticatorData = base64url.encode(
          cred.response.authenticatorData
        );
        const signature = base64url.encode(cred.response.signature);
        const userHandle = base64url.encode(cred.response.userHandle);

        credential.response = {
          clientDataJSON,
          authenticatorData,
          signature,
          userHandle,
        };

        console.log(credential);
        debugger;

        // verify the credential
        const verifyResp = await axios.post("/auth/signin/response", {
          credential,
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
    f();
  }, []);

  return (
    <div>
      {loadingStatus === LoadingStatus.Loading && <p>Loading...</p>}
      {loadingStatus === LoadingStatus.Success && <p>Success</p>}
      {loadingStatus === LoadingStatus.Error && <p>Error</p>}
    </div>
  );
}
