//app.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Projects from './components/Projects';
import Tasks from './components/KanbanBoard';
import TasksPage from './components/Taskspage'; // Import the new TasksPage component
import LoginPage from './components/LoginPage';
import Overview from './components/Overview';
import RegistrationPage from './components/RegistrationPage';

import AdminPanel from './components/AdminPanel';
import Organization from './components/Organization';
import ResetPassword from './components/ResetPassword';
import KanbanBoard from './components/KanbanBoard';
import Teams from './components/Teams';
import SuccessPage from './components/SuccessPage';



const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('token') !== null;
  });
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path='/login' element={<LoginPage onLogin={handleLogin} />} />
        <Route path='/register' element={<RegistrationPage />} />
        <Route path='/Organization' element={<Organization />} /> 
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/success' element= {<SuccessPage />} />

        <Route
          path="/*"
          element={
            isLoggedIn ? (
              <Layout isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="projects" element={<Projects />} />
                  <Route path="/projects/:projectId/tasks" element={<KanbanBoard user={user} />} />
                  <Route path="/" element={<Overview />} />
                  <Route path='/tasks' element={<TasksPage user={user} />} /> 
                  <Route path='/members' element={<AdminPanel />} /> 
                  <Route path="/projects/:projectId/teams" element={<Teams/>} />
                  
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/Organization" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;