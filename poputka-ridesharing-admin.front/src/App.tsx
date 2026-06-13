import React, { useEffect } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import { useAuthStore } from './store/useAuthStore';
import './App.css';

export default function App() {
  const admin = useAuthStore((s) => s.admin);
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  if (!admin) {
    return <LoginPage />;
  }

  return <HomePage />;
}
