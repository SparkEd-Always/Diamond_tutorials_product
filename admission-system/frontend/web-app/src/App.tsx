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
import AdminHomePage from './pages/AdminHomePage';
import AdminAdmissionDashboard from './pages/AdminAdmissionDashboard';
import AdminFeeDashboard from './pages/AdminFeeDashboard';
import AdminCommunicationDashboard from './pages/AdminCommunicationDashboard';
import AdminSISDashboard from './pages/AdminSISDashboard';
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
import AdminStudentLedgers from './pages/AdminStudentLedgers';
import AdminPaymentsPage from './pages/AdminPaymentsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import ParentFeeDashboard from './pages/ParentFeeDashboard';
import ParentPaymentPage from './pages/ParentPaymentPage';
import ParentPaymentHistory from './pages/ParentPaymentHistory';
import ParentStudentFeeDetailsPage from './pages/ParentStudentFeeDetailsPage';
import SendMessagePage from './pages/SendMessagePage';
import MessageHistoryPage from './pages/MessageHistoryPage';
import ParentMessagesPage from './pages/ParentMessagesPage';
import MessageDetailsPage from './pages/MessageDetailsPage';
import StudentListPage from './pages/StudentListPage';
import StudentDetailsPage from './pages/StudentDetailsPage';
import StudentFormPage from './pages/StudentFormPage';
import ManageFeeSessionsPage from './pages/fees/ManageFeeSessionsPage';
import CreateFeeSessionPage from './pages/fees/CreateFeeSessionPage';
import FeeSessionDetailsPage from './pages/fees/FeeSessionDetailsPage';
import AdhocFeeListPage from './pages/fees/AdhocFeeListPage';
import CreateAdhocFeePage from './pages/fees/CreateAdhocFeePage';
import RecordPaymentPage from './pages/fees/RecordPaymentPage';
import StudentLedgerTimelinePage from './pages/ledger/StudentLedgerTimelinePage';
import ManualEntryFormPage from './pages/admin/ledger/ManualEntryFormPage';
import PaymentAllocationPage from './pages/admin/ledger/PaymentAllocationPage';

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
  return isAdmin ? <AdminHomePage /> : <ParentDashboard />;
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

      {/* Module Dashboards */}
      <Route
        path="/admin/admission/dashboard"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminAdmissionDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/communication/dashboard"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminCommunicationDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sis/dashboard"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminSISDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admission Routes */}
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

      {/* Fee Sessions Routes - Admin */}
      <Route
        path="/admin/fees/sessions"
        element={
          <ProtectedRoute adminOnly={true}>
            <ManageFeeSessionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fees/sessions/create"
        element={
          <ProtectedRoute adminOnly={true}>
            <CreateFeeSessionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fees/sessions/:id"
        element={
          <ProtectedRoute adminOnly={true}>
            <FeeSessionDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Adhoc Fees Routes - Admin */}
      <Route
        path="/admin/fees/adhoc"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdhocFeeListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fees/adhoc/create"
        element={
          <ProtectedRoute adminOnly={true}>
            <CreateAdhocFeePage />
          </ProtectedRoute>
        }
      />

      {/* Payment Recording Route - Admin */}
      <Route
        path="/admin/fees/payments/record"
        element={
          <ProtectedRoute adminOnly={true}>
            <RecordPaymentPage />
          </ProtectedRoute>
        }
      />

      {/* Student Ledger Routes - Admin */}
      <Route
        path="/admin/ledger/student/:studentId"
        element={
          <ProtectedRoute adminOnly={true}>
            <StudentLedgerTimelinePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ledger/manual-entry"
        element={
          <ProtectedRoute adminOnly={true}>
            <ManualEntryFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ledger/payment/:paymentId/allocate"
        element={
          <ProtectedRoute adminOnly={true}>
            <PaymentAllocationPage />
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

      {/* Communication Routes - Admin/Teacher */}
      <Route
        path="/admin/communication/send"
        element={
          <ProtectedRoute adminOnly={true}>
            <SendMessagePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/communication/history"
        element={
          <ProtectedRoute adminOnly={true}>
            <MessageHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/communication/messages/:id"
        element={
          <ProtectedRoute adminOnly={true}>
            <MessageDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Communication Routes - Parent */}
      <Route
        path="/parent/messages"
        element={
          <ProtectedRoute>
            <ParentMessagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/messages/:id"
        element={
          <ProtectedRoute>
            <MessageDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Student Information System (SIS) Routes - Admin */}
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute adminOnly={true}>
            <StudentListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students/create"
        element={
          <ProtectedRoute adminOnly={true}>
            <StudentFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students/:id"
        element={
          <ProtectedRoute adminOnly={true}>
            <StudentDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students/:id/edit"
        element={
          <ProtectedRoute adminOnly={true}>
            <StudentFormPage />
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
