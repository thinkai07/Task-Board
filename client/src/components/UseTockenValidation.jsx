import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { server } from '../constant';

const useTokenValidation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      const checkTokenValidity = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          // No token found, navigate to login page
          navigate('/login');
          return;
        }
        
        try {
          const response = await fetch(`${server}/api/protected`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) {
            throw new Error('Invalid token');
          }
        } catch (error) {
          console.error('Error:', error);
          localStorage.removeItem('token');
          navigate('/login');
        }
      };

      // Check token validity initially
      checkTokenValidity();

      // Set interval for periodic token validation
      const tokenCheckInterval = setInterval(() => {
        checkTokenValidity();
      }, 5 * 60 * 1000);

      // Clean up interval when component unmounts
      return () => clearInterval(tokenCheckInterval);
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    // Start token validation after user logs in and navigates away from the login page
    if (location.pathname !== '/login') {
      setIsLoggedIn(true);
    }
  }, [location]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return { handleLogin };
};

export default useTokenValidation;
