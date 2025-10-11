import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Heading from "./heading";
import Footer from "./footer";
import axios from "axios";
import Loading from "./loading";
import { FaStar, FaRegStar } from 'react-icons/fa';

// Replace with your Stripe publishable key
const stripePromise = loadStripe('pk_test_51SFI4IJvOk7Y1hyF8YdvpkoPgoMAqwREHMOIf4KNM4bbEgT6mrZS8LSFiS7v9o2sK5kM3lapudUTI4LyPa1t4Otk00j7l4MWgd');

function BookingForm({ workspace, onClose, onSuccess, user }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hours, setHours] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (startTime && endTime) {
      const start = parseInt(startTime.split(':')[0]);
      const end = parseInt(endTime.split(':')[0]);
      const calculatedHours = end - start;
      
      if (calculatedHours > 0) {
        setHours(calculatedHours);
        const amount = calculatedHours * workspace.price;
        setTotalAmount(amount);
      } else {
        setHours(0);
        setTotalAmount(0);
      }
    } else {
      setHours(0);
      setTotalAmount(0);
    }
  }, [startTime, endTime, workspace.price]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Create payment intent
      const { data: paymentData } = await axios.post(
        'https://workspacefinder-2.onrender.com/api/create-payment-intent',
        { 
          amount: totalAmount
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: user?.email || 'Customer',
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      // Create booking
      await axios.post(
        'https://workspacefinder-2.onrender.com/api/bookings',
        {
          workspaceId: workspace._id,
          workspaceTitle: workspace.title,
          workspaceImage: workspace.image1 || workspace.images?.[0],
          bookingDate,
          startTime,
          endTime,
          hours,
          totalAmount,
          paymentIntentId: paymentIntent.id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Book Workspace</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Booking Date:</label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={today}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Start Time:</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>End Time:</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          {hours > 0 && (
            <div style={styles.priceInfo}>
              <p><strong>Hours:</strong> {hours} hours</p>
              <p><strong>Total Amount:</strong> ₹{totalAmount}</p>
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Card Details:</label>
            <div style={styles.cardElement}>
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.buttonGroup}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !stripe || hours <= 0}
              style={{...styles.submitBtn, opacity: (loading || !stripe || hours <= 0) ? 0.6 : 1}}
            >
              {loading ? 'Processing...' : `Pay ₹${totalAmount}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReviewForm({ workspaceId, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://workspacefinder-2.onrender.com/api/ratings',
        { workspaceId, rating, review },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
      setLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Write a Review</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Rating:</label>
            <div style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  style={styles.star}
                >
                  {star <= rating ? <FaStar color="#ffc107" size={30} /> : <FaRegStar size={30} />}
                </span>
              ))}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Review:</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              required
              rows={4}
              style={{...styles.input, resize: 'vertical'}}
              placeholder="Share your experience..."
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.buttonGroup}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || rating === 0}
              style={{...styles.submitBtn, opacity: (loading || rating === 0) ? 0.6 : 1}}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Seemore({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkspace();
    fetchReviews();
  }, [id]);

  const fetchWorkspace = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://workspacefinder-2.onrender.com/api/workspaces/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkspace(response.data);
    } catch (error) {
      console.error("Error fetching workspace:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = () => {
    const token = localStorage.getItem('token');
    axios.get(`https://workspacefinder-2.onrender.com/api/ratings/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        setReviews(response.data.ratings);
        setAverageRating(response.data.averageRating);
      })
      .catch((error) => console.error("Error fetching reviews:", error));
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    alert('Booking successful! Check "My Bookings" to view details.');
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    fetchReviews();
    alert('Review submitted successfully!');
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  // Get all images from workspace
  const getWorkspaceImages = () => {
    if (!workspace) return [];
    
    const images = [];
    
    // Check for individual image fields
    if (workspace.image1) images.push(workspace.image1);
    if (workspace.image2) images.push(workspace.image2);
    if (workspace.image3) images.push(workspace.image3);
    
    // Check for images array
    if (workspace.images && workspace.images.length > 0) {
      images.push(...workspace.images);
    }
    
    // If no images found, use a placeholder
    if (images.length === 0) {
      images.push('https://via.placeholder.com/800x500/007BFF/FFFFFF?text=No+Image+Available');
    }
    
    return images;
  };

  if (loading) {
    return (
      <>
        <Heading user={user} onLogout={onLogout} />
        <div style={styles.loadingContainer}><Loading /></div>
      </>
    );
  }

  if (!workspace) {
    return (
      <>
        <Heading user={user} onLogout={onLogout} />
        <div style={styles.errorContainer}>
          <h2>Workspace not found</h2>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            Go Back
          </button>
        </div>
      </>
    );
  }

  const workspaceImages = getWorkspaceImages();

  return (
    <>
      <Heading user={user} onLogout={onLogout} />
      <div style={styles.container}>
        <div style={styles.card}>
          {workspaceImages.length > 0 ? (
            <Slider {...settings}>
              {workspaceImages.map((img, index) => (
                <div key={index}>
                  <img 
                    src={img} 
                    alt={`${workspace.title} ${index + 1}`} 
                    style={styles.image}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x500/007BFF/FFFFFF?text=Image+Not+Found';
                    }}
                  />
                </div>
              ))}
            </Slider>
          ) : (
            <div style={styles.placeholderImage}>
              <img 
                src="https://via.placeholder.com/800x500/007BFF/FFFFFF?text=No+Images+Available" 
                alt="Placeholder" 
                style={styles.image}
              />
            </div>
          )}

          <div style={styles.content}>
            <h1 style={styles.title}>{workspace.title}</h1>
            
            <div style={styles.ratingDisplay}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                  {star <= Math.round(averageRating) ? 
                    <FaStar color="#ffc107" size={20} /> : 
                    <FaRegStar size={20} />
                  }
                </span>
              ))}
              <span style={styles.ratingText}>
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>

            <p style={styles.price}><strong>Price:</strong> ₹{workspace.price}/hr</p>
            <p style={styles.description}>{workspace.description}</p>
            <p style={styles.detail}><strong>Location:</strong> {workspace.locationName}</p>
            <p style={styles.detail}><strong>Area:</strong> {workspace.sqft} sqft</p>
            
            {workspace.location && (
              <a href={workspace.location} target="_blank" rel="noopener noreferrer" style={styles.link}>
                View on Map
              </a>
            )}

            <div style={styles.actionButtons}>
              <button onClick={() => setShowBookingModal(true)} style={styles.bookBtn}>
                Book Now
              </button>
              <button onClick={() => setShowReviewModal(true)} style={styles.reviewBtn}>
                Write a Review
              </button>
            </div>
          </div>

          {reviews.length > 0 && (
            <div style={styles.reviewsSection}>
              <h2 style={styles.reviewsTitle}>Customer Reviews</h2>
              {reviews.map((review) => (
                <div key={review._id} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <strong>{review.userEmail?.split('@')[0] || 'Anonymous'}</strong>
                    <div>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star}>
                          {star <= review.rating ? 
                            <FaStar color="#ffc107" size={16} /> : 
                            <FaRegStar size={16} />
                          }
                        </span>
                      ))}
                    </div>
                  </div>
                  <p style={styles.reviewText}>{review.review}</p>
                  <p style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          <button style={styles.backButton} onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      {showBookingModal && (
        <Elements stripe={stripePromise}>
          <BookingForm
            workspace={workspace}
            user={user}
            onClose={() => setShowBookingModal(false)}
            onSuccess={handleBookingSuccess}
          />
        </Elements>
      )}

      {showReviewModal && (
        <ReviewForm
          workspaceId={id}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}

      <Footer />
    </>
  );
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      padding: '10px 12px',
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '0 20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '400px',
    objectFit:"cover"
  },
  placeholderImage: {
    width: '100%',
    height: '400px',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: '30px',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '20px',
    color: '#333',
  },
  ratingDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  ratingText: {
    fontSize: '1rem',
    color: '#666',
  },
  price: {
    fontSize: '1.8rem',
    color: '#007BFF',
    marginBottom: '15px',
  },
  description: {
    fontSize: '1.1rem',
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '15px',
  },
  detail: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '10px',
  },
  link: {
    display: 'inline-block',
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px',
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
    marginTop: '30px',
  },
  bookBtn: {
    flex: 1,
    padding: '15px 30px',
    fontSize: '1.1rem',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  reviewBtn: {
    flex: 1,
    padding: '15px 30px',
    fontSize: '1.1rem',
    backgroundColor: '#ffc107',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  backButton: {
    margin: '30px',
    padding: '12px 30px',
    fontSize: '1rem',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  reviewsSection: {
    padding: '30px',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #ddd',
  },
  reviewsTitle: {
    fontSize: '1.8rem',
    marginBottom: '20px',
    color: '#333',
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: '20px',
    marginBottom: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  reviewText: {
    fontSize: '1rem',
    color: '#555',
    lineHeight: '1.5',
    marginBottom: '10px',
  },
  reviewDate: {
    fontSize: '0.9rem',
    color: '#999',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalTitle: {
    fontSize: '1.8rem',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  label: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    padding: '12px',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
  },
  cardElement: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#fff',
  },
  priceInfo: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    fontSize: '1.1rem',
  },
  starContainer: {
    display: 'flex',
    gap: '10px',
  },
  star: {
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginTop: '20px',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    fontSize: '1rem',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  submitBtn: {
    flex: 1,
    padding: '12px',
    fontSize: '1rem',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  error: {
    padding: '12px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '6px',
    fontSize: '0.95rem',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '70vh',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    gap: '20px',
  },
  testCardInfo: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #dee2e6',
  },
};

export default Seemore;