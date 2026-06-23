import Sidebar  from "@/components/const/app-sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <Sidebar>
      <Outlet />
    </Sidebar>
  );
};

export default DashboardLayout;
