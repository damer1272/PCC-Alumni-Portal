import { createBrowserRouter, Navigate } from "react-router";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AlumniDashboard from "./pages/AlumniDashboard";
import MyProfile from "./pages/MyProfile";
import CareerTracking from "./pages/CareerTracking";
import AlumniDirectory from "./pages/AlumniDirectory";
import Announcements from "./pages/Announcements";
import AdminDashboard from "./pages/AdminDashboard";
import ManageAlumni from "./pages/ManageAlumni";
import ManageAnnouncements from "./pages/ManageAnnouncements";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import BatchGraduateFiles from "./pages/BatchGraduateFiles";

import AlumniProfileView from "./pages/AlumniProfileView";

export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },

  {
    path: "/alumni",
    element: <MainLayout role="alumni" />,
    children: [
      { index: true, element: <Navigate to="/alumni/dashboard" replace /> },
      { path: "dashboard", element: <AlumniDashboard /> },
      { path: "profile", element: <MyProfile /> },
      { path: "edit-profile", element: <Navigate to="/alumni/profile?edit=1" replace /> },
      { path: "career", element: <CareerTracking /> },
      { path: "directory", element: <AlumniDirectory /> },
      { path: "directory/:id", element: <AlumniProfileView /> },
      { path: "search", element: <AlumniDirectory /> },
      { path: "search/:id", element: <AlumniProfileView /> },
      { path: "announcements", element: <Announcements /> },
    ],
  },

  {
    path: "/admin",
    element: <MainLayout role="admin" />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "alumni", element: <ManageAlumni /> },
      { path: "alumni/:id", element: <AlumniProfileView /> },
      { path: "batch-files", element: <BatchGraduateFiles /> },
      { path: "announcements", element: <ManageAnnouncements /> },
      { path: "reports", element: <Reports /> },
      { path: "users", element: <UserManagement /> },
    ],
  },


  { path: "*", element: <Navigate to="/" replace /> },
]);
