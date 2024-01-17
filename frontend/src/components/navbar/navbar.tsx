import styles from "./navbar.module.css";
import Image from "next/image";

const USER = "ADMIN"; // TODO: replace this with the user's name

export default function Navbar() {
  return (
    <nav className={styles.navContainer}>
      <div className={styles.navLeft}>
        <Image
          className={styles.navImage}
          src="/lynx.png"
          width={32}
          height={32}
          alt="Lynx Locks"
        ></Image>
      </div>
      <div className={styles.navRight}>
        {/* TODO: Implement user dropdown */}
        <div className={styles.navUser}>{USER}</div>
        {/* TODO: Implement login / logout login */}
        <div className={styles.navLogout}>Logout</div>
      </div>
    </nav>
  );
}
