import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { login, logout, fetchCurrentUser } from '../store/auth/authSlice';
import { LoginCredentials, User } from '../types/user.types';

interface UseAuthReturn {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    await dispatch(login(credentials));
  };

  const handleLogout = async (): Promise<void> => {
    await dispatch(logout());
  };

  const refreshUser = async (): Promise<void> => {
    await dispatch(fetchCurrentUser());
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    refreshUser,
  };
};

export default useAuth;