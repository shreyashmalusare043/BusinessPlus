import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ForgotUsernamePage from './pages/ForgotUsernamePage';
import ForgotEmailPage from './pages/ForgotEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CompanySetupPage from './pages/CompanySetupPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import SuppliersPage from './pages/SuppliersPage';
import WorkOrderListPage from './pages/WorkOrderListPage';
import CreateWorkOrderPage from './pages/CreateWorkOrderPage';
import EditWorkOrderPage from './pages/EditWorkOrderPage';
import ViewWorkOrderPage from './pages/ViewWorkOrderPage';
import BillListPage from './pages/BillListPage';
import CreateBillPage from './pages/CreateBillPage';
import ViewBillPage from './pages/ViewBillPage';
import PurchaseOrderListPage from './pages/PurchaseOrderListPage';
import CreatePurchaseOrderPage from './pages/CreatePurchaseOrderPage';
import ViewPurchaseOrderPage from './pages/ViewPurchaseOrderPage';
import EditPurchaseOrderPage from './pages/EditPurchaseOrderPage';
import ExpensesPage from './pages/ExpensesPage';
import StockPage from './pages/StockPage';
import ReportsPage from './pages/ReportsPage';
import UserManagementPage from './pages/UserManagementPage';
import WorkTrackingPage from './pages/WorkTrackingPage';
import HelpPage from './pages/HelpPage';
import ChallanListPage from './pages/ChallanListPage';
import CreateChallanPage from './pages/CreateChallanPage';
import ViewChallanPage from './pages/ViewChallanPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AdminSubscriptionsPage from './pages/AdminSubscriptionsPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import DataSecurityPolicyPage from './pages/DataSecurityPolicyPage';
import ThemeEditorPage from './pages/ThemeEditorPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Landing',
    path: '/',
    element: <LandingPage />,
    visible: false,
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    visible: false,
  },
  {
    name: 'Signup',
    path: '/signup',
    element: <SignupPage />,
    visible: false,
  },
  {
    name: 'Verify Email',
    path: '/verify-email',
    element: <VerifyEmailPage />,
    visible: false,
  },
  {
    name: 'Forgot Password',
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
    visible: false,
  },
  {
    name: 'Forgot Email',
    path: '/forgot-email',
    element: <ForgotEmailPage />,
    visible: false,
  },
  {
    name: 'Reset Password',
    path: '/reset-password',
    element: <ResetPasswordPage />,
    visible: false,
  },
  {
    name: 'Forgot Username',
    path: '/forgot-username',
    element: <ForgotUsernamePage />,
    visible: false,
  },
  {
    name: 'Company Setup',
    path: '/company-setup',
    element: <CompanySetupPage />,
    visible: false,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    name: 'Customers',
    path: '/customers',
    element: <CustomersPage />,
  },
  {
    name: 'Suppliers',
    path: '/suppliers',
    element: <SuppliersPage />,
  },
  {
    name: 'Work Orders',
    path: '/work-orders',
    element: <WorkOrderListPage />,
  },
  {
    name: 'Create Work Order',
    path: '/work-orders/create',
    element: <CreateWorkOrderPage />,
    visible: false,
  },
  {
    name: 'Edit Work Order',
    path: '/work-orders/:id/edit',
    element: <EditWorkOrderPage />,
    visible: false,
  },
  {
    name: 'View Work Order',
    path: '/work-orders/:id',
    element: <ViewWorkOrderPage />,
    visible: false,
  },
  {
    name: 'Bills',
    path: '/bills',
    element: <BillListPage />,
  },
  {
    name: 'Create Bill',
    path: '/bills/create',
    element: <CreateBillPage />,
    visible: false,
  },
  {
    name: 'Edit Bill',
    path: '/bills/edit/:id',
    element: <CreateBillPage isEdit={true} />,
    visible: false,
  },
  {
    name: 'View Bill',
    path: '/bills/:id',
    element: <ViewBillPage />,
    visible: false,
  },
  {
    name: 'Purchase Orders',
    path: '/purchase-orders',
    element: <PurchaseOrderListPage />,
  },
  {
    name: 'Create Purchase Order',
    path: '/purchase-orders/create',
    element: <CreatePurchaseOrderPage />,
    visible: false,
  },
  {
    name: 'View Purchase Order',
    path: '/purchase-orders/:id',
    element: <ViewPurchaseOrderPage />,
    visible: false,
  },
  {
    name: 'Edit Purchase Order',
    path: '/purchase-orders/:id/edit',
    element: <EditPurchaseOrderPage />,
    visible: false,
  },
  {
    name: 'Expenses',
    path: '/expenses',
    element: <ExpensesPage />,
  },
  {
    name: 'Delivery Challans',
    path: '/delivery-challans',
    element: <ChallanListPage />,
  },
  {
    name: 'Create Delivery Challan',
    path: '/delivery-challans/create',
    element: <CreateChallanPage />,
    visible: false,
  },
  {
    name: 'View Delivery Challan',
    path: '/delivery-challans/:id',
    element: <ViewChallanPage />,
    visible: false,
  },
  {
    name: 'Stock',
    path: '/stock',
    element: <StockPage />,
  },
  {
    name: 'Reports',
    path: '/reports',
    element: <ReportsPage />,
  },
  {
    name: 'Work Tracking',
    path: '/work-tracking',
    element: <WorkTrackingPage />,
  },
  {
    name: 'User Management',
    path: '/users',
    element: <UserManagementPage />,
  },
  {
    name: 'Help & Support',
    path: '/help',
    element: <HelpPage />,
  },
  {
    name: 'Theme Editor',
    path: '/theme-editor',
    element: <ThemeEditorPage />,
    visible: false,
  },
  {
    name: 'Subscription',
    path: '/subscription',
    element: <SubscriptionPage />,
    visible: false,
  },
  {
    name: 'Admin Subscriptions',
    path: '/admin/subscriptions',
    element: <AdminSubscriptionsPage />,
    visible: false,
  },
  {
    name: 'Privacy Policy',
    path: '/privacy-policy',
    element: <PrivacyPolicyPage />,
    visible: false,
  },
  {
    name: 'Terms & Conditions',
    path: '/terms-conditions',
    element: <TermsConditionsPage />,
    visible: false,
  },
  {
    name: 'Refund Policy',
    path: '/refund-policy',
    element: <RefundPolicyPage />,
    visible: false,
  },
  {
    name: 'Data Security Policy',
    path: '/data-security-policy',
    element: <DataSecurityPolicyPage />,
    visible: false,
  },
];

export default routes;
