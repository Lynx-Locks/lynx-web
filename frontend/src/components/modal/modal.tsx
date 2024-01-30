import styles from "./modal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

export default function Modal({
  setShowModal,
  content,
  title,
}: {
  setShowModal: (showModal: boolean) => void;
  title: string;
  content: JSX.Element;
}) {
  return (
    <div className={styles.modalContainer} onClick={() => setShowModal(false)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.close} onClick={() => setShowModal(false)}>
            <FontAwesomeIcon icon={faX} size="xs" />
          </span>
          <h1>{title}</h1>
        </div>
        {content}
      </div>
    </div>
  );
}
