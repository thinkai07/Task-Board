//reset page
import React, { useState } from 'react';
import regImage from '../assets/reset.png';
import axios from 'axios';
import { server } from '../constant';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const ResetPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState(new URLSearchParams(window.location.search).get('token'));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validatePassword = (password) => {
    const isValid = password.length >= 8 && password[0] === password[0].toUpperCase();
    return isValid;
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setSuccess('');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters ');
      return;
    }


    try {
      await axios.post(`${server}/resetPassword`, { token, newPassword: password });
      setSuccess('Password reset successfully');

      window.location.href = '/login';
    } catch (err) {
      setError('Token has expired');
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col w-full md:w-3/5 items-center h-4/5 bg-white shadow-md rounded-3xl p-8 md:flex-row">
        <div className="md:w-1/2 md:pr-8">
          <div className="flex justify-left items-left">
            <h1 className="text-4xl font-bold mb-6 text-gray-700 text-center">Reset Your Password</h1>
          </div>
          {error && (
            <div className=" text-red-500 px-4 py-3 rounded mb-6">
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <p>{success}</p>
            </div>
          )}
          <h1 className="text-3xl mb-2">Hello,</h1>
          <h1 className="text-3xl font-bold mb-6 text-blue-500">Welcome!</h1>
          <form onSubmit={handleReset}>
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
                  const trimmedValue = e.target.value.replace(/\s/g, ''); // Remove all spaces
                  setError('');
                  setPassword(trimmedValue);
                }}
              />
              {error && <p className="text-red-500 text-xs italic">{error}</p>}

              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  className="text-gray-500 h-5 w-5"
                />
              </div>
            </div>
            <div className="mb-6 relative">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  const trimmedValue = e.target.value.replace(/\s/g, ''); // Remove all spaces
                  setError('');
                  setConfirmPassword(trimmedValue);
                }}
                required
              />
              {error && <p className="text-red-500 text-xs italic">{error}</p>}
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={toggleConfirmPasswordVisibility}
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                  className="text-gray-500 h-5 w-5"
                />
              </div>
            </div>
            <div className="flex items-center justify-left">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                type="submit"
              >
                Reset
              </button>
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
          <img src={regImage} alt="Registration" className="w-4/5 h-auto" />
        </div>
      </div>
    </div>
  );
};

export default ResetPage;
