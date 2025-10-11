import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaHome, FaEnvelope, FaAddressCard, FaAddressBook, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { FcCalendar, FcRating } from "react-icons/fc";
import '../Styles/heading.css'; // Import CSS
import { useNavigate } from 'react-router-dom';

const Heading = ({ user, onLogout }) => {
 const navigate = useNavigate();
  
  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Call the parent's onLogout function to update state
    if (onLogout) {
      onLogout();
    }
    
    // Navigate to login page
    navigate('/login', { replace: true });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="navbar"
    >
      <h1 className="navbar-title">Workspace Finder</h1>
      
      <ul className="navbar-links">
        <li>
          <Link to="/" className="navbar-link">
            <FaHome className="navbar-icon" />
            Home
          </Link>
        </li>
        <li>
          <Link to="/contactus" className="navbar-link">
            <FaEnvelope className="navbar-icon" />
            Contact Us
          </Link>
        </li>
        {/* <li>
          <Link to="/rateus" className="navbar-link">
            <FcRating className="navbar-icon" />
            Rate Us
          </Link>
        </li> */}
        {user && !user.isAdmin && (
          <li>
          <Link to="/my-bookings" className="navbar-link">
            <FcCalendar className="navbar-icon" />
            My Bookings
          </Link>
        </li>
)}
        {/* // Add this to your Heading component's button section */}
{/* {user && !user.isAdmin && (
  <button 
    style={styles.button}
    onClick={() => onNavigate('/my-bookings')}
  >
    <Calendar size={18} />
    My Bookings
  </button>
)} */}
        {/* <li>
          <Link to="/addWorkSpace" className="navbar-link">
            <FaAddressBook className="navbar-icon" />
            Add WorkSpace
          </Link>
        </li> */}
      </ul>

      {/* User Section */}
      <div className="navbar-user-section">
        {user && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="user-info"
          >
            <FaUser className="user-icon" />
            <span className="welcome-text">
              Welcome, {user.email?.split('@')[0] || user.email}
            </span>
          </motion.div>
        )}
        
        <motion.button
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="logout-btn"
        >
          <FaSignOutAlt className="logout-icon" />
          Logout
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Heading;