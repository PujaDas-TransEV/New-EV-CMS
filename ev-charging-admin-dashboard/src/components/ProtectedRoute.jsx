// src/components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/Authentication/AuthContext'; // 

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isRefreshing } = useAuth();

  console.log('🔒 ProtectedRoute Check:', { isAuthenticated, loading, isRefreshing });

  if (loading || isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">
          {isRefreshing ? 'Refreshing session...' : 'Loading...'}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔒 Not authenticated, redirecting to signin...');
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;