import React, { useEffect } from "react";
import { Navigate, Route, useNavigate } from "react-router-dom";
import DashboardLayout from "../pages/dashboard/layout";
import { useAuthStore }  from "../store/store";
import Dashboard from "../pages/dashboard/userDashboard/userDashboard";
import Group from "@/pages/dashboard/group/Group";
import Expense from "@/pages/dashboard/expence/Expence";

import Profile from "@/pages/dashboard/profile/EditProfile";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state: { isAuthenticated: any; }) => state.isAuthenticated);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);
  
  return <>{children}</>;
};


export const adminRoutes = () => {
  return (
    <Route
      path="/dashboard"
      element={<ProtectedLayout><DashboardLayout /></ProtectedLayout>}
    >
      <Route index element={<Navigate to="userdashboard" replace />} />
         <Route path="group" element={<Group />}/>
         <Route path="expense" element={<Expense />}/>
         {/* <Route path="balance" element={<Balance />}/> */}
         {/* <Route path="settlement" element={<Settlement />}/> */}
         {/* <Route path="analytic" element={<Analytic />}/> */}
         <Route path="profile" element={<Profile/>}/>
      <Route path="userdashboard" element={<Dashboard />}/>
    </Route>
  );
};
