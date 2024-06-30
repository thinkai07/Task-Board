// layout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import useTokenValidation from "./UseTockenValidation";

const Layout = ({ children, user, onLogout }) => {
  useTokenValidation();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar user={user} onLogout={onLogout} />
        <div
          className="flex-1 p-4"
          style={{
            backgroundSize: "cover",
            backgroundPosition: "center center",
            overflow:"auto"
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;