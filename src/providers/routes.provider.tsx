import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { adminRoutes } from '../routes/admin.routes'; // Import the adminRoutes function
import Signin from '../pages/auth/Signin';
import Register from '../pages/auth/Register';
import Welcome from '../pages/Welcome';

// Protected route component - Used for any individual routes that need protection

// Application routes
const AppRoutes = () => {
  return (
    <>
      {/* Public Routes */}
      <Route path="/" element={<Welcome />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/register" element={<Register />} />
      
      {/* Import admin routes - these are protected by the ProtectedLayout in admin.routes.tsx */}
      {adminRoutes()}
      
      {/* 404 route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </>
  );
};

// Routes provider component
const RoutesProvider = () => {
  return (
    <Router>
      <Routes>{AppRoutes()}</Routes>
    </Router>
  );
};

export default RoutesProvider;