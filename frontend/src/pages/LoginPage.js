import React from "react";
import loginImage from "../assets/login-image.jpg"; 

const LoginPage = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/google`;
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-3/5 bg-gray-100 flex flex-col justify-center items-center p-8">
        {loginImage && (
          <img
            src={loginImage}
            alt="Invoice illustration"
            className="max-w-full h-auto mb-4"
          />
        )}
      </div>

      {/* Right side */}
      <div className="w-2/5 bg-white flex flex-col items-center justify-center p-8">
        <p className="text-gray-700 text-lg text-center pb-6">
          Welcome to our Invoice Management System!
        </p>
        <button
          onClick={handleGoogleLogin}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
