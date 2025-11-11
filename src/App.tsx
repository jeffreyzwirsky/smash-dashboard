import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { BoxListPage } from './components/boxes/BoxListPage';
import { BoxDetailsPage } from './components/boxes/BoxDetailsPage';
import { SalesListPage } from './components/sales/SalesListPage';
const queryClient = new QueryClient();
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/boxes" />} />
              <Route path="boxes" element={<BoxListPage />} />
              <Route path="boxes/:id" element={<BoxDetailsPage />} />
              <Route path="sales" element={<SalesListPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
export default App;
