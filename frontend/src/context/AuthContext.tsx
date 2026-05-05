import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { type IUser, type ILoginInput, type IRegisterInput } from '../types';
import * as authService from '../services/authService';
import { getToken, setToken, removeToken, isTokenExpired } from '../utils/token';

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: ILoginInput) => Promise<void>;
  register: (input: IRegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ─── Check existing token on mount ──────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();

      if (token && !isTokenExpired(token)) {
        // Token exists and is valid — try to refresh to get user data
        try {
          const newToken = await authService.refreshToken();
          setToken(newToken);
          // Decode user from token payload
          const payload = JSON.parse(atob(newToken.split('.')[1])) as {
            userId: string;
            email: string;
            role: 'user' | 'admin';
          };
          // We need the name — store it in localStorage on login
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser) as IUser);
          }
        } catch {
          removeToken();
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (input: ILoginInput): Promise<void> => {
    const { user, accessToken } = await authService.login(input);
    setToken(accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const register = async (input: IRegisterInput): Promise<void> => {
    const { user, accessToken } = await authService.register(input);
    setToken(accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      removeToken();
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Custom hook ──────────────────────────────────────────────
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};