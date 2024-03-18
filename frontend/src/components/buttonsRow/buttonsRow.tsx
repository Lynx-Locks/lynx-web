import styles from "./buttonsRow.module.css";
import { AddButton } from "@/components/button/button";
import { useRouter } from "next/navigation";

export default function ButtonRow() {
  const router = useRouter();

  const buttons = [
    {
      id: 1,
      name: "New User",
      onClick: () => {
        router.push("/admin/newUserModal");
      },
    },
    {
      id: 2,
      name: "New Key",
      onClick: () => {
        router.push("/admin/newKeyModal");
      },
    },
    {
      id: 3,
      name: "New Role",
      onClick: () => {
        router.push("/admin/newRoleModal");
      },
    },
  ];

  return (
    <div className={styles.buttonRowContainer}>
      {buttons.map(({ id, name, onClick }) => (
        <AddButton key={id} text={name} onClick={() => onClick()} />
      ))}
    </div>
  );
}
