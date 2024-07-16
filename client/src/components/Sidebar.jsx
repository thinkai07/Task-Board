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
import { AiOutlineAudit } from "react-icons/ai";

const Sidebar = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // useEffect(() => {
  //   const fetchProjects = async () => {
  //     try {
  //       const response = await axios.get(`${server}/api/projects`, {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem('token')}`,
  //         },
  //       });
  //       setProjects(response.data);
  //     } catch (error) {
  //       console.error('Error fetching projects:', error);
  //     }
  //   };
  //   fetchProjects();
  // }, []);

  // const handleProjectClick = async (projectId) => {
  //   try {
  //     const response = await axios.get(`${server}/api/projects/${projectId}/tasks`, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem('token')}`,
  //       },
  //     });
  //     const tasks = response.data;
  //     navigate(`/projects/${projectId}/tasks`, { state: { tasks } });
  //   } catch (error) {
  //     console.error('Error fetching tasks:', error);
  //   }
  // };

  const getNavLinkClass = (path) => {
    return location.pathname === path
      ? 'bg-gray-200 text-black font-bold w-56 ml-3 rounded-tl-3xl  rounded-br-3xl'
      : 'hover:font-bold text-black';
  };

  const getIconClass = (path) => {
    return location.pathname === path ? 'text-black' : 'text-black';
  };

  return (
    <div className="w-64 h-full bg-white text-black flex flex-col shadow-md shadow-gray-400">
      <div className="p-6 flex items-center">
        <img src={task} alt="Logo" className="w-10 h-10 mr-3" />
        <h2 className="text-xl font-bold">TaskBoard</h2>
      </div>
      <ul className="flex-1 pt-8">
        <li className={`p-4 pl-12 flex items-center cursor-pointer text-lg ${getNavLinkClass('/')}`}>
          <MdOutlineGridView className={`mr-3 ${getIconClass('/')}`} />
          <Link to="/" className="block w-full h-full">Overview</Link>
        </li>
        <li className={`p-4 pl-12 flex items-center cursor-pointer text-lg ${getNavLinkClass('/projects')}`}>
          <GoProjectSymlink className={`mr-3 ${getIconClass('/projects')}`} />
          <Link to="/projects" className="block w-full h-full">Projects</Link>
        </li>
        {/* {projects.length > 0 && (
          <li
            key={projects[0]._id}
            className={`p-4 pl-12 flex items-center cursor-pointer text-lg ${getNavLinkClass(`/projects/${projects[0]._id}/tasks`)}`}
            onClick={() => handleProjectClick(projects[0]._id)}
          >
            <GoTasklist className={`mr-3 ${getIconClass(`/projects/${projects[0]._id}/tasks`)}`} />
            <Link className="block w-full h-full">Tasks</Link>
          </li>
        )} */}
        <li className={`p-4 pl-12 flex items-center cursor-pointer text-lg ${getNavLinkClass('/calendar')}`}>
          <FaRegCalendarAlt className={`mr-3 ${getIconClass('/calendar')}`} />
          <Link to="/calendar" className="block w-full h-full">Calendar</Link>
        </li>
        <li className={`p-4 pl-12 flex items-center cursor-pointer text-lg ${getNavLinkClass('/members')}`}>
          <IoPeopleOutline className={`mr-3 ${getIconClass('/members')}`} />
          <Link to="/members" className="block w-full h-full">Members</Link>
        </li>
        <li className={`p-4 pl-12 flex items-center cursor-pointer text-lg ${getNavLinkClass('/Auditlog')}`}>
          <AiOutlineAudit className="mr-3" />
          <Link to="/Auditlog" className="block w-full h-full">Auditlog</Link>
        </li>
      </ul>
      
    </div>
  );
};

export default Sidebar;












