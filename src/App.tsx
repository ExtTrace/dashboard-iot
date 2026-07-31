import { useState } from 'react';
import { DashboardContainer } from './containers/DashboardContainer';
import { LoginPage } from './pages/LoginPage';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('iot_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('iot_user') || 'admin';
  });

  const handleLoginSuccess = (username: string) => {
    localStorage.setItem('iot_auth', 'true');
    localStorage.setItem('iot_user', username);
    setIsAuthenticated(true);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('iot_auth');
    localStorage.removeItem('iot_user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <DashboardContainer currentUser={currentUser} onLogout={handleLogout} />
  );
}

export default App;
