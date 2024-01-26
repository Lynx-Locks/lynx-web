import styles from "./modal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

export default function Modal({
  setShowModal,
}: {
  setShowModal: (showModal: boolean) => void;
}) {
  return (
    <div className={styles.modalContainer} onClick={() => setShowModal(false)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <span className={styles.close} onClick={() => setShowModal(false)}>
          <FontAwesomeIcon icon={faX} size="xs" />
        </span>
        <p>Some text in the Modal..</p>
      </div>
    </div>
  );
}
