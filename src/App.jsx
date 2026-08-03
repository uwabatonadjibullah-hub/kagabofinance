import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Login from './pages/Login';

function App() {
  // In a real app, we'd check auth state. For now, simulate authenticated state.
  const isAuthenticated = true;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          {/* Add more routes here for Sales, Finance, etc. */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
