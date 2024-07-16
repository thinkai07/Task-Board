//organization
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import regImage from '../assets/reg.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { server } from '../constant';

const Organization = () => {
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!fullName.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (!organizationName.trim()) {
      setError('Please enter your organization name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password.');
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    // Proceed with registration
    try {
      const response = await axios.post(`${server}/register`, {
        organizationName,
        organizationEmail: email,
        userName: fullName,
        userEmail: email,
        userPassword: password,
      });

      console.log(response.data);
      // Show confirmation popup
      setShowPopup(true);
    } catch (error) {
      console.error(error);
      // Handle error (e.g., show error message)
      if (error.response && error.response.data.message === 'Email is already registered') {
        setError('Email is already registered.');
      } else {
        setError('Email is already registered.');
      }
    }
  };

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
        setShowPassword(false); // Reset password visibility when popup is hidden
        navigate('/login');
      }, 1000);

      return () => {
        clearTimeout(timer);
        setShowPassword(false); // Reset password visibility when component is unmounted
      };
    }
  }, [showPopup, navigate, setShowPassword]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-300">
      <div className="w-screen max-w-5xl rounded-3xl overflow-hidden shadow-lg flex">
        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-6">Register</h1>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
                Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="fullName"
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="organizationName">
                Organization Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="organizationName"
                type="text"
                placeholder="Organization Name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-6 relative">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  const trimmedValue = e.target.value.trim(); // Trim leading and trailing spaces
                  if (!/\s/.test(trimmedValue)) { // Check if there are no spaces
                    setError('');
                    setPassword(trimmedValue);
                  } else {
                    setError('Password should not contain spaces.');
                  }
                }}
              />
              <div
                className="absolute top-1/2 transform -translate-y-1/2 right-3 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-gray-500" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Sign Up
              </button>
              <a
                className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                href="/login"
              >
                Already a member? Login
              </a>
            </div>
          </form>
        </div>
        <div className="hidden md:block md:w-1/2 bg-blue-100 flex items-center justify-center"
          style={{ backgroundImage: `url(${regImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {/* Optional: Content for the background image section */}
        </div>
      </div>
      {showPopup && (
        <div className="fixed top-3 inset-x-0 flex items-center justify-center">
          <div className="bg-white p-2 rounded-xl shadow-lg flex items-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xl mr-4" />
            <p className="text-xl text-gray-800">Organization created successfully  and please verify before login</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organization;
















