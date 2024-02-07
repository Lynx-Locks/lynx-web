import NavLogo from "@/components/navLogo/navLogo";
import styles from "./navbar.module.css";

const USER = "Adrian Jendo"; // TODO: replace this with the user's name

export default function Navbar() {
  return (
    <nav className={styles.navContainer}>
      <div className={styles.navLeft}>
        <NavLogo />
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
