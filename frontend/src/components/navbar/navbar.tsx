import NavLogo from "@/components/navLogo/navLogo";
import styles from "./navbar.module.css";
import { useRouter } from "next/navigation";
import axios from "@/axios/client";

export default function Navbar({ name }: { name: string }) {
  const router = useRouter();
  const handleLogout = async () => {
    await axios.post("/logout");
    localStorage.removeItem("name");
    router.push("/login");
  };

  return (
    <nav className={styles.navContainer}>
      <div className={styles.navLeft}>
        <NavLogo />
      </div>
      <div className={styles.navRight}>
        <p className={styles.navUser}>{name}</p>
        <button className={styles.navLogout} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
