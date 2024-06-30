import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import useTokenValidation from "./UseTockenValidation";

const Navbar = ({ user, onLogout }) => {
  useTokenValidation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
        setShowLogoutConfirmation(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatDate = (date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const day = days[date.getDay()];
    const dayOfMonth = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // months are 0-indexed
    const year = date.getFullYear();
    return `${dayOfMonth}-${month}-${year}, ${day}`;
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true);
    setShowProfileDropdown(false); // Close profile dropdown when logout confirmation opens
  };

  const confirmLogout = () => {
    onLogout();
    setShowLogoutConfirmation(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowLogoutConfirmation(false); // Close logout confirmation when profile dropdown opens
  };

  // Function to get the first letter of the username
  const getFirstLetter = () => {
    return user?.email ? user.email.charAt(0).toUpperCase() : '';
  };
  return (
    <div className="flex items-center justify-between bg-white p-4 sticky top-0 z-10">
      <div className="flex items-center">
        <div className="ml-3">
          <h1 className="font-bold text-2xl">HI! {user?.username}</h1>
          <h3 className="font-bold text-xl">
            <span className="text-gray-500">{formatDate(currentTime)}</span>
          </h3>
        </div>
      </div>

      <div className="flex items-center flex-grow justify-center space-x-20">
        <div className="relative w-full max-w-xs">
          {/* <input
            type="text"
            className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
            placeholder="Search..."
          /> */}
          {/* <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> */}
        </div>
        {/* <button className="bg-blue-500 text-white px-10 py-2 rounded-full">
          Export statistics
        </button> */}
      </div>

      <div
        className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full font-bold text-xl cursor-pointer"
        onClick={toggleProfileDropdown}
      >
        {getFirstLetter()}
      </div>
      {showProfileDropdown && (
        <div ref={profileDropdownRef} className="ml-2 absolute top-20 right-4">
          <div className="w-60 bg-white border border-gray-300 rounded-2xl shadow-xl">
            <div className="px-4 py-2 text-sm text-gray-700">{user?.email}</div>
            <div className="px-4 py-2 text-sm text-gray-700">
              {user?.username}
            </div>
            <div className="border-t border-gray-300"></div>
            <button
              onClick={handleLogoutClick}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-2xl"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {showLogoutConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white border border-gray-300 rounded-2xl shadow-lg p-4">
            <p className="mb-4">Are you sure want to logout?</p>
            <div className="flex justify-between">
              <button
                onClick={confirmLogout}
                className="bg-red-500 text-white px-8 py-2 rounded-3xl hover:bg-red-600 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={cancelLogout}
                className="bg-gray-500 text-white px-8 py-2 rounded-3xl hover:bg-gray-600 transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;