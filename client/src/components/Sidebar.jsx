//sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  return (
    <div className="w-55 h-full bg-white-800 text-black flex flex-col shadow-md shadow-gray-400">
      <div className="p-6 flex items-center">
        <img src={task} alt="Logo" className="w-10 h-10 mr-3" />
        <h2 className="text-xl font-bold">TaskBoard</h2>
      </div>
      <ul className="flex-1">
        <li className="p-4 pl-8 flex items-center cursor-pointer text-lg">
          <MdOutlineGridView className="mr-3" />
          <Link to="/" className="hover:font-bold">Overview</Link>
        </li>
        <li className="p-4 pl-8 flex items-center cursor-pointer text-lg">
          <GoProjectSymlink className="mr-3" />
          <Link to="/projects" className="hover:font-bold">Projects</Link>
        </li>
        {/* {projects.length > 0 && (
          <li
            key={projects[0]._id}
            className="p-4 pl-8 flex items-center cursor-pointer text-lg"
            onClick={() => handleProjectClick(projects[0]._id)}
          >
            <GoTasklist className="mr-3" />
            <Link className="hover:font-bold">Tasks</Link>
          </li>
        )} */}
        <li className="p-4 pl-8 flex items-center cursor-pointer text-lg">
          <FaRegCalendarAlt className="mr-3" />
          <Link to="/calendar" className="hover:font-bold">Calendar</Link>
        </li>
        <li className="p-4 pl-8 flex items-center cursor-pointer text-lg">
          <IoPeopleOutline className="mr-3" />
          <Link to="/members" className="hover:font-bold">Members</Link>
        </li>
        <li className="p-4 pl-8 flex items-center cursor-pointer text-lg">
          <RiSettingsLine className="mr-3" />
          <Link to="/settings" className="hover:font-bold">Settings</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;