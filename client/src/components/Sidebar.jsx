// //sidebar.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MdOutlineGridView } from "react-icons/md";
import { GoProjectSymlink, GoTasklist } from "react-icons/go";
import { FaRegCalendarAlt } from "react-icons/fa";
import { IoPeopleOutline } from "react-icons/io5";
import { RiSettingsLine } from "react-icons/ri";
import task from "../assets/task.png";
import axios from 'axios';
import { server } from '../constant';

const Sidebar = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${server}/api/projects`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  const handleProjectClick = async (projectId) => {
    try {
      const response = await axios.get(`${server}/api/projects/${projectId}/tasks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const tasks = response.data;
      navigate(`/projects/${projectId}/tasks`, { state: { tasks } });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const getNavLinkClass = (path) => {
    return location.pathname === path ? 'bg-gray-200 font-bold' : 'hover:font-bold';
  };

  return (
    <div className="w-55 h-full bg-white-800 text-black flex flex-col shadow-md shadow-gray-400">
      <div className="p-6 flex items-center">
        <img src={task} alt="Logo" className="w-10 h-10 mr-3" />
        <h2 className="text-xl font-bold">TaskBoard</h2>
      </div>
      <ul className="flex-1">
        <li className={`p-4 pl-8 flex items-center cursor-pointer text-lg ${getNavLinkClass('/')}`}>
          <MdOutlineGridView className="mr-3" />
          <Link to="/" className="block w-full h-full">Overview</Link>
        </li>
        <li className={`p-4 pl-8 flex items-center cursor-pointer text-lg ${getNavLinkClass('/projects')}`}>
          <GoProjectSymlink className="mr-3" />
          <Link to="/projects" className="block w-full h-full">Projects</Link>
        </li>
        {projects.length > 0 && (
          <li
            key={projects[0]._id}
            className={`p-4 pl-8 flex items-center cursor-pointer text-lg ${getNavLinkClass(`/projects/${projects[0]._id}/tasks`)}`}
            onClick={() => handleProjectClick(projects[0]._id)}
          >
            <GoTasklist className="mr-3" />
            <Link className="block w-full h-full">Tasks</Link>
          </li>
        )}
        <li className={`p-4 pl-8 flex items-center cursor-pointer text-lg ${getNavLinkClass('/calendar')}`}>
          <FaRegCalendarAlt className="mr-3" />
          <Link to="/calendar" className="block w-full h-full">Calendar</Link>
        </li>
        <li className={`p-4 pl-8 flex items-center cursor-pointer text-lg ${getNavLinkClass('/members')}`}>
          <IoPeopleOutline className="mr-3" />
          <Link to="/members" className="block w-full h-full">Members</Link>
        </li>
        {/* <li className={`p-4 pl-8 flex items-center cursor-pointer text-lg ${getNavLinkClass('/settings')}`}>
          <RiSettingsLine className="mr-3" />
          <Link to="/settings" className="block w-full h-full">Settings</Link>
        </li> */}
      </ul>
    </div>
  );
};

export default Sidebar;