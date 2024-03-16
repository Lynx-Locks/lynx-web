import Navbar from "@/components/navbar/navbar";
import styles from "./denied.module.css";

export default function DeniedPage() {
  return (
    <div>
      <Navbar />
      <div className={styles.unauthorized}>
        <h1>401 - Unauthorized</h1>
        <p>Sorry, you do not have access to view this page.</p>
        <p>Please contact your administrator for more information.</p>
      </div>
    </div>
  );
}
