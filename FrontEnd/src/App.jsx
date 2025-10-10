import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './Redux/store';

// Components
import WorkSpaceFinder from './Component/workSpaceFinder';
import ContactForm from './Component/contact';
import HomePage from './Component/homepage';
import RateUsForm from './Component/rateus';
import Seemore from './Component/seemore';
import LoginPage from './Component/LoginPage';
import AdminDashboard from './Component/AdminDashboard';
import MyBookings from './Component/MyBookings';

// Protected Route Component
function ProtectedRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };
// Admin Route Component
function AdminRoute({ children, isAuthenticated, user }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Public Route Component (redirects to appropriate page if already authenticated)
function PublicRoute({ children, isAuthenticated, user }) {
  if (isAuthenticated && user?.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Root Route Component - redirects based on user role
function RootRoute({ isAuthenticated, user }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <WorkSpaceFinder user={user} onLogout={handleLogout} />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when app loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.error('Invalid user data in localStorage:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (authData) => {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    setUser(authData.user);
    setIsAuthenticated(true);
  };



  const handleNavigate = (path) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute isAuthenticated={isAuthenticated} user={user}>
                  <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />
                </PublicRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminRoute isAuthenticated={isAuthenticated} user={user}>
                  <AdminDashboard user={user} onLogout={handleLogout} onNavigate={handleNavigate} />
                </AdminRoute>
              } 
            />

            {/* Root route - redirects based on user role */}
            <Route 
              path="/" 
              element={
                <RootRoute isAuthenticated={isAuthenticated} user={user} />
              } 
            />
            
            {/* Protected User Routes */}
            <Route 
              path="/contactus" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ContactForm user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/rateus" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <RateUsForm user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/my-bookings" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <MyBookings user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/seemore/:id" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Seemore user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/home" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                 <WorkSpaceFinder user={user} onLogout={() => {handleLogout}} />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all route */}
            <Route 
              path="*" 
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : user?.isAdmin ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
          </Routes>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;