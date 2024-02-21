"use client";

import { useEffect, useState } from "react";
import styles from "./register.module.css";
import { useSearchParams } from "next/navigation";
import axios from "@/axios/client";
import { RegisterRequest, ResponseCredential } from "@/types/webAuthn";
import base64url from "base64url";

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

  useEffect(() => {
    async function f() {
      // Decode token & check validity
      const token = searchParams.get("token");

      // TODO: verify token is valid in backend during registerRequest

      const resp = await axios.post(`/auth/register/request`);
      if (resp.status === 200) {
        // Do webauthn stuff
        const rawResp: RegisterRequest = resp.data;
        const options: PublicKeyCredentialCreationOptions = {
          challenge: Uint8Array.from(rawResp.challenge, (c) => c.charCodeAt(0)),
          rp: rawResp.rp,
          user: {
            id: Uint8Array.from(rawResp.user.id, (c) => c.charCodeAt(0)),
            name: rawResp.user.name,
            displayName: rawResp.user.displayName,
          },
          pubKeyCredParams: rawResp.pubKeyCredParams,
          authenticatorSelection: rawResp.authenticatorSelection,
          timeout: rawResp.timeout,
        };
        // Prompt user to generate a passkey
        const cred: any = await navigator.credentials.create({
          publicKey: options,
        });

        const credential: ResponseCredential = {
          id: cred?.id || "",
          rawId: base64url.encode(cred?.id || ""),
          type: cred?.type || "",
          challenge: rawResp.challenge,
        };

        // The authenticatorAttachment string in the PublicKeyCredential object is a new addition in WebAuthn L3.
        if (cred.authenticatorAttachment) {
          credential.authenticatorAttachment = cred.authenticatorAttachment;
        }

        // Base64URL encode some values.
        const clientDataJSONRaw = JSON.parse(
          Buffer.from(cred.response.clientDataJSON).toString(),
        );
        clientDataJSONRaw.challenge = base64url.decode(
          clientDataJSONRaw.challenge,
        ); // need to decode challenge

        const clientDataJSON = base64url.encode(
          JSON.stringify(clientDataJSONRaw),
        );
        const attestationObject = base64url.encode(
          cred.response.attestationObject,
        );

        // Obtain transports.
        const transports = cred.response.getTransports
          ? cred.response.getTransports()
          : [];

        credential.response = {
          clientDataJSON,
          attestationObject,
          transports,
        };

        // send public key to backend
        const status = await axios.post(
          "/auth/register/response",
          credential,
        );
        setLoadingStatus(LoadingStatus.Success);
      } else {
        setLoadingStatus(LoadingStatus.Error);
      }
    }
    f();
  }, [searchParams]);

  return (
    <div className={styles.container}>
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
