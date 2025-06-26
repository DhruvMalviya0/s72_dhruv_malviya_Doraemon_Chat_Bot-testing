import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import Quiz from './components/Quiz';
import LevelProgress from './components/LevelProgress';
import Leaderboard from './components/Leaderboard';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import { HomeIcon, ChatBubbleLeftIcon, AcademicCapIcon, TrophyIcon, UserCircleIcon } from '@heroicons/react/24/outline';

// Create router with future flags
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

function Navigation({ user, onLogout }) {
  if (!user) {
    return (
      <div className="flex space-x-4">
        <Link to="/login" className="btn-primary">Login</Link>
        <Link to="/signup" className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-gray-600">Welcome, {user.username}!</span>
      <Link to="/profile" className="text-primary hover:text-primary-dark">
        Profile
      </Link>
      <button
        onClick={onLogout}
        className="px-4 py-2 text-red-600 hover:text-red-700"
      >
        Logout
      </button>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('user');
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user token is valid on app load
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token && user) {
        try {
          // You can add a token validation API call here if needed
          // For now, we'll just check if the token exists
          setIsLoading(false);
        } catch (error) {
          console.error('Token validation failed:', error);
          handleLogout();
        }
      } else {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [user]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router {...router}>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-2xl font-bold text-primary">
                    Doraemon Chat
                  </Link>
                </div>
                {user && (
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link
                      to="/chat"
                      className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-primary"
                    >
                      Chat
                    </Link>
                    <Link
                      to="/quiz"
                      className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-primary"
                    >
                      Quiz
                    </Link>
                    <Link
                      to="/leaderboard"
                      className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-primary"
                    >
                      Leaderboard
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex items-center">
                <Navigation user={user} onLogout={handleLogout} />
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/signup" element={<Signup setUser={setUser} />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/chat" element={user ? <ChatInterface /> : <Navigate to="/login" />} />
            <Route path="/quiz" element={user ? <Quiz /> : <Navigate to="/login" />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/dashboard" element={user ? <ChatInterface /> : <Navigate to="/login" />} />
            <Route path="/auth/google/success" element={<Login setUser={setUser} />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 