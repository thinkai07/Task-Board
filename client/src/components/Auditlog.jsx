import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { server } from '../constant';

const AuditLog = () => {
  const [selectedProject, setSelectedProject] = useState('');
  const [userRole, setUserRole] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [cards, setCards] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const fetchUserRoleAndOrganization = async () => {
      try {
        const response = await axios.get(`${server}/api/role`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUserRole(response.data.role);
        setOrganizationId(response.data.organizationId);
        fetchProjects(response.data.organizationId);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    fetchUserRoleAndOrganization();
  }, []);

  const fetchProjects = async (organizationId) => {
    try {
      const projectsResponse = await axios.get(
        `${server}/api/projects/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProjects(projectsResponse.data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchTasksAndCards = async (projectId) => {
    try {
      const tasksResponse = await axios.get(
        `${server}/api/projects/${projectId}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTasks(tasksResponse.data.tasks);

      // Fetch cards for all tasks
      const cardsPromises = tasksResponse.data.tasks.map(task =>
        axios.get(`${server}/api/tasks/${task.id}/cards`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      );
      const cardsResponses = await Promise.all(cardsPromises);
      const allCards = cardsResponses.flatMap(response => response.data.cards);
      setCards(allCards);
    } catch (error) {
      console.error("Error fetching tasks and cards:", error);
    }
  };

  const fetchAuditLogs = async (projectId) => {
    try {
      const response = await axios.get(
        `${server}/api/projects/${projectId}/audit-logs`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAuditLogs(response.data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    if (projectId) {
      fetchTasksAndCards(projectId);
      fetchAuditLogs(projectId);
    } else {
      setTasks([]);
      setCards([]);
      setAuditLogs([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-4">
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        <select
          value={selectedProject}
          onChange={handleProjectChange}
          className="border border-gray-300 rounded-md p-2"
        >
          <option value="">Select a Project</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Column Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {projects.find(p => p._id === selectedProject)?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.entityType === 'Task' ? tasks.find(t => t.id === log.entityId)?.name || 'Unknown Task' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.entityType === 'Card' 
                      ? cards.find(c => c.id === log.entityId)?.name || 'Unknown Card' 
                      : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.performedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.actionDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.actionType}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLog;