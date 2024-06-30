import React, { useEffect, useState } from 'react';
import successImage from '../assets/success.png';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { server } from '../constant';

const SuccessPage = () => {
  const [message, setMessage] = useState('Validating your email...');
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    if (token) {
      axios.get(`${server}/validate-email?token=${token}`)
        .then(response => {
          setMessage('Successfully validated your email!');
          setTimeout(() => {
            navigate('/login');
          }, 3000); // Redirect to login after 3 seconds
        })
        .catch(error => {
          console.error('Error validating email:', error);
          setMessage('Error validating your email. Please try again.');
          setError(true);
        });
    } else {
      setMessage('Invalid or missing token.');
      setError(true);
    }
  }, [location.search, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="bg-white rounded-lg w-full h-full p-40 text-center">
        <div className="mb-100">
          <img
            src={successImage}
            alt="Success"
            className="mx-auto"
            style={{ width: '350px', height: '265px' }}
          />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${error ? 'text-red-500' : 'text-blue-500'}`}>
          {message}
        </h2>
        { !error && (
          <label className="block text-gray-700 mb-4 text-sm font-semibold" htmlFor="username">
            Thank you for always believing in us
          </label>
        )}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => navigate('/login')}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
