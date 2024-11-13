// Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import bcrypt from 'bcryptjs';
import { db } from '../../firebase'; // Adjust the path if necessary
import './Login.css';


const Login = () => {
  const [uniqueId, setUniqueId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      // Fetch user document from Firestore by uniqueId
      const userDoc = await getDoc(doc(db, "users", uniqueId));
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const storedHashedPassword = userData.password;
        
        // Compare entered password with stored hashed password
        const passwordMatch = await bcrypt.compare(password, storedHashedPassword);
  
        if (passwordMatch) {
          // If login is successful, navigate to the home page
          navigate('/chat', { state: { uniqueId } });
        } else {
          setError('Invalid unique ID or password');
        }
      } else {
        setError('Invalid unique ID or password');
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError('An error occurred, please try again.');
    }
  };
  
  
  return (
    <div className="register-page">
      <div className="login-div">
        <h2>Login</h2>
        <form className='input-container' onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              id="uniqueId"
              placeholder='Enter Aadhar no.'
              className="text-input1"
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              id="password"
              placeholder='Enter password'
              className="text-input1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" className="verify-button">Login</button>
        </form>
        <a className='register-link' href='/register'>Don't have an account? Register</a>
      </div>
    </div>
  );
};

export default Login;
