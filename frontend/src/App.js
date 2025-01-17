import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from 'react-router-dom';
import { LogOut, FilePlus, List } from 'lucide-react';
import axios from 'axios';

import LoginPage from './pages/LoginPage';
import InvoicePage from './pages/InvoicePage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/auth/current`, { withCredentials: true })
      .then((res) => {
        setCurrentUser(res.data); // user object or empty object
        console.log('User data:', res.data);  
      })
      .catch(() => {
        setCurrentUser(null);
        console.log('No user data found.');
      });
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      console.log('Logout button clicked');
      // Make a POST request to '/auth/logout'
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/logout`, {}, { withCredentials: true });
      console.log('Logout response:', response.data);
      // Clear the local user state
      setCurrentUser(null);
      console.log('Logout successful.');
      // Redirect to "/"
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error logging out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Router>
      {/* Navbar */}
      <nav className="bg-gray-800 p-4 text-white flex items-center justify-between">
        <div className="space-x-4 flex items-center">
          
          {/* Invoices */}
          <Link className="hover:text-gray-300 flex items-center" to="/invoices">
            <FilePlus size={18} className="mr-1" />
            Invoices
          </Link>

          {/* Dashboard */}
          <Link className="hover:text-gray-300 flex items-center" to="/dashboard">
            <List size={18} className="mr-1" />
            Dashboard
          </Link>
        </div>

        {/* Logout button*/}
        {currentUser && currentUser._id && (
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`${
              isLoggingOut ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            } text-sm px-3 py-1 rounded flex items-center space-x-2`}
          >
            <LogOut size={16} />
            <span>{isLoggingOut ? 'Logging Out...' : 'Logout'}</span>
          </button>
        )}
      </nav>

      <Routes>
        {/* Login page at "/" */}
        <Route path="/" element={<LoginPage />} />

        {/* Protect /invoices */}
        <Route
          path="/invoices"
          element={
            currentUser && currentUser._id ? (
              <InvoicePage currentUser={currentUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Protect /dashboard */}
        <Route
          path="/dashboard"
          element={
            currentUser && currentUser._id ? (
              <DashboardPage currentUser={currentUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
