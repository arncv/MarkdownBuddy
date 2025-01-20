import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    email: null
  });

  const navigate = useNavigate();
  const storageKey = import.meta.env.VITE_AUTH_STORAGE_KEY || 'auth_token';
  const debug = import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true';

  useEffect(() => {
    const token = localStorage.getItem(storageKey);
    if (debug) {
      console.log('Auth: Checking stored token', { exists: !!token });
    }

    if (token) {
      try {
        api.get('/auth/me')
          .then(response => {
            if (debug) {
              console.log('Auth: Validated token', response.data);
            }
            setAuthState({
              isAuthenticated: true,
              userId: response.data.id,
              email: response.data.email
            });
          })
          .catch((error) => {
            if (debug) {
              console.error('Auth: Token validation failed', error);
            }
            localStorage.removeItem(storageKey);
          });
      } catch (error) {
        if (debug) {
          console.error('Auth: Error during token validation', error);
        }
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey, debug]);

  const login = async (email: string, password: string) => {
    try {
      if (debug) {
        console.log('Auth: Attempting login', { email });
      }

      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem(storageKey, token);
      
      if (debug) {
        console.log('Auth: Login successful', { userId: user.id });
      }

      setAuthState({
        isAuthenticated: true,
        userId: user.id,
        email: user.email
      });

      navigate('/documents');
    } catch (error) {
      if (debug) {
        console.error('Auth: Login failed', error);
      }
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    if (debug) {
      console.log('Auth: Logging out');
    }

    localStorage.removeItem(storageKey);
    setAuthState({
      isAuthenticated: false,
      userId: null,
      email: null
    });
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};