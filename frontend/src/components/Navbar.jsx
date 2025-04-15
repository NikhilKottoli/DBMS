import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DatabaseIcon } from "lucide-react";

export default function Navbar() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem('customerId');
    setLoading(true);
    window.location.href = '/signin';
  };

  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    const userId = localStorage.getItem('customerId');
    if (!userId) {
      navigate('/signin');
      return;
    }
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/user/getUser/${userId}`);
        const data = await response.json();
        console.log(data);
        if (data.data.user.role_type === "admin") {
          setAdmin(true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 w-full">
      <div className="flex justify-between items-center px-8 py-4 w-full">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <DatabaseIcon className="w-10 h-10 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">StreamQuery</h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-12">
          <Link
            to="/dashboard"
            className="px-6 py-2 rounded-lg text-gray-700 font-medium transition duration-300 hover:bg-blue-500 hover:text-white"
          >
            Home
          </Link>
          <Link
            to="/profile"
            className="px-6 py-2 rounded-lg text-gray-700 font-medium transition duration-300 hover:bg-blue-500 hover:text-white"
          >
            Profile
          </Link>
          <Link
            to="/accounts"
            className="px-6 py-2 rounded-lg text-gray-700 font-medium transition duration-300 hover:bg-blue-500 hover:text-white"
          >
            Open Account
          </Link>
          <Link
            to="/about"
            className="px-6 py-2 rounded-lg text-gray-700 font-medium transition duration-300 hover:bg-blue-500 hover:text-white"
          >
            About Us
          </Link>

          <Link
            to="/traffic"
            className="px-6 py-2 rounded-lg text-gray-700 font-medium transition bg-blue-500 duration-300 hover:bg-blue-500 hover:text-white"
          >
            Simulate
          </Link>

          <Link
            to="/loan_approve"
            className={`px-6 py-2 rounded-lg text-gray-700 font-medium transition bg-grau-500 duration-300 hover:bg-blue-500 hover:text-white ${admin ? "" : "hidden"}`}
          >
            Approve Loans
          </Link>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-red-500 text-white font-medium transition duration-300 hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>

          
        </div>
      </div>
    </nav>
  );
}
