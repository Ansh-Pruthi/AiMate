import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../ui/Spinner';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show spinner while checking auth state on mount
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#212121]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};