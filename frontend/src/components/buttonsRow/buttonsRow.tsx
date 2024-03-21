import styles from "./buttonsRow.module.css";
import { AddButton, EditButton } from "@/components/button/button";
import { useRouter } from "next/navigation";

export default function ButtonRow({
  selectedRows,
}: {
  selectedRows: number[];
}) {
  const router = useRouter();

  const buttons = [
    {
      id: 1,
      name: "New User",
      type: "Add",
      onClick: () => {
        router.push("/admin/newUserModal");
      },
    },
    {
      id: 2,
      name: "New Key",
      type: "Add",
      onClick: () => {
        router.push("/admin/newKeyModal");
      },
    },
    {
      id: 3,
      name: "New Role",
      type: "Add",
      onClick: () => {
        router.push("/admin/newRoleModal");
      },
    },
    {
      id: 4,
      name: "Edit Roles",
      type: "Edit",
      onClick: () => {
        router.push("/admin/editRolesModal");
      },
    },
    {
      id: 5,
      name: "Add Door",
      type: "Add",
      onClick: () => {
        router.push("/admin/newDoorModal");
      },
    },
    {
      id: 6,
      name: "Edit Doors",
      type: "Edit",
      onClick: () => {
        router.push("/admin/editDoorsModal");
      },
    },
  ];

  if (selectedRows.length > 0) {
    buttons.push({
      id: 7,
      name: "Edit Selection",
      type: "Edit",
      onClick: () => {
        const params = new URLSearchParams();
        params.append("users", selectedRows.toString());
        // selectedRows.map((id) => params.append("users", id.toString()));
        router.push("/admin/editSelectionModal?" + params.toString());
      },
    });
  }

  return (
    <div className={styles.buttonRowContainer}>
      {buttons.map(({ id, name, onClick, type }) => (
        <div key={id}>
          {type === "Add" && (
            <AddButton text={name} onClick={() => onClick()} />
          )}
          {type === "Edit" && (
            <EditButton text={name} onClick={() => onClick()} />
          )}
        </div>
      ))}
    </div>
  );
}
