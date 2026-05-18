import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth pages
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Unauthorized   from "./pages/Unauthorized";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword  from "./pages/ResetPassword";

// Role dashboards
import AdminDashboard    from "./pages/admin/AdminDashboard";
import HRDashboard       from "./pages/hr/HRDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";

// Employee management
import EmployeeList    from "./pages/employees/EmployeeList";
import AddEmployee     from "./pages/employees/AddEmployee";
import EditEmployee    from "./pages/employees/EditEmployee";
import EmployeeProfile from "./pages/employees/EmployeeProfile";

// Department management
import DepartmentList    from "./pages/departments/DepartmentList";
import AddDepartment     from "./pages/departments/AddDepartment";
import EditDepartment    from "./pages/departments/EditDepartment";
import DepartmentDetails from "./pages/departments/DepartmentDetails";

// Attendance management
import AttendanceList from "./pages/attendance/AttendanceList";
import MarkAttendance from "./pages/attendance/MarkAttendance";
import BulkAttendance from "./pages/attendance/BulkAttendance";
import EditAttendance from "./pages/attendance/EditAttendance";
import MyAttendance   from "./pages/attendance/MyAttendance";

// Leave management
import LeaveList    from "./pages/leaves/LeaveList";
import ApplyLeave   from "./pages/leaves/ApplyLeave";
import LeaveDetails from "./pages/leaves/LeaveDetails";
import MyLeaves     from "./pages/leaves/MyLeaves";
import LeaveBalance from "./pages/leaves/LeaveBalance";

// Payroll management
import PayrollList    from "./pages/payroll/PayrollList";
import GeneratePayroll from "./pages/payroll/GeneratePayroll";
import BulkPayroll    from "./pages/payroll/BulkPayroll";
import PayrollDetails from "./pages/payroll/PayrollDetails";
import EditPayroll    from "./pages/payroll/EditPayroll";
import MyPayslips     from "./pages/payroll/MyPayslips";

// Profile
import MyProfilePage from "./pages/profile/MyProfilePage";

// Notifications
import NotificationsPage from "./pages/notifications/NotificationsPage";

// Audit logs
import AuditLogsPage from "./pages/audit/AuditLogsPage";

// Calendar
import MyCalendarPage   from "./pages/calendar/MyCalendarPage";
import TeamCalendarPage from "./pages/calendar/TeamCalendarPage";

const RootRedirect = () => {
  const { user, token, loading } = useAuth();
  if (loading) return null;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "hr")    return <Navigate to="/hr/dashboard"    replace />;
  return <Navigate to="/employee/dashboard" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          {/* ── Public ───────────────────────────────────────────── */}
          <Route path="/login"               element={<Login />} />
          <Route path="/register"            element={<Register />} />
          <Route path="/unauthorized"        element={<Unauthorized />} />
          <Route path="/forgot-password"     element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ── Role dashboards ──────────────────────────────────── */}
          <Route path="/admin/dashboard"    element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/hr/dashboard"       element={<ProtectedRoute allowedRoles={["hr"]}><HRDashboard /></ProtectedRoute>} />
          <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={["employee"]}><EmployeeDashboard /></ProtectedRoute>} />

          {/* ── Employees (admin + hr) ────────────────────────────── */}
          <Route path="/employees"          element={<ProtectedRoute allowedRoles={["admin","hr"]}><EmployeeList /></ProtectedRoute>} />
          <Route path="/employees/add"      element={<ProtectedRoute allowedRoles={["admin","hr"]}><AddEmployee /></ProtectedRoute>} />
          <Route path="/employees/:id"      element={<ProtectedRoute allowedRoles={["admin","hr"]}><EmployeeProfile /></ProtectedRoute>} />
          <Route path="/employees/:id/edit" element={<ProtectedRoute allowedRoles={["admin","hr"]}><EditEmployee /></ProtectedRoute>} />

          {/* ── Departments (admin + hr) ─────────────────────────── */}
          <Route path="/departments"          element={<ProtectedRoute allowedRoles={["admin","hr"]}><DepartmentList /></ProtectedRoute>} />
          <Route path="/departments/add"      element={<ProtectedRoute allowedRoles={["admin","hr"]}><AddDepartment /></ProtectedRoute>} />
          <Route path="/departments/:id"      element={<ProtectedRoute allowedRoles={["admin","hr"]}><DepartmentDetails /></ProtectedRoute>} />
          <Route path="/departments/:id/edit" element={<ProtectedRoute allowedRoles={["admin","hr"]}><EditDepartment /></ProtectedRoute>} />

          {/* ── Attendance (admin + hr) ──────────────────────────── */}
          <Route path="/attendance"          element={<ProtectedRoute allowedRoles={["admin","hr"]}><AttendanceList /></ProtectedRoute>} />
          <Route path="/attendance/mark"     element={<ProtectedRoute allowedRoles={["admin","hr"]}><MarkAttendance /></ProtectedRoute>} />
          <Route path="/attendance/bulk"     element={<ProtectedRoute allowedRoles={["admin","hr"]}><BulkAttendance /></ProtectedRoute>} />
          <Route path="/attendance/:id/edit" element={<ProtectedRoute allowedRoles={["admin","hr"]}><EditAttendance /></ProtectedRoute>} />

          {/* ── Employee self-service attendance ─────────────────── */}
          <Route path="/my-attendance" element={<ProtectedRoute allowedRoles={["employee"]}><MyAttendance /></ProtectedRoute>} />

          {/* ── Leaves (admin + hr) ──────────────────────────────── */}
          {/* NOTE: /leaves/apply and /leaves/balance must come before /leaves/:id */}
          <Route path="/leaves"         element={<ProtectedRoute allowedRoles={["admin","hr"]}><LeaveList /></ProtectedRoute>} />
          <Route path="/leaves/apply"   element={<ProtectedRoute allowedRoles={["admin","hr"]}><ApplyLeave /></ProtectedRoute>} />
          <Route path="/leaves/balance" element={<ProtectedRoute allowedRoles={["admin"]}><LeaveBalance /></ProtectedRoute>} />
          <Route path="/leaves/:id"     element={<ProtectedRoute allowedRoles={["admin","hr","employee"]}><LeaveDetails /></ProtectedRoute>} />

          {/* ── Employee self-service leaves ─────────────────────── */}
          <Route path="/apply-leave" element={<ProtectedRoute allowedRoles={["employee"]}><ApplyLeave /></ProtectedRoute>} />
          <Route path="/my-leaves"   element={<ProtectedRoute allowedRoles={["employee"]}><MyLeaves /></ProtectedRoute>} />

          {/* ── Payroll (admin + hr) ─────────────────────────────── */}
          {/* NOTE: /payroll/generate and /payroll/bulk must come before /payroll/:id */}
          <Route path="/payroll"           element={<ProtectedRoute allowedRoles={["admin","hr"]}><PayrollList /></ProtectedRoute>} />
          <Route path="/payroll/generate"  element={<ProtectedRoute allowedRoles={["admin","hr"]}><GeneratePayroll /></ProtectedRoute>} />
          <Route path="/payroll/bulk"      element={<ProtectedRoute allowedRoles={["admin","hr"]}><BulkPayroll /></ProtectedRoute>} />
          <Route path="/payroll/:id"       element={<ProtectedRoute allowedRoles={["admin","hr","employee"]}><PayrollDetails /></ProtectedRoute>} />
          <Route path="/payroll/:id/edit"  element={<ProtectedRoute allowedRoles={["admin","hr"]}><EditPayroll /></ProtectedRoute>} />

          {/* ── Employee self-service payslips ───────────────────── */}
          <Route path="/my-payslips" element={<ProtectedRoute allowedRoles={["employee"]}><MyPayslips /></ProtectedRoute>} />

          {/* ── Profile (all roles) ──────────────────────────────── */}
          <Route path="/profile" element={<ProtectedRoute allowedRoles={["admin","hr","employee"]}><MyProfilePage /></ProtectedRoute>} />

          {/* ── Notifications (all roles) ─────────────────────────── */}
          <Route path="/notifications" element={<ProtectedRoute allowedRoles={["admin","hr","employee"]}><NotificationsPage /></ProtectedRoute>} />

          {/* ── Audit logs (admin only) ───────────────────────────── */}
          <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={["admin"]}><AuditLogsPage /></ProtectedRoute>} />

          {/* ── Calendar ─────────────────────────────────────────── */}
          <Route path="/calendar/my"   element={<ProtectedRoute allowedRoles={["admin","hr","employee"]}><MyCalendarPage /></ProtectedRoute>} />
          <Route path="/calendar/team" element={<ProtectedRoute allowedRoles={["admin","hr"]}><TeamCalendarPage /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
