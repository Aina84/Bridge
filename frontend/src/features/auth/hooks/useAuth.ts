import { useAuthStore } from '../store/auth.store';

export const useAuth = () => {
  const { user, isAuthenticated, accessToken, setAuth, logout, updateUser } = useAuthStore();
  return { user, isAuthenticated, accessToken, setAuth, logout, updateUser };
};
