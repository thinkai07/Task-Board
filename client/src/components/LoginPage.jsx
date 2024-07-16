//login page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { server } from '../constant';
import regImage from '../assets/reg.png';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const handleRegisterClick = () => {
    // Navigate to /Organization
    navigate('/Organization');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate email
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    // Validate password
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      const response = await fetch(`${server}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        await fetchUserProfile(data.token); // Fetch user profile
        console.log(data.token)
        onLogin(); // Call the onLogin function to update the state
        setSuccessMessage('Login successful!');
        setTimeout(() => {
          setSuccessMessage('');
          navigate('/');
        }, 1000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${server}/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-300">
      <div className="w-screen max-w-5xl rounded-3xl overflow-hidden shadow-lg flex">
        {(error || successMessage) && (
          <div className="fixed top-3 inset-x-0 flex items-center justify-center">
            <div className="bg-white p-2 rounded-xl shadow-lg flex items-center">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className={`text-l mr-4 ${error ? 'text-red-500' : 'text-green-500'}`}
              />
              <p className="text-l text-gray-800">{error || successMessage}</p>
            </div>
          </div>
        )}

        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-6 text-gray-700 text-left">Login</h1>
          <h1 className="text-3xl mb-2">Hello,</h1>
          <h1 className="text-3xl font-bold mb-6 text-blue-500">Welcome!</h1>
          <form onSubmit={handleSubmit}>
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
                onChange={(e) => {
                  setError('');
                  setEmail(e.target.value);
                }}
              />
              {/* {error && error.includes('email') && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )} */}
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
                className="absolute top-1/2 transform -translate-y-1/2 right-3 cursor-pointer flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {/* <span className="mr-2 text-gray-500 text-sm">
                  {showPassword ? 'Hide' : 'Show'}
                </span> */}
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-gray-500" />
              </div>
              {/* {error && error.includes('password') && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )} */}
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                type="submit"
              >
                Login
              </button>
              <a
                className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                href="/Organization"
              >
                Register ?
              </a>
              {/* <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
      onClick={handleRegisterClick}
    >
      Register As organization
    </button> */}
            </div>
          </form>
        </div>
        <div
          className="hidden md:block md:w-1/2 bg-blue-100 flex items-center justify-center"
          style={{
            backgroundImage: `url(${regImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Optional: Content for the background image section */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;




















