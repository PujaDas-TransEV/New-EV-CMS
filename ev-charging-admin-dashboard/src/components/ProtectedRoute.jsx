import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './Authentication/AuthContext';

/* ============================================================
   ProtectedRoute
   ============================================================
   The single reason a signed-in user used to get thrown back to
   the login page: routes rendered a redirect while the session
   was still being restored. This component renders nothing but a
   splash until the provider has finished bootstrapping.
   ============================================================ */

const Splash = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      <p className="text-sm text-slate-500">Restoring your session</p>
    </div>
  </div>
);

export const ProtectedRoute = ({ children }) => {
  const { isBootstrapping, isAuthenticated, mustChangePassword } = useAuth();
  const location = useLocation();

  if (isBootstrapping) return <Splash />;

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return children;
};

/* Wrap /signin and /forgot-password with this so a returning user
   with a live session never sees the login form again. */
export const PublicOnlyRoute = ({ children }) => {
  const { isBootstrapping, isAuthenticated, mustChangePassword } = useAuth();
  const location = useLocation();

  if (isBootstrapping) return <Splash />;

  if (isAuthenticated) {
    const target = mustChangePassword
      ? '/change-password'
      : location.state?.from?.pathname || '/dashboard';

    return <Navigate to={target} replace />;
  }

  return children;
};

export default ProtectedRoute;
