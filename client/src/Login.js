import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        // Login
        const response = await axios.post('http://localhost:5000/api/login', { email, password });
        console.log(response.data);
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        // Register
        await axios.post('http://localhost:5000/api/register', { email, password });
        setError('');
        setIsLogin(true); // Switch to login view
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `http://localhost:5000/auth/${provider}`;
  };

  return (
    <div className="login-container">
      <h2>{isLogin ? "Log in" : "Sign up"}</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
          />
        </div>
        <button type="submit" className="submit-btn">
          {isLogin ? "Log in" : "Sign up"}
        </button>
      </form>
      <div className="separator">
        <span>or</span>
      </div>
      <button 
        className="toggle-btn" 
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Create an account" : "Log in"}
      </button>
      <div className="social-login">
        <button className="social-btn google" onClick={() => handleOAuthLogin('google')}>Continue with Google</button>
        <button className="social-btn apple" onClick={() => handleOAuthLogin('apple')}>Continue with Apple</button>
        <button className="social-btn facebook" onClick={() => handleOAuthLogin('facebook')}>Continue with Facebook</button>
      </div>
      <p className="terms">
        By continuing, you agree to TravelZ's Terms of Service, Lorem ipsum, dolor sit amet, and consectetur adipiscing elit.
      </p>
    </div>
  );
}

export default Login;
