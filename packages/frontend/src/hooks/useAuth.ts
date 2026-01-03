import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { User, ApiResponse } from '@globe-trotter/shared';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to parse user data:', error);
        logout();
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Query to validate token and get fresh user data
  const { data: userData, isLoading: isValidating } = useQuery({
    queryKey: ['auth', 'validate'],
    queryFn: async (): Promise<ApiResponse<User>> => {
      const response = await api.get('/users/profile');
      return response.data;
    },
    enabled: authState.isAuthenticated && !authState.isLoading,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update user data when validation succeeds
  useEffect(() => {
    if (userData?.success && userData.data) {
      setAuthState(prev => ({
        ...prev,
        user: userData.data!,
      }));
      localStorage.setItem('user', JSON.stringify(userData.data));
    }
  }, [userData]);

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    queryClient.clear();
  };

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/users/logout');
    },
    onSettled: () => {
      logout();
    },
  });

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading || isValidating,
    logout: () => logoutMutation.mutate(),
  };
};