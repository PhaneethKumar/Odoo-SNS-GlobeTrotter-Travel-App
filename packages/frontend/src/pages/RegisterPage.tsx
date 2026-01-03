import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button, Input } from '../components/ui';
import { api } from '../lib/api';
import type { ApiResponse, AuthTokens, User } from '@globe-trotter/shared';

// Define the registration schema inline to avoid import issues
const userRegistrationSchema = {
  safeParse: (data: any) => {
    const errors: any[] = [];
    
    if (!data.email || typeof data.email !== 'string') {
      errors.push({ path: ['email'], message: 'Email is required' });
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.push({ path: ['email'], message: 'Invalid email format' });
    }
    
    if (!data.password || typeof data.password !== 'string') {
      errors.push({ path: ['password'], message: 'Password is required' });
    } else if (data.password.length < 8) {
      errors.push({ path: ['password'], message: 'Password must be at least 8 characters' });
    }
    
    if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length === 0) {
      errors.push({ path: ['firstName'], message: 'First name is required' });
    }
    
    if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim().length === 0) {
      errors.push({ path: ['lastName'], message: 'Last name is required' });
    }
    
    return {
      success: errors.length === 0,
      error: errors.length > 0 ? { errors } : undefined
    };
  }
};

interface UserRegistration {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserRegistration>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Partial<UserRegistration>>({});

  const registerMutation = useMutation({
    mutationFn: async (data: UserRegistration): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
      const response = await api.post('/users/register', data);
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
      console.error('Registration failed:', error);
      setErrors({ 
        email: error.response?.data?.message || 'Registration failed. Please try again.' 
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof UserRegistration]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = userRegistrationSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<UserRegistration> = {};
      validation.error?.errors.forEach((error: any) => {
        const field = error.path[0] as keyof UserRegistration;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    registerMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your Globe Trotter account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                error={errors.firstName}
              />

              <Input
                label="Last name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                error={errors.lastName}
              />
            </div>

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
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;