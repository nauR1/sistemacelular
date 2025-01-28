import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Devices } from './pages/Devices';
import { ServiceOrders } from './pages/ServiceOrders';
import { Inventory } from './pages/Inventory';
import { Financial } from './pages/Financial';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="customers/*" element={<Customers />} />
            <Route path="devices/*" element={<Devices />} />
            <Route path="service-orders/*" element={<ServiceOrders />} />
            <Route path="inventory/*" element={<Inventory />} />
            <Route path="financial/*" element={<Financial />} />
            <Route path="reports/*" element={<Reports />} />
            <Route path="settings/*" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;