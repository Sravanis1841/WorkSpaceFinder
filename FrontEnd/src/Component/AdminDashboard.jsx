import { useState, useEffect } from 'react';
import { Shield, LogOut, Plus, X, Upload, MapPin, Star, Calendar, Edit } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

function AdminDashboard({ user, onLogout, onNavigate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [workspaces, setWorkspaces] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    city: '',
    locationName: '',
    location: '',
    latitude: '',
    longitude: '',
    sqft: ''
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (activeView === 'workspaces') {
      fetchWorkspaces();
    } else if (activeView === 'reviews') {
      fetchReviews();
    } else if (activeView === 'bookings') {
      fetchBookings();
    }
  }, [activeView]);

  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://workspacefinder-2.onrender.com/api/workspaces', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://workspacefinder-2.onrender.com/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setMessage({ text: 'Error fetching reviews', type: 'error' });
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://workspacefinder-2.onrender.com/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      images.forEach((file) => {
        formDataToSend.append('images', file);
      });

      const response = await axios.post(
        'https://workspacefinder-2.onrender.com/api/newWorkspaces',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMessage({ text: 'Workspace added successfully!', type: 'success' });
      resetForm();
      
      setTimeout(() => {
        setShowAddForm(false);
        setMessage({ text: '', type: '' });
        if (activeView === 'workspaces') {
          fetchWorkspaces();
        }
      }, 2000);
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Error adding workspace', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      // Add existing images as JSON string
      formDataToSend.append('existingImages', JSON.stringify(existingImages));

      // Add new images
      images.forEach((file) => {
        formDataToSend.append('images', file);
      });

      await axios.put(
        `https://workspacefinder-2.onrender.com/api/workspaces/${editingWorkspace._id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMessage({ text: 'Workspace updated successfully!', type: 'success' });
      
      setTimeout(() => {
        setShowEditForm(false);
        setEditingWorkspace(null);
        resetForm();
        setMessage({ text: '', type: '' });
        fetchWorkspaces();
      }, 2000);
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Error updating workspace', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      city: '',
      locationName: '',
      location: '',
      latitude: '',
      longitude: '',
      sqft: ''
    });
    setImages([]);
    setExistingImages([]);
  };

  const handleEdit = (workspace) => {
    setEditingWorkspace(workspace);
    setFormData({
      title: workspace.title,
      description: workspace.description,
      price: workspace.price,
      city: workspace.city,
      locationName: workspace.locationName || '',
      location: workspace.location,
      latitude: workspace.latitude,
      longitude: workspace.longitude,
      sqft: workspace.sqft
    });
    setExistingImages(workspace.images || [workspace.image1] || []);
    setImages([]);
    setShowEditForm(true);
  };

  const deleteWorkspace = async (id) => {
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://workspacefinder-2.onrender.com/api/workspaces/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage({ text: 'Workspace deleted successfully!', type: 'success' });
        fetchWorkspaces();
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } catch (error) {
        setMessage({ text: 'Error deleting workspace', type: 'error' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      }
    }
  };

  const renderWorkspaces = () => (
    <div style={styles.workspacesContainer}>
      <h2 style={styles.sectionTitle}>All Workspaces</h2>
      {message.text && activeView === 'workspaces' && (
        <div style={{
          ...styles.message,
          ...(message.type === 'success' ? styles.successMessage : styles.errorMessage),
          maxWidth: '600px',
          margin: '0 auto 20px'
        }}>
          {message.text}
        </div>
      )}
      <div style={styles.workspacesGrid}>
        {workspaces.map((workspace) => (
          <div key={workspace._id} style={styles.workspaceCard} className="workspace-card">
            <img 
              src={workspace.images?.[0] || workspace.image1 || 'https://via.placeholder.com/300x200'} 
              alt={workspace.title}
              style={styles.workspaceImage}
            />
            <div style={styles.workspaceContent}>
              <h3 style={styles.workspaceTitle}>{workspace.title}</h3>
              <p style={styles.workspaceDescription}>{workspace.description}</p>
              <p style={styles.workspacePrice}>₹{workspace.price}/hr</p>
              <p style={styles.workspaceLocation}>{workspace.city}, {workspace.locationName}</p>
              <div style={styles.workspaceActions}>
                <button 
                  style={styles.editButton}
                  className="edit-button"
                  onClick={() => handleEdit(workspace)}
                >
                  <Edit size={16} /> Edit
                </button>
                <button 
                  style={styles.deleteButton}
                  className="delete-button"
                  onClick={() => deleteWorkspace(workspace._id)}
                >
                  <X size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReviews = () => (
    <div style={styles.reviewsContainer}>
      <h2 style={styles.sectionTitle}>All Reviews & Ratings</h2>
      <div style={styles.reviewsList}>
        {reviews.length === 0 ? (
          <div style={styles.emptyState}>
            <Star size={48} style={{ color: '#ffd700', marginBottom: '15px' }} />
            <p style={styles.emptyText}>No reviews yet</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} style={styles.reviewCard}>
              <div style={styles.reviewHeader}>
                <div>
                  <span style={styles.reviewUser}>{review.userEmail}</span>
                  <p style={styles.workspaceName}>
                    Workspace: {review.workspaceId?.title || 'Unknown Workspace'}
                  </p>
                </div>
                <div style={styles.reviewRating}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              <p style={styles.reviewText}>{review.review}</p>
              <p style={styles.reviewDate}>
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div style={styles.bookingsContainer}>
      <h2 style={styles.sectionTitle}>All Bookings</h2>
      <div style={styles.bookingsList}>
        {bookings.length === 0 ? (
          <div style={styles.emptyState}>
            <Calendar size={48} style={{ color: '#ffd700', marginBottom: '15px' }} />
            <p style={styles.emptyText}>No bookings yet</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking._id} style={styles.bookingCard}>
              <div style={styles.bookingHeader}>
                <h3 style={styles.bookingTitle}>{booking.workspaceTitle}</h3>
                <span style={{
  ...styles.bookingStatus,
  background: booking.status === 'cancelled' ? '#f44336' : '#4CAF50'
}}>
  {booking.status}
</span>
              </div>
              <div style={styles.bookingDetails}>
                <p><strong>User:</strong> {booking.userEmail}</p>
                <p><strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
                <p><strong>Hours:</strong> {booking.hours}</p>
                <p><strong>Amount:</strong> ₹{booking.totalAmount}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderForm = (isEdit = false) => (
    <form style={styles.form} onSubmit={isEdit ? handleEditSubmit : handleSubmit}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Workspace Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          style={styles.input}
          className="admin-input"
          placeholder="Enter workspace name"
          required
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          style={styles.textarea}
          className="admin-textarea"
          placeholder="Describe the workspace"
          required
        />
      </div>

      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Price (₹/hr) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            style={styles.input}
            className="admin-input"
            placeholder="500"
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Square Feet *</label>
          <input
            type="number"
            name="sqft"
            value={formData.sqft}
            onChange={handleChange}
            style={styles.input}
            className="admin-input"
            placeholder="500"
            required
          />
        </div>
      </div>

      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            style={styles.input}
            className="admin-input"
            placeholder="Mumbai"
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Location Name</label>
          <input
            type="text"
            name="locationName"
            value={formData.locationName}
            onChange={handleChange}
            style={styles.input}
            className="admin-input"
            placeholder="Bandra West"
          />
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Street Address *</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          style={styles.input}
          className="admin-input"
          placeholder="123 Main Street"
          required
        />
      </div>

      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Latitude *</label>
          <input
            type="number"
            step="any"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            style={styles.input}
            className="admin-input"
            placeholder="19.0760"
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Longitude *</label>
          <input
            type="number"
            step="any"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            style={styles.input}
            className="admin-input"
            placeholder="72.8777"
            required
          />
        </div>
      </div>

      {isEdit && existingImages.length > 0 && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Existing Images</label>
          <div style={styles.imagePreviewContainer}>
            {existingImages.map((img, index) => (
              <div key={index} style={styles.imagePreview}>
                <img src={img} alt={`Preview ${index}`} style={styles.previewImage} />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  style={styles.removeImageButton}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.formGroup}>
        <label style={styles.label}>
          <Upload size={18} style={{ display: 'inline', marginRight: '8px' }} />
          {isEdit ? 'Add More Images (up to 5 total)' : 'Images (up to 5) *'}
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          style={styles.fileInput}
          required={!isEdit}
        />
        {images.length > 0 && (
          <p style={{ color: 'rgba(255, 215, 0, 0.7)', marginTop: '8px' }}>
            {images.length} new file(s) selected
          </p>
        )}
      </div>

      <button 
        type="submit" 
        style={styles.submitButton}
        className="submit-button"
        disabled={loading}
      >
        {loading ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Workspace' : 'Add Workspace')}
      </button>
    </form>
  );

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      fontFamily: 'Arial, sans-serif'
    },
    workspaceName: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '0.8rem',
      margin: '2px 0 0 0'
    },
    header: {
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)',
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '2px solid rgba(255, 215, 0, 0.3)'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      color: '#ffd700',
      fontSize: '1.8rem',
      fontWeight: 'bold',
      textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
    },
    headerButtons: {
      display: 'flex',
      gap: '15px'
    },
    button: {
      padding: '12px 24px',
      background: 'rgba(255, 215, 0, 0.2)',
      border: '2px solid #ffd700',
      borderRadius: '10px',
      color: '#ffd700',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease'
    },
    logoutButton: {
      padding: '12px 24px',
      background: 'rgba(255, 107, 107, 0.2)',
      border: '2px solid #ff6b6b',
      borderRadius: '10px',
      color: '#ff6b6b',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease'
    },
    mainContent: {
      padding: '60px 40px',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    welcomeSection: {
      textAlign: 'center',
      marginBottom: '60px'
    },
    welcomeTitle: {
      color: '#ffd700',
      fontSize: '3rem',
      marginBottom: '15px',
      fontWeight: 'bold',
      textShadow: '0 0 30px rgba(255, 215, 0, 0.5)'
    },
    welcomeSubtitle: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '1.2rem',
      letterSpacing: '1px'
    },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
      marginTop: '40px'
    },
    card: {
      background: 'rgba(255, 215, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '20px',
      padding: '30px',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    cardTitle: {
      color: '#ffd700',
      fontSize: '1.5rem',
      marginBottom: '10px',
      fontWeight: 'bold'
    },
    cardDescription: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '1rem',
      lineHeight: '1.6'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      borderRadius: '20px',
      padding: '40px',
      maxWidth: '800px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      position: 'relative'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px'
    },
    modalTitle: {
      color: '#ffd700',
      fontSize: '2rem',
      fontWeight: 'bold',
      textShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: '#ff6b6b',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '50%',
      transition: 'all 0.3s ease'
    },
    form: {
      display: 'grid',
      gap: '20px'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      color: '#ffd700',
      fontSize: '0.95rem',
      fontWeight: '600',
      letterSpacing: '0.5px'
    },
    input: {
      padding: '12px 15px',
      background: 'rgba(255, 215, 0, 0.05)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '10px',
      color: 'white',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s ease'
    },
    textarea: {
      padding: '12px 15px',
      background: 'rgba(255, 215, 0, 0.05)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '10px',
      color: 'white',
      fontSize: '1rem',
      outline: 'none',
      minHeight: '100px',
      resize: 'vertical',
      transition: 'all 0.3s ease'
    },
    fileInput: {
      padding: '12px',
      background: 'rgba(255, 215, 0, 0.05)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '10px',
      color: 'white',
      fontSize: '1rem',
      cursor: 'pointer'
    },
    submitButton: {
      padding: '15px',
      background: 'linear-gradient(45deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.2))',
      border: '2px solid #ffd700',
      borderRadius: '10px',
      color: '#ffd700',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    message: {
      padding: '15px',
      borderRadius: '10px',
      marginBottom: '20px',
      textAlign: 'center',
      fontWeight: '600'
    },
    successMessage: {
      background: 'rgba(76, 175, 80, 0.2)',
      border: '2px solid #4CAF50',
      color: '#4CAF50'
    },
    errorMessage: {
      background: 'rgba(244, 67, 54, 0.2)',
      border: '2px solid #f44336',
      color: '#f44336'
    },
    sectionTitle: {
      color: '#ffd700',
      fontSize: '2rem',
      marginBottom: '30px',
      textAlign: 'center',
      textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
    },
    workspacesContainer: {
      marginTop: '30px'
    },
    workspacesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '25px',
      marginTop: '20px'
    },
    workspaceCard: {
      background: 'rgba(255, 215, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '15px',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    workspaceImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover'
    },
    workspaceContent: {
      padding: '20px'
    },
    workspaceTitle: {
      color: '#ffd700',
      fontSize: '1.3rem',
      marginBottom: '10px',
      fontWeight: 'bold'
    },
    workspaceDescription: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '0.9rem',
      marginBottom: '10px',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    workspacePrice: {
      color: '#ffd700',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      marginBottom: '5px'
    },
    workspaceLocation: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '0.9rem',
      marginBottom: '15px'
    },
    workspaceActions: {
      display: 'flex',
      gap: '10px'
    },
    editButton: {
      padding: '8px 16px',
      background: 'rgba(76, 175, 80, 0.2)',
      border: '1px solid #4CAF50',
      borderRadius: '5px',
      color: '#4CAF50',
      cursor: 'pointer',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px',
      transition: 'all 0.3s ease'
    },
    deleteButton: {
      padding: '8px 16px',
      background: 'rgba(244, 67, 54, 0.2)',
      border: '1px solid #f44336',
      borderRadius: '5px',
      color: '#f44336',
      cursor: 'pointer',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px',
      transition: 'all 0.3s ease'
    },
    reviewsContainer: {
      marginTop: '30px'
    },
    reviewsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '800px',
      margin: '0 auto'
    },
    reviewCard: {
      background: 'rgba(255, 215, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '15px',
      padding: '20px',
      transition: 'all 0.3s ease'
    },
    reviewHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px'
    },
    reviewUser: {
      color: '#ffd700',
      fontWeight: 'bold'
    },
    reviewRating: {
      color: '#ffd700',
      fontSize: '1.2rem'
    },
    reviewText: {
      color: 'rgba(255, 255, 255, 0.8)',
      lineHeight: '1.5',
      marginBottom: '10px'
    },
    reviewDate: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '0.8rem'
    },
    bookingsContainer: {
      marginTop: '30px'
    },
    bookingsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '800px',
      margin: '0 auto'
    },
    bookingCard: {
      background: 'rgba(255, 215, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '15px',
      padding: '20px',
      transition: 'all 0.3s ease'
    },
    bookingHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    bookingTitle: {
      color: '#ffd700',
      fontSize: '1.2rem',
      margin: 0
    },
    bookingStatus: {
      background: '#4CAF50',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 'bold'
    },
    bookingDetails: {
      color: 'rgba(255, 255, 255, 0.8)'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: 'rgba(255, 255, 255, 0.7)'
    },
    emptyText: {
      fontSize: '1.1rem',
      margin: 0
    },
    imagePreviewContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '10px',
      marginTop: '10px'
    },
    imagePreview: {
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '2px solid rgba(255, 215, 0, 0.3)'
    },
    previewImage: {
      width: '100%',
      height: '120px',
      objectFit: 'cover',
      display: 'block'
    },
    removeImageButton: {
      position: 'absolute',
      top: '5px',
      right: '5px',
      background: 'rgba(244, 67, 54, 0.9)',
      border: 'none',
      color: 'white',
      padding: '5px',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease'
    }
  };

  return (
    <>
      <style>
        {`
          .admin-button:hover {
            background: rgba(255, 215, 0, 0.3) !important;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
            transform: translateY(-2px);
          }

          .logout-button:hover {
            background: rgba(255, 107, 107, 0.3) !important;
            box-shadow: 0 0 30px rgba(255, 107, 107, 0.4);
            transform: translateY(-2px);
          }

          .admin-card:hover {
            background: rgba(255, 215, 0, 0.15) !important;
            transform: translateY(-5px);
            box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);
          }

          .admin-input:focus, .admin-textarea:focus {
            border-color: #ffd700 !important;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
            background: rgba(255, 215, 0, 0.1) !important;
          }

          .submit-button:hover:not(:disabled) {
            background: linear-gradient(45deg, rgba(255, 215, 0, 0.4), rgba(255, 215, 0, 0.3)) !important;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
            transform: translateY(-2px);
          }

          .submit-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .close-button:hover {
            background: rgba(255, 107, 107, 0.2) !important;
            transform: rotate(90deg);
          }

          .workspace-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);
          }

          .edit-button:hover {
            background: rgba(76, 175, 80, 0.3) !important;
            box-shadow: 0 0 15px rgba(76, 175, 80, 0.4);
          }

          .delete-button:hover {
            background: rgba(244, 67, 54, 0.3) !important;
            box-shadow: 0 0 15px rgba(244, 67, 54, 0.4);
          }

          .remove-image-button:hover {
            background: rgba(244, 67, 54, 1) !important;
            transform: scale(1.1);
          }
        `}
      </style>

      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logo}>
            <Shield size={35} />
            ADMIN PANEL
          </div>
          <div style={styles.headerButtons}>
            <button 
              style={styles.button}
              className="admin-button"
              onClick={() => setActiveView('dashboard')}
            >
              Dashboard
            </button>
            <button 
              style={styles.button}
              className="admin-button"
              onClick={() => navigate('/home')}
            >
              View Site
            </button>
            <button 
              style={styles.logoutButton}
              className="logout-button"
              onClick={onLogout}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        <div style={styles.mainContent}>
          {activeView === 'dashboard' && (
            <>
              <div style={styles.welcomeSection}>
                <h1 style={styles.welcomeTitle}>Welcome, Administrator</h1>
                <p style={styles.welcomeSubtitle}>
                  Manage your workspace listings and platform settings
                </p>
              </div>

              <div style={styles.dashboardGrid}>
                <div 
                  style={styles.card}
                  className="admin-card"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus size={40} style={{ color: '#ffd700', marginBottom: '15px' }} />
                  <h3 style={styles.cardTitle}>Add New Workspace</h3>
                  <p style={styles.cardDescription}>
                    Create and publish new workspace listings for users to discover
                  </p>
                </div>

                <div 
                  style={styles.card}
                  className="admin-card"
                  onClick={() => setActiveView('workspaces')}
                >
                  <MapPin size={40} style={{ color: '#ffd700', marginBottom: '15px' }} />
                  <h3 style={styles.cardTitle}>View All Workspaces</h3>
                  <p style={styles.cardDescription}>
                    Browse and manage existing workspace listings
                  </p>
                </div>

                <div 
                  style={styles.card}
                  className="admin-card"
                  onClick={() => setActiveView('reviews')}
                >
                  <Star size={40} style={{ color: '#ffd700', marginBottom: '15px' }} />
                  <h3 style={styles.cardTitle}>Reviews & Ratings</h3>
                  <p style={styles.cardDescription}>
                    View all user reviews and ratings for workspaces
                  </p>
                </div>

                <div 
                  style={styles.card}
                  className="admin-card"
                  onClick={() => setActiveView('bookings')}
                >
                  <Calendar size={40} style={{ color: '#ffd700', marginBottom: '15px' }} />
                  <h3 style={styles.cardTitle}>View All Bookings</h3>
                  <p style={styles.cardDescription}>
                    Monitor all bookings and user reservations
                  </p>
                </div>
              </div>
            </>
          )}

          {activeView === 'workspaces' && renderWorkspaces()}
          {activeView === 'reviews' && renderReviews()}
          {activeView === 'bookings' && renderBookings()}
        </div>

        {/* Add Workspace Modal */}
        {showAddForm && (
          <div style={styles.modal} onClick={() => setShowAddForm(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Add New Workspace</h2>
                <button 
                  style={styles.closeButton}
                  className="close-button"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                    setMessage({ text: '', type: '' });
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {message.text && (
                <div style={{
                  ...styles.message,
                  ...(message.type === 'success' ? styles.successMessage : styles.errorMessage)
                }}>
                  {message.text}
                </div>
              )}

              {renderForm(false)}
            </div>
          </div>
        )}

        {/* Edit Workspace Modal */}
        {showEditForm && (
          <div style={styles.modal} onClick={() => setShowEditForm(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Edit Workspace</h2>
                <button 
                  style={styles.closeButton}
                  className="close-button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingWorkspace(null);
                    resetForm();
                    setMessage({ text: '', type: '' });
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {message.text && (
                <div style={{
                  ...styles.message,
                  ...(message.type === 'success' ? styles.successMessage : styles.errorMessage)
                }}>
                  {message.text}
                </div>
              )}

              {renderForm(true)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminDashboard