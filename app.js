import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import StallDetail from './pages/StallDetail';
import AddStall from './pages/AddStall';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import QRGenerator from './pages/QRGenerator';
import { Toaster } from './components/ui/sonner';
export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
     }, []);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };
 const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
     return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
 <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stall/:id" element={<StallDetail />} />
          <Route path="/add-stall" element={token ? <AddStall /> : <Navigate to="/" />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
                                               <Route path="/profile" element={token ? <Profile /> : <Navigate to="/" />} />
          <Route path="/qr-generator" element={token ? <QRGenerator /> : <Navigate to="/" />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
                                              
