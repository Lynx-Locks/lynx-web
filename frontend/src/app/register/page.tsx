"use client";

import { useEffect } from "react";
import styles from "./register.module.css";
import { useSearchParams } from "next/navigation";
import axios from "@/axios/client";
import { ResponseCredential, ServerData } from "@/types/webAuthn";

export default function RegisterUser() {
  const searchParams = useSearchParams();

  useEffect(() => {
    async function f() {
      // Decode token & check validity
      const token = searchParams.get("token");

      // TODO: verify token is valid in backend during registerRequest

      const resp = await axios.get(`/api/auth/registerRequest`);
      if (resp.status === 200) {
        // Do webauthn stuff
        const data: ServerData = resp.data;
        console.log(data);
        const options: PublicKeyCredentialCreationOptions = {
          challenge: Uint8Array.from(data.challenge, (c) => c.charCodeAt(0)),
          rp: data.rp,
          user: {
            id: Uint8Array.from(data.user.id, (c) => c.charCodeAt(0)), // TODO: change this when we use int id
            name: data.user.name,
            displayName: data.user.display_name,
          },
          pubKeyCredParams: data.pub_key_cred_params,
          authenticatorSelection: {
            authenticatorAttachment:
              data.authenticator_selection.authenticatorAttachment,
            requireResidentKey:
              data.authenticator_selection.require_resident_ley,
          },
        };
        // Prompt user to generate a passkey
        const cred: any = await navigator.credentials.create({
          publicKey: options,
        });

        const credential: ResponseCredential = {
          id: cred?.id || "",
          type: cred?.type || "",
        };

        // The authenticatorAttachment string in the PublicKeyCredential object is a new addition in WebAuthn L3.
        if (cred.authenticatorAttachment) {
          credential.authenticator_attachment = cred.authenticatorAttachment;
        }

        // TODO: might not end up needing this data

        // Base64URL encode some values.
        // const clientDataJSON = base64url.encode(cred.response.clientDataJSON);
        // const attestationObject = base64url.encode(
        //   cred.response.attestationObject
        // );

        // // Obtain transports.
        // const transports = cred.response.getTransports
        //   ? cred.response.getTransports()
        //   : [];

        // credential.response = {
        //   clientDataJSON,
        //   attestationObject,
        //   transports,
        // };

        // send public key to backend
        axios.post("/api/auth/registerResponse", credential);
      } else {
        // TODO: handle error (update page to error state)
      }
    }
    f();
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <div className={styles.loader} />
    </div>
  );
}
