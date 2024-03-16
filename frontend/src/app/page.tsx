import Navbar from "@/components/navbar/navbar";
import Dashboard from "@/components/userDashboard/userDashboard";

export default function Home() {
  return (
    <div>
      <Navbar page="portal" />
      <Dashboard />
    </div>
  );
}
