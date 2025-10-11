import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import axios from 'axios';
import Heading from './heading';
import Footer from './footer';

function MyBookings({ user, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://workspacefinder-2.onrender.com/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.patch(`https://workspacefinder-2.onrender.com/api/bookings/${bookingId}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchBookings();
        alert('Booking cancelled successfully!');
      } catch (error) {
        alert('Error cancelling booking');
      }
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    },
    content: {
      maxWidth: '1000px',
      margin: '80px auto 40px',
      background: 'white',
      borderRadius: '15px',
      padding: '30px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    },
    title: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '30px',
      fontSize: '2.5rem'
    },
    bookingCard: {
      background: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '20px',
      transition: 'all 0.3s ease'
    },
    bookingHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    workspaceTitle: {
      fontSize: '1.3rem',
      color: '#333',
      margin: 0
    },
    status: {
      padding: '5px 15px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 'bold'
    },
    statusConfirmed: {
      background: '#d4edda',
      color: '#155724'
    },
    statusCancelled: {
      background: '#f8d7da',
      color: '#721c24'
    },
    bookingDetails: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginBottom: '15px'
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#555'
    },
    cancelButton: {
      padding: '8px 20px',
      background: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '0.9rem'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#666'
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      color: '#666'
    }
  };

  if (loading) {
    return (
      <>
        <Heading user={user} onLogout={onLogout} />
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.loading}>Loading your bookings...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Heading user={user} onLogout={onLogout} />
      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.title}>My Bookings</h1>
          
          {bookings.length === 0 ? (
            <div style={styles.emptyState}>
              <Calendar size={48} style={{ marginBottom: '15px', color: '#999' }} />
              <h3>No bookings yet</h3>
              <p>Start by booking your first workspace!</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking._id} style={styles.bookingCard}>
                <div style={styles.bookingHeader}>
                  <h3 style={styles.workspaceTitle}>{booking.workspaceTitle}</h3>
                  <span style={{
                    ...styles.status,
                    ...(booking.status === 'confirmed' ? styles.statusConfirmed : styles.statusCancelled)
                  }}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>
                
                <div style={styles.bookingDetails}>
                  <div style={styles.detailItem}>
                    <Calendar size={16} />
                    <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <Clock size={16} />
                    <span>{booking.startTime} - {booking.endTime}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <Clock size={16} />
                    <span>{booking.hours} hour(s)</span>
                  </div>
                  <div style={styles.detailItem}>
                    <DollarSign size={16} />
                    <span>₹{booking.totalAmount}</span>
                  </div>
                </div>

                {booking.status === 'confirmed' && (
                  <button 
                    style={styles.cancelButton}
                    onClick={() => cancelBooking(booking._id)}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default MyBookings;