import { useState } from 'react';
import { Shield, Lock, Mail, ArrowLeft } from 'lucide-react';

function LoginPage({ onLogin, onNavigate }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        onLogin({
          token: data.token,
          user: data.user
        });
        if (onNavigate) onNavigate('/');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        onLogin({
          token: data.token,
          user: { ...data.user, isAdmin: true }
        });
        if (onNavigate) onNavigate('/admin/dashboard');
      } else {
        setError(data.message || 'Admin authentication failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif',
      position: 'relative'
    },
    adminContainer: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      fontFamily: 'Arial, sans-serif',
      position: 'relative'
    },
    adminButton: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      padding: '12px 24px',
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '10px',
      color: 'white',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      zIndex: 10
    },
    backButton: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      padding: '12px 24px',
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '10px',
      color: 'white',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      zIndex: 10
    },
    formContainer: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '40px',
      width: '400px',
      maxWidth: '90vw',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      animation: 'slideIn 0.6s ease-out'
    },
    adminFormContainer: {
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(15px)',
      borderRadius: '20px',
      padding: '50px',
      width: '420px',
      maxWidth: '90vw',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      boxShadow: '0 8px 32px 0 rgba(255, 215, 0, 0.2), 0 0 80px rgba(255, 215, 0, 0.1)',
      animation: 'slideIn 0.6s ease-out'
    },
    title: {
      textAlign: 'center',
      color: 'white',
      fontSize: '2.5rem',
      marginBottom: '30px',
      fontWeight: 'bold',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    adminTitle: {
      textAlign: 'center',
      color: '#ffd700',
      fontSize: '2.5rem',
      marginBottom: '10px',
      fontWeight: 'bold',
      textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '15px'
    },
    adminSubtitle: {
      textAlign: 'center',
      color: 'rgba(255, 215, 0, 0.7)',
      fontSize: '0.95rem',
      marginBottom: '30px',
      letterSpacing: '2px',
      textTransform: 'uppercase'
    },
    inputGroup: {
      marginBottom: '20px',
      position: 'relative'
    },
    label: {
      display: 'block',
      color: 'white',
      marginBottom: '8px',
      fontSize: '1rem',
      fontWeight: '500'
    },
    adminLabel: {
      display: 'block',
      color: '#ffd700',
      marginBottom: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      letterSpacing: '0.5px'
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    inputIcon: {
      position: 'absolute',
      left: '15px',
      color: 'rgba(255, 255, 255, 0.6)',
      zIndex: 1
    },
    adminInputIcon: {
      position: 'absolute',
      left: '15px',
      color: '#ffd700',
      zIndex: 1
    },
    input: {
      width: '100%',
      padding: '15px 15px 15px 45px',
      borderRadius: '10px',
      border: 'none',
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box'
    },
    adminInput: {
      width: '100%',
      padding: '15px 15px 15px 45px',
      borderRadius: '10px',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      background: 'rgba(0, 0, 0, 0.3)',
      color: '#ffd700',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '15px',
      borderRadius: '10px',
      border: 'none',
      background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
      color: 'white',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '20px',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    adminButton2: {
      width: '100%',
      padding: '15px',
      borderRadius: '10px',
      border: '2px solid #ffd700',
      background: 'linear-gradient(45deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))',
      color: '#ffd700',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '20px',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
    },
    toggleText: {
      textAlign: 'center',
      color: 'white',
      marginTop: '20px',
      fontSize: '0.9rem'
    },
    toggleLink: {
      color: '#ff6b6b',
      textDecoration: 'underline',
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    error: {
      background: 'rgba(255, 107, 107, 0.2)',
      color: '#ff6b6b',
      padding: '10px',
      borderRadius: '10px',
      marginBottom: '20px',
      textAlign: 'center',
      border: '1px solid rgba(255, 107, 107, 0.3)'
    },
    adminError: {
      background: 'rgba(255, 215, 0, 0.15)',
      color: '#ffd700',
      padding: '12px',
      borderRadius: '10px',
      marginBottom: '20px',
      textAlign: 'center',
      border: '1px solid rgba(255, 215, 0, 0.3)'
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '3px solid rgba(255,255,255,0.3)',
      borderRadius: '50%',
      borderTopColor: 'white',
      animation: 'spin 1s ease-in-out infinite',
      marginRight: '10px'
    },
    adminLoadingSpinner: {
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '3px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '50%',
      borderTopColor: '#ffd700',
      animation: 'spin 1s ease-in-out infinite',
      marginRight: '10px'
    }
  };

  if (showAdminLogin) {
    return (
      <>
        <style>
          {`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-50px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
            
            .admin-input::placeholder {
              color: rgba(255, 215, 0, 0.5);
            }
            
            .admin-input:focus {
              background: rgba(0, 0, 0, 0.5) !important;
              border-color: #ffd700 !important;
              box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
            }
            
            .admin-button-submit:hover {
              background: linear-gradient(45deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.2)) !important;
              box-shadow: 0 0 30px rgba(255, 215, 0, 0.5) !important;
              transform: translateY(-2px);
            }
            
            .admin-button-submit:disabled {
              opacity: 0.5;
              cursor: not-allowed;
              transform: none !important;
            }

            .top-button:hover {
              background: rgba(255, 255, 255, 0.25) !important;
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            }
          `}
        </style>
        <div style={styles.adminContainer}>
          <button 
            style={styles.backButton}
            className="top-button"
            onClick={() => {
              setShowAdminLogin(false);
              setError('');
              setFormData({ email: '', password: '' });
            }}
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>
          
          <div style={styles.adminFormContainer}>
            <h2 style={styles.adminTitle}>
              <Shield size={40} />
              ADMIN
            </h2>
            <div style={styles.adminSubtitle}>Secure Access Portal</div>
            
            {error && (
              <div style={styles.adminError}>
                {error}
              </div>
            )}
            
            <div>
              <div style={styles.inputGroup}>
                <label style={styles.adminLabel}>Admin Email</label>
                <div style={styles.inputWrapper}>
                  <Mail size={20} style={styles.adminInputIcon} />
                  <input
                    type="email"
                    name="email"
                    placeholder="admin@workspace.com"
                    style={styles.adminInput}
                    className="admin-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.adminLabel}>Admin Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={20} style={styles.adminInputIcon} />
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter admin password"
                    style={styles.adminInput}
                    className="admin-input"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <button 
                type="button"
                onClick={handleAdminSubmit}
                style={styles.adminButton2}
                className="admin-button-submit"
                disabled={loading}
              >
                {loading && <span style={styles.adminLoadingSpinner}></span>}
                {loading ? 'Authenticating...' : 'Access Dashboard'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
          
          .login-input::placeholder {
            color: rgba(255, 255, 255, 0.7);
          }
          
          .login-input:focus {
            background: rgba(255, 255, 255, 0.3) !important;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          }
          
          .login-button:hover {
            background: linear-gradient(45deg, #ff5252, #d84315) !important;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
          }
          
          .login-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none !important;
          }

          .top-button:hover {
            background: rgba(255, 255, 255, 0.25) !important;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
          }
        `}
      </style>
      <div style={styles.container}>
        <button 
          style={styles.adminButton}
          className="top-button"
          onClick={() => {
            setShowAdminLogin(true);
            setError('');
            setFormData({ email: '', password: '' });
          }}
        >
          <Shield size={18} />
          Admin Login
        </button>

        <div style={styles.formContainer}>
          <h2 style={styles.title}>
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h2>
          
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}
          
          <div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                style={styles.input}
                className="login-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                style={styles.input}
                className="login-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <button 
              type="button"
              onClick={handleSubmit}
              style={styles.button}
              className="login-button"
              disabled={loading}
            >
              {loading && <span style={styles.loadingSpinner}></span>}
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </div>
          
          <div style={styles.toggleText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              style={styles.toggleLink}
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ email: '', password: '' });
              }}
            >
              {isLogin ? 'Sign up' : 'Login'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;