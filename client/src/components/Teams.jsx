//teams.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TiGroup } from "react-icons/ti";
import { SiAzuredevops } from "react-icons/si";
import { FcSearch } from "react-icons/fc";
import { server } from '../constant';
import { useParams } from 'react-router-dom';

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [projects, setProjects] = useState([]);
    const [user, setUser] = useState({});
    const { projectId } = useParams();

    useEffect(() => {
        const fetchUserRoleAndOrganization = async () => {
            try {
                const response = await axios.get(`${server}/api/role`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setUser({ role: response.data.role, email: response.data.email });
                fetchProjects(response.data.organizationId);
               
            } catch (error) {
                console.error("Error fetching user role:", error);
            }
        };
        fetchUserRoleAndOrganization();
    }, []);

    const fetchProjects = async (organizationId) => {
        try {
            const response = await axios.get(`${server}/api/projects/${organizationId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setProjects(response.data.projects);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, [projects]);

    useEffect(() => {
        if (selectedTeam) {
            fetchTeamMembers(selectedTeam);
        } else {
            fetchAllMembers();
        }
    }, [selectedTeam]);

    const fetchTeams = async () => {
        try {
            const response = await axios.get(`${server}/api/projects/${projectId}/teams`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setTeams(response.data.teams);
        } catch (error) {
            console.error("Error fetching teams:", error);
        }
    };

    const fetchAllMembers = async () => {
        try {
            const response = await axios.get(`${server}/api/projects/${projectId}/teams/users`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setAllMembers(response.data.users);
        } catch (error) {
            console.error("Error fetching all members:", error);
        }
    };

    const fetchTeamMembers = async (teamName) => {
        try {
            const response = await axios.get(`${server}/api/projects/${projectId}/teams/${teamName}/users`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setTeamMembers(response.data.users);
        } catch (error) {
            console.error("Error fetching team members:", error);
        }
    };
    const deleteUser = async (teamName, email) => {
        try {
          await axios.delete(`${server}/api/projects/${projectId}/teams/${teamName}/users`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            data: { email },
          });
          
          // Update state to reflect the changes in the UI
          setTeamMembers(prevTeamMembers => prevTeamMembers.filter(member => member.email !== email));
          setAllMembers(prevAllMembers => prevAllMembers.filter(member => member.email !== email || member.team !== teamName));
          
          setSuccessMessage(`User ${email} successfully deleted from ${teamName}.`);
          setShowConfirmation(false);
          setUserToDelete(null);
          
          // Dismiss the success message after 3 seconds
          setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
        } catch (error) {
          console.error("Error deleting user:", error);
          // Handle error (e.g., show error message to user)
        }
      };
    const handleDeleteClick = (teamName, email) => {
        setShowConfirmation(true);
        setUserToDelete({ teamName, email });
    };

    const handleConfirmDelete = () => {
        if (userToDelete) {
            deleteUser(userToDelete.teamName, userToDelete.email);
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmation(false);
        setUserToDelete(null);
    };

    const handleClick = (teamName) => {
        setSelectedTeam(selectedTeam === teamName ? null : teamName);
    };

    const getTeamIcon = (teamName) => {
        switch (teamName) {
            case "Development":
                return <TiGroup />;
            case "DevOps":
                return <SiAzuredevops />;
            case "Testing":
                return <FcSearch />;
            default:
                return null;
        }
    };
// Function to get the user object from local storage
const getUserFromLocalStorage = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };
  
  // Inside your component
  const userFromLocalStorage = getUserFromLocalStorage();
  const emailFromLocalStorage = userFromLocalStorage ? userFromLocalStorage.email : null;
  const canShowActions = userFromLocalStorage && (userFromLocalStorage.role === 'ADMIN' || emailFromLocalStorage === projects.find(project => project._id === projectId)?.projectManager);


    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-start mb-8">Teams</h1>
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-4 flex justify-center">
                        <p>{successMessage}</p>
                    </div>
                )}
                <div className="flex flex-wrap gap-6">
                    {teams.map((team, index) => (
                        <div
                            key={index}
                            className={`bg-white relative shadow-xl p-8 m-4 w-72 cursor-pointer ${selectedTeam === team.name ? 'rounded-bl-3xl rounded-tr-3xl border-t-4 border-green-400' : 'border rounded-xl flex'}`}
                            onClick={() => handleClick(team.name)}
                        >
                            <div className="absolute bottom-2 left-8 size-6 text-2xl">
                                {getTeamIcon(team.name)}
                            </div>
                            <h2 className="text-xl font-semibold mb-6 pl-2 cursor-pointer">
                                {team.name}
                            </h2>
                            {selectedTeam === team.name && (
                                <div className="absolute bottom-2 right-2 bg-green-500 rounded-full h-4 w-4"></div>
                            )}
                        </div>
                    ))}
                </div>

                {!selectedTeam && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">All Members</h2>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                      {canShowActions && (
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                 )}
                      </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {allMembers.map((member, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{member.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{member.team}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                        {canShowActions && (
          <td className="px-6 py-4 whitespace-nowrap">
            <button
              className="text-red-600 hover:text-red-900"
              onClick={() => handleDeleteClick(member.team, member.email)}
            >
              Delete
            </button>
          </td>
        )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedTeam && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">{selectedTeam} Members</h2>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {teamMembers.map((member, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{member.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {(user.role === 'ADMIN' || user.email === projects.find(project => project._id === projectId)?.projectManager) && (
                                                <button
                                                    className="text-red-600 hover:text-red-900"
                                                    onClick={() => handleDeleteClick(selectedTeam, member.email)}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {showConfirmation && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
                        <div className="bg-white p-8 rounded-md shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
                            <p>Are you sure  want to delete this user?</p>
                            <div className="mt-6 flex justify-end space-x-4">
                                <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={handleCancelDelete}>Cancel</button>
                                <button className="px-4 py-2 bg-red-600 text-white rounded-md" onClick={handleConfirmDelete}>Confirm</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Teams;





