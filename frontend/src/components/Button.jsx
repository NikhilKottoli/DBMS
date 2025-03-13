import React from 'react';

const Button = ({ type = "button", children, onClick, isLoading }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-70"
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};

export default Button;