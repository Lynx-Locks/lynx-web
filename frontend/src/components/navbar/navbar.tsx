import NavLogo from "@/components/navLogo/navLogo";
import styles from "./navbar.module.css";

export default function Navbar({
  email,
  handleLogout,
}: {
  email: string;
  handleLogout: () => void;
}) {
  return (
    <nav className={styles.navContainer}>
      <div className={styles.navLeft}>
        <NavLogo />
      </div>
      <div className={styles.navRight}>
        <div className={styles.navUser}>{email}</div>
        <button className={styles.navLogout} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
