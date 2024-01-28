import styles from "./button.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type ButtonProps = {
  text: string;
};

export default function Button({ text }: ButtonProps) {
  return (
    <button className={styles.addButton}>
      <FontAwesomeIcon icon={faPlus} size="xs" /> {text}
    </button>
  );
}
