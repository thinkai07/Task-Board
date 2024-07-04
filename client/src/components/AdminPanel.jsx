//adminpannel.jsx
import axios from "axios";
import React, { useState, useEffect } from "react";
import { server } from "../constant";
import { AiOutlineCheckCircle } from "react-icons/ai";
import useTokenValidation from "./UseTockenValidation";

const AdminPanel = () => {
  useTokenValidation();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${server}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data.users);
      setFilteredData(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchUserRole = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${server}/api/role`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserRole(response.data.role);
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUserRole();
  }, []);



  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleAddUser = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError(null);

    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (data.some((user) => user.email === email.trim())) {
      setError("Email is already registered.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${server}/api/addUser`,
        {
          name,
          email: email.trim(),
          role,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setData([...data, response.data.user]);
      setFilteredData([...data, response.data.user]);
      setName("");
      setEmail("");
      setRole("user");
      setIsModalOpen(false);
      setSuccessMessage("User added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error adding user:", error);
      setError("Failed to add user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteUser = (userId) => {
    setUserIdToDelete(userId);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteUser = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${server}/api/deleteUser/${userIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = data.filter((user) => user._id !== userIdToDelete);
      setData(updatedData);
      setFilteredData(updatedData);
      setIsConfirmModalOpen(false);
      setUserIdToDelete(null);
      setSuccessMessage("User deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user. Please try again.");
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = data.filter(
      (user) =>
        user.name.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {successMessage && (
        <div className="flex justify-center items-center p-4 bg-green-100 w-96 text-green-800 rounded-2xl">
          <AiOutlineCheckCircle className="mr-2" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex justify-between p-4">
        {userRole === "ADMIN" && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-2xl"
            onClick={() => setIsModalOpen(true)}
          >
            Add User
          </button>
        )}
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={handleSearch}
          className="px-4 py-2 border border-gray-300 rounded-2xl"
        />
      </div>
      <table className="min-w-full divide-y bg-gray-200 divide-gray-1000">
        <thead>
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">Role</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">Status</th> {/* Add Status column */}
            {userRole === "ADMIN" && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black-400 uppercase tracking-wider">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td className="px-6 py-4 text-sm font-medium text-gray-600 whitespace-normal break-words max-w-xs">{item.name}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600 whitespace-normal break-words max-w-xs">{item.email}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">{item.role}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">{item.status}</td> {/* Display status */}
              {userRole === "ADMIN" && (
                <td className="px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">
                  <button className="px-4 py-2 bg-red-600 text-white rounded-2xl" onClick={() => confirmDeleteUser(item._id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Add User
                    </h3>
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => {
                          let inputValue = e.target.value;

                          // Trim leading spaces
                          if (inputValue.startsWith(" ")) {
                            inputValue = inputValue.trimStart();
                          }

                          // Allow spaces after the first character
                          const formattedName = inputValue
                            .replace(/^[^a-zA-Z0-9_]+/, "")
                            .replace(/[^a-zA-Z0-9_\s]/g, "");

                          setName(formattedName);
                        }}
                        className="mt-2 p-2 border border-gray-300 rounded-2xl w-full"
                      />

                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // Remove leading spaces and other invalid characters, keeping only valid email characters
                          const cleanedEmail = inputValue.replace(/^\s+/, '').replace(/[^a-zA-Z0-9@._-]/g, '');
                          setEmail(cleanedEmail);
                        }}
                        onBlur={() => {
                          if (email && !validateEmail(email)) {
                            setError("Please enter a valid email address.");
                          } else {
                            setError(null);
                          }
                        }}
                        className={`mt-2 p-2 border ${error ? "border-red-500" : "border-gray-300"
                          } rounded-2xl w-full`}
                      />

                      {error && (
                        <div className="text-red-500 mt-2">{error}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 justify-between py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-2xl border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleAddUser}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-2xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Confirm Delete
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure  want to delete this user?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-2xl border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteUser}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-2xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsConfirmModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;












