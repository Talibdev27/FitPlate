import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useStaffAuthStore } from '../../store/staffAuthStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const StaffLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useStaffAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authApi.staffLogin(data);

      if (response.success && response.data) {
        // Set auth state and navigate to admin dashboard
        setAuth(
          response.data.staff,
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
        
        // Verify token was stored (development only)
        if (import.meta.env.DEV) {
          const storedToken = localStorage.getItem('staffAccessToken');
          console.log('[Login Debug] Token stored:', !!storedToken);
          console.log('[Login Debug] Token preview:', storedToken ? `${storedToken.substring(0, 30)}...` : 'none');
          console.log('[Login Debug] Staff role:', response.data.staff.role);
        }
        
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      // Handle connection errors
      if (!err.response) {
        if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || err.message?.includes('Failed to fetch')) {
          setError('Unable to connect to the server. Please check your internet connection and ensure the backend is running.');
        } else {
          setError('Network error occurred. Please try again.');
        }
      } else if (err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.staffLogin', 'Staff Login')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.staffLoginSubtitle', 'Sign in to access the admin panel')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.email', 'Email')}
              </label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.password', 'Password')}
              </label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? t('common.loading', 'Loading...') : t('auth.login', 'Login')}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              <a href="/" className="font-medium text-primary-600 hover:text-primary-500">
                {t('auth.backToHome', 'Back to Home')}
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

