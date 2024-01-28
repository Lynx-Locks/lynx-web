import styles from "./button.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type ButtonProps = {
  text: string;
  onClick?: () => void;
};

export default function Button({ text, onClick }: ButtonProps) {
  return (
    <button className={styles.addButton} onClick={onClick}>
      <FontAwesomeIcon icon={faPlus} size="xs" /> {text}
    </button>
  );
}
