import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button, Input } from '../components/ui';
import { api } from '../lib/api';
import type { ApiResponse, AuthTokens, User } from '@globe-trotter/shared';

// Define the login schema inline to avoid import issues
const userLoginSchema = {
  safeParse: (data: any) => {
    const errors: any[] = [];
    
    if (!data.email || typeof data.email !== 'string') {
      errors.push({ path: ['email'], message: 'Email is required' });
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.push({ path: ['email'], message: 'Invalid email format' });
    }
    
    if (!data.password || typeof data.password !== 'string') {
      errors.push({ path: ['password'], message: 'Password is required' });
    }
    
    return {
      success: errors.length === 0,
      error: errors.length > 0 ? { errors } : undefined
    };
  }
};

interface UserLogin {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserLogin>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<UserLogin>>({});

  const loginMutation = useMutation({
    mutationFn: async (data: UserLogin): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
      const response = await api.post('/users/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        // Store tokens
        localStorage.setItem('auth_token', data.data.tokens.accessToken);
        localStorage.setItem('refresh_token', data.data.tokens.refreshToken);
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Redirect to dashboard
        navigate('/dashboard');
      }
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      setErrors({ 
        email: error.response?.data?.message || 'Login failed. Please try again.' 
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof UserLogin]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = userLoginSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<UserLogin> = {};
      validation.error?.errors.forEach((error: any) => {
        const field = error.path[0] as keyof UserLogin;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to Globe Trotter
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
            />

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;