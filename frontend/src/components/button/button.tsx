import styles from "./button.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";

type ButtonProps = {
  text: string;
  disabled?: boolean;
  onClick: () => void;
};

export function AddButton({ text, onClick }: ButtonProps) {
  return (
    <button className={styles.addButton} onClick={onClick}>
      <FontAwesomeIcon icon={faPlus} size="xs" /> {text}
    </button>
  );
}

export function SubmitButton({ disabled, text, onClick }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={styles.submitButton}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export function EditButton({ text, onClick }: ButtonProps) {
  return (
    <button className={styles.addButton} onClick={onClick}>
      <FontAwesomeIcon icon={faEdit} size="xs" /> {text}
    </button>
  );
}
