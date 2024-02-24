import styles from "./button.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type ButtonProps = {
  text: string;
  onClick?: () => void;
};

export function AddButton({ text, onClick }: ButtonProps) {
  return (
    <button className={styles.addButton} onClick={onClick}>
      <FontAwesomeIcon icon={faPlus} size="xs" /> {text}
    </button>
  );
}

export function SubmitButton({ text, onClick }: ButtonProps) {
  return (
    <button className={styles.submitButton} onClick={onClick}>
      {text}
    </button>
  );
}
