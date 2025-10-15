import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import theme from './theme';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ParentDashboard from './pages/ParentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ApplicationFormPage from './pages/ApplicationFormPage';
import ParentApplicationListPage from './pages/ParentApplicationListPage';
import AdminApplicationListPage from './pages/AdminApplicationListPage';
import ParentApplicationDetailsPage from './pages/ParentApplicationDetailsPage';
import AdminApplicationDetailsPage from './pages/AdminApplicationDetailsPage';
import AdminApplicationReviewPage from './pages/AdminApplicationReviewPage';
import AdminWorkflowSettingsPage from './pages/AdminWorkflowSettingsPage';
import FormBuilderPage from './pages/FormBuilderPage';
import FormListPage from './pages/FormListPage';
import HomePage from './pages/HomePage';
import FeeTypesPage from './pages/FeeTypesPage';
import FeeStructuresPage from './pages/FeeStructuresPage';
import StudentAssignmentsPage from './pages/StudentAssignmentsPage';
import AdminFeeDashboard from './pages/AdminFeeDashboard';
import AdminStudentLedgers from './pages/AdminStudentLedgers';
import AdminPaymentsPage from './pages/AdminPaymentsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import ParentFeeDashboard from './pages/ParentFeeDashboard';
import ParentPaymentPage from './pages/ParentPaymentPage';
import ParentPaymentHistory from './pages/ParentPaymentHistory';
import ParentStudentFeeDetailsPage from './pages/ParentStudentFeeDetailsPage';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Dashboard Route Component - Routes to correct dashboard based on role
const DashboardRoute = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <ParentDashboard />;
};

// Application List Route - Routes to correct list page based on role
const ApplicationListRoute = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminApplicationListPage /> : <ParentApplicationListPage />;
};

// Application Details Route - Routes to correct details page based on role
const ApplicationDetailsRoute = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminApplicationDetailsPage /> : <ParentApplicationDetailsPage />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/apply"
        element={
          <ProtectedRoute>
            <ApplicationFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <ApplicationListRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications/:id"
        element={
          <ProtectedRoute>
            <ApplicationDetailsRoute />
          </ProtectedRoute>
        }
      />

      {/* Admin Only Routes */}
      <Route
        path="/admin/applications/:id/review"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminApplicationReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/workflow-settings"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminWorkflowSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/forms"
        element={
          <ProtectedRoute adminOnly={true}>
            <FormListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/forms/:id/edit"
        element={
          <ProtectedRoute adminOnly={true}>
            <FormBuilderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/form-builder"
        element={
          <ProtectedRoute adminOnly={true}>
            <FormBuilderPage />
          </ProtectedRoute>
        }
      />

      {/* Fee Management Routes - Admin */}
      <Route
        path="/admin/fees/dashboard"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminFeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fees/types"
        element={
          <ProtectedRoute adminOnly={true}>
            <FeeTypesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fees/structures"
        element={
          <ProtectedRoute adminOnly={true}>
            <FeeStructuresPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fees/assignments"
        element={
          <ProtectedRoute adminOnly={true}>
            <StudentAssignmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fees/ledgers"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminStudentLedgers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fees/payments"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminPaymentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fees/reports"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Fee Management Routes - Parent */}
      <Route
        path="/parent/fees"
        element={
          <ProtectedRoute>
            <ParentFeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/fees/pay"
        element={
          <ProtectedRoute>
            <ParentPaymentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/fees/history"
        element={
          <ProtectedRoute>
            <ParentPaymentHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/fees/student/:studentId"
        element={
          <ProtectedRoute>
            <ParentStudentFeeDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
