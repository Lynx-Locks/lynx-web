import { useState } from "react";
import { SubmitButton } from "@/components/button/button";
import { getCookie } from "cookies-next";
import { jsx } from "@emotion/react";
import IntrinsicElements = jsx.JSX.IntrinsicElements;
import styles from "./tokenConfirmation.module.css";

const Checkbox = ({ children, ...props }: IntrinsicElements["input"]) => (
  <label className={styles.checkboxContainer}>
    <input className={styles.checkbox} type="checkbox" {...props} />
    {children}
  </label>
);

export default function TokenConfirmation() {
  const [disabled, setDisabled] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyToken = async () => {
    const token = getCookie("jwt");
    if (token) {
      await navigator.clipboard.writeText(token.toString());
      setCopied(true);
    }
  };

  return (
    <div>
      <h2 className={styles.subheader}>Access Token Disclosure</h2>
      <div className={styles.paragraph}>
        <p>
          By checking this box and copying the access token, you acknowledge the
          potential risks associated with exposing sensitive authentication
          data.
        </p>

        <ul className={styles.list}>
          <li className={styles.listItem}>
            The access token provides direct access to privileged functions and
            data within the system.
          </li>
          <li className={styles.listItem}>
            Misuse or unauthorized sharing of the access token could compromise
            system security and data integrity.
          </li>
          <li className={styles.listItem}>
            Ensure that the access token is used responsibly and only for
            authorized purposes.
          </li>
        </ul>

        <p>
          I understand and accept the responsibility of securely handling the
          access token.
        </p>
        <Checkbox
          checked={!disabled}
          onChange={() => setDisabled((state) => !state)}
        >
          I acknowledge and agree
        </Checkbox>
      </div>
      <label className={styles.alertText}>
        {copied && "Copied to Clipboard"}
      </label>
      <SubmitButton
        disabled={disabled}
        text="Copy Access Token"
        onClick={copyToken}
      />
    </div>
  );
}
