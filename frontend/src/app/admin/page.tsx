import Dashboard from "@/components/adminDashboard/adminDashboard";
import Navbar from "@/components/navbar/navbar";

export default function Admin() {
  return (
    <div>
      <Navbar page="admin" />
      <Dashboard />
    </div>
  );
}
