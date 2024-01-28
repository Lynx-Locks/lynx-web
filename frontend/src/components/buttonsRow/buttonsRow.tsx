import styles from "./buttonsRow.module.css";
import Button from "@/components/addButton/button";

const buttons = [
  {
    id: 1,
    name: "New Key",
  },
  {
    id: 2,
    name: "New Role",
  },
];

export default function ButtonRow() {
  return (
    <div className={styles.buttonRowContainer}>
      {buttons.map(({ id, name }) => (
        <Button key={id} text={name} />
      ))}
    </div>
  );
}
