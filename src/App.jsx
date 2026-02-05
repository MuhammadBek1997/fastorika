import { Route, Routes, Navigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import { useGlobalContext } from './Context';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VerifyModal from './pages/VerifyModal';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import PrivateLayout from './layouts/PrivateLayout';
import PendingLayout from './layouts/PendingLayout';

// Public Pages
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';

// Auth Pages
import Login from './pages/Login';
import Registration from './pages/Registration';

// Private Pages
import Transactions from './pages/Transactions';
import MyCards from './pages/MyCards';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Documents from './pages/Documents';
import Faqs from './pages/Faqs';
import AboutRoute from './pages/AboutRoute';
import PoliticsAML from './pages/PoliticsAML';
import PoliticsAndCon from './pages/PoliticsAndCon';
import ServiceTerm from './pages/ServiceTerm';

// Unregistered Transfer Pages
import UnRegCur from './pages/UnRegCur';
import UnRegCardNum from './pages/UnRegCardNum';
import UnRegSelProvide from './pages/UnRegSelProvide';
import UnRegCryp from './pages/UnRegCryp';
import UnRegBankTransfer from './pages/UnRegBankTransfer';
import UnRegInstruction from './pages/UnRegInstruction';
import TransactionInfo from './pages/TransactionInfo';
import KycVerification from './pages/KycVerification';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isVerificationRequired } = useGlobalContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated && !isVerificationRequired) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isVerificationRequired } = useGlobalContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/transactions" replace />;
  }
  
  if (isVerificationRequired) {
    return <Navigate to="/kyc" replace />;
  }
  
  return children;
};

// Email linkdan kelganda: /verify-email?code=123456&email=user@example.com
const VerifyRoute = () => {
  const [searchParams] = useSearchParams();

  const code = searchParams.get('code') || '';
  const email = searchParams.get('email') || '';

  if (!email) return <Navigate to="/login" replace />;

  return (
    <VerifyModal
      email={email}
      initialCode={code.length === 6 ? code : undefined}
      onClose={(responseData) => {
        // Backend verify-email javobida token qaytarsa → dashboard
        const data = responseData?.data || responseData;
        if (data?.accessToken) {
          sessionStorage.setItem('token', data.accessToken);
          localStorage.setItem('token', data.accessToken);
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
          if (data.tokenType) localStorage.setItem('tokenType', data.tokenType);
          if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('logged', 'true');
          window.location.href = '/transactions';
          return;
        }
        // Token yo'q → login sahifasiga
        window.location.href = '/login';
      }}
    />
  );
};

function App() {
  const { theme } = useGlobalContext();

  useEffect(() => {
    document.documentElement.style.backgroundColor = 
      theme === 'dark' ? '#363636' : '#F0F0F0';
  }, [theme]);

  // Check for pending transfer flow
  const hasPendingTransfer = localStorage.getItem("pending");

  return (
    <div id={theme}>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        theme={theme === 'dark' ? 'dark' : 'light'} 
      />
      <Routes>
        {/* Pending Transfer Flow - Highest Priority */}
        {hasPendingTransfer && (
          <>
            <Route path="/verify" element={<VerifyRoute />} />
            <Route path="/verify-email" element={<VerifyRoute />} />
            <Route path="/currency" element={<PendingLayout><UnRegCur /></PendingLayout>} />
            <Route path="/crypto" element={<PendingLayout><UnRegCryp /></PendingLayout>} />
            <Route path="/bank-transfer" element={<PendingLayout><UnRegBankTransfer /></PendingLayout>} />
            <Route path="/cardnumber" element={<PendingLayout><UnRegCardNum /></PendingLayout>} />
            <Route path="/provider" element={<PendingLayout><UnRegSelProvide /></PendingLayout>} />
            <Route path="/instruction" element={<PendingLayout><UnRegInstruction /></PendingLayout>} />
            <Route path="*" element={<Navigate to="/currency" replace />} />
          </>
        )}

        {/* Public Routes */}
        {!hasPendingTransfer && (
          <>
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutUs /></PublicLayout>} />

            {/* Verify Route - email link (backend /verify-email jo'natadi) */}
            <Route path="/verify" element={<VerifyRoute />} />
            <Route path="/verify-email" element={<VerifyRoute />} />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <AuthLayout><Login /></AuthLayout>
                </PublicRoute>
              }
            />
            <Route
              path="/registration"
              element={
                <PublicRoute>
                  <AuthLayout><Registration /></AuthLayout>
                </PublicRoute>
              }
            />
            {/* Protected Routes */}
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <PrivateLayout><Transactions /></PrivateLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cards"
              element={
                <ProtectedRoute>
                  <PrivateLayout><MyCards /></PrivateLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PrivateLayout><Profile /></PrivateLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <PrivateLayout><Settings /></PrivateLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <PrivateLayout><Support /></PrivateLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/docs"
              element={
                <ProtectedRoute>
                  <PrivateLayout><Documents /></PrivateLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/faqs"
              element={
                <ProtectedRoute>
                  <PrivateLayout><Faqs /></PrivateLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/aboutUs"
              element={
                <ProtectedRoute>
                  <PrivateLayout><AboutRoute /></PrivateLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/politics"
              element={
                <ProtectedRoute>
                  <PrivateLayout><PoliticsAndCon /></PrivateLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/politicsAml"
              element={
                <ProtectedRoute>
                  <PrivateLayout><PoliticsAML /></PrivateLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/serviceTerm"
              element={
                <ProtectedRoute>
                  <PrivateLayout><ServiceTerm /></PrivateLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transaction/:id"
              element={
                <ProtectedRoute>
                  <PrivateLayout><TransactionInfo/></PrivateLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/kyc"
              element={
                <ProtectedRoute>
                  <PrivateLayout><KycVerification /></PrivateLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback Routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;