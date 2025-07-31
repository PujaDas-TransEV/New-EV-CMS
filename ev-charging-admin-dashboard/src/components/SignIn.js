// src/components/SignIn.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; 

const SignIn = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://be.cms.ocpp.transev.site/admin/login/userlogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apiauthkey': 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru'
        },
        body: JSON.stringify({ phone, password })
      });

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
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full border border-gray-700">
        <h1 className="text-3xl font-bold text-blue-400 mb-8 text-center">Sign In</h1>
        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Phone</label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
