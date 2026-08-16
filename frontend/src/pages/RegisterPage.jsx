import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Shield, Building2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import Dropdown from '../components/ui/Dropdown';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

import { ROLES } from '../constants/roles';
import { validateName, validateEmail, validatePassword } from '../utils/validators';
import authService from '../services/authService';
import api from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await api.get('/depts');
        const deptOptions = response.data.data.map(dept => ({
          value: dept.id.toString(),
          label: dept.departmentName
        }));
        setDepartments(deptOptions);
      } catch (error) {
        console.error("Failed to fetch departments", error);
        // Fallback mock data if the backend is down
        const mockDepts = [
          { value: "1", label: "Engineering" },
          { value: "2", label: "Marketing" },
          { value: "3", label: "HR" },
          { value: "4", label: "IT" },
          { value: "5", label: "Operations" },
          { value: "6", label: "Finance" },
          { value: "7", label: "Procurement" }
        ];
        setDepartments(mockDepts);
        // toast.error("Could not load departments. Please refresh."); // Disabled toast for seamless mock experience
      } finally {
        setIsLoadingDepartments(false);
      }
    }
    fetchDepartments();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      departmentId: '',
    },
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setApiError('');

    try {
      const payload = {
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: data.role,
        departmentId: Number(data.departmentId),
      };

      const response = await authService.register(payload);

      authService.setTokens(
          response.accessToken,
          response.refreshToken
      );

      toast.success('Account created successfully! Please log in.', {
        duration: 4000,
        style: {
          background: '#F0FDF4',
          color: '#15803D',
          border: '1px solid #BBF7D0',
        },
      });

      navigate('/login');
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Registration failed. Please try again.';

      // Check for duplicate email
      if (
        message.toLowerCase().includes('email') &&
        (message.toLowerCase().includes('exist') || message.toLowerCase().includes('duplicate'))
      ) {
        setApiError('An account with this email already exists.');
      } else {
        setApiError(message);
      }

      toast.error( message, {
        style: {
          background: '#FEF2F2',
          color: '#B91C1C',
          border: '1px solid #FECACA',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join the enterprise procurement platform to get started."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* API-level error */}
        {apiError && (
          <Alert
            type="error"
            dismissible
            onDismiss={() => setApiError('')}
          >
            {apiError}
          </Alert>
        )}

        {/* Full Name */}
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          icon={User}
          required
          autoComplete="name"
          {...register('fullName', { validate: validateName })}
          error={errors.fullName?.message}
        />

        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          icon={Mail}
          required
          autoComplete="email"
          {...register('email', { validate: validateEmail })}
          error={errors.email?.message}
        />

        {/* Password */}
        <PasswordInput
          label="Password"
          placeholder="Create a strong password"
          icon={Lock}
          required
          showStrength
          watchValue={passwordValue}
          autoComplete="new-password"
          {...register('password', { validate: validatePassword })}
          error={errors.password?.message}
        />

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm Password"
          placeholder="Re-enter your password"
          icon={Lock}
          required
          autoComplete="new-password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === passwordValue || 'Passwords do not match',
          })}
          error={errors.confirmPassword?.message}
        />

        {/* Role & Department row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Dropdown
            label="Role"
            icon={Shield}
            required
            options={ROLES}
            placeholder="Select role"
            {...register('role', { required: 'Role is required' })}
            error={errors.role?.message}
          />

          <Dropdown
            label="Department"
            icon={Building2}
            required
            options={departments}
            placeholder={isLoadingDepartments ? "Loading..." : "Select department"}
            disabled={isLoadingDepartments || departments.length === 0}
            {...register('departmentId', {
              required: 'Department is required',
            })}
            error={errors.departmentId?.message}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          Create Account
        </Button>

        {/* Login link */}
        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
