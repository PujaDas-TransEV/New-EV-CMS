// src/components/SignIn.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Background from "../assets/bg.jpg";

const SignIn = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        'https://be.cms.ocpp.transev.site/admin/login/userlogin',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apiauthkey:
              'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
          },
          body: JSON.stringify({ phone, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const { authtoken } = data;
        localStorage.setItem('token', authtoken);
        const decodedToken = jwtDecode(authtoken);
        const userId = decodedToken.userid;
        navigate(`/dashboard/${userId}`);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${Background})` }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Login box */}
      <div className="relative z-10 bg-black/60 backdrop-blur-md p-10 rounded-3xl shadow-2xl max-w-md w-full border border-gray-700">
        <h1 className="text-4xl font-bold text-white mb-6 text-center tracking-wide">
          Sign In
        </h1>
        <form onSubmit={handleSignIn} className="space-y-5">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
              Phone Number
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="mt-2 w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-2 w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition duration-150"
          >
            Sign In
          </button>
        </form>

        <p className="text-gray-400 text-sm mt-5 text-center">
          Don't have an account?{' '}
          <span
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
