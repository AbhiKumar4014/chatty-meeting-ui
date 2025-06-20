
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('meetingAssistantToken');
    const storedUser = localStorage.getItem('meetingAssistantUser');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual API endpoint
      const response = await mockApiCall('/auth/login', {
        email,
        password
      });

      const { token: authToken, user: userData } = response;
      
      setToken(authToken);
      setUser(userData);
      
      localStorage.setItem('meetingAssistantToken', authToken);
      localStorage.setItem('meetingAssistantUser', JSON.stringify(userData));
    } catch (error) {
      throw new Error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual API endpoint
      const response = await mockApiCall('/auth/register', {
        name,
        email,
        password
      });

      const { token: authToken, user: userData } = response;
      
      setToken(authToken);
      setUser(userData);
      
      localStorage.setItem('meetingAssistantToken', authToken);
      localStorage.setItem('meetingAssistantUser', JSON.stringify(userData));
    } catch (error) {
      throw new Error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('meetingAssistantToken');
    localStorage.removeItem('meetingAssistantUser');
  };

  const value = {
    token,
    user,
    login,
    register,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Mock API function - replace with actual API calls
const mockApiCall = async (endpoint: string, data: any) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  
  if (endpoint === '/auth/login') {
    return {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: '1',
        email: data.email,
        name: 'User Name'
      }
    };
  }
  
  if (endpoint === '/auth/register') {
    return {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: '1',
        email: data.email,
        name: data.name
      }
    };
  }
  
  throw new Error('Endpoint not found');
};
