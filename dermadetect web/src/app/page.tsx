'use client';

import { useState } from 'react';
import Login from './components/Login';
import MainApp from './components/MainApp';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setUserData(data);
  };

  return (
    <main>
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <MainApp userData={userData} />
      )}
    </main>
  );
}