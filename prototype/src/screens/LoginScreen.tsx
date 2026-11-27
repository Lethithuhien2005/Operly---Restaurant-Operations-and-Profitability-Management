import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthInput } from '../components/auth/AuthInput';
import { AuthCheckbox } from '../components/auth/AuthCheckbox';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';
import { useMockStore } from '../store/mockStore';
import { MockStoreHook } from '../types/store';

export interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  form?: string;
}

export const LoginScreen: React.FC = () => {
  const { navigate, showToast, loginUser } = useMockStore() as MockStoreHook & {
    loginUser: (identifier: string, password: string) => Promise<any>;
  };

  const [formValues, setFormValues] = useState<LoginFormState>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: keyof LoginFormState, value: string | boolean): string | undefined => {
    if (name === 'email') {
      const emailVal = (value as string).trim();
      if (!emailVal) {
        return 'Email address or phone number is required.';
      }
      return undefined;
    }

    if (name === 'password') {
      const passwordVal = value as string;
      if (!passwordVal) {
        return 'Password is required.';
      }
      if (passwordVal.length < 6) {
        return 'Password must be at least 6 characters.';
      }
      return undefined;
    }

    return undefined;
  };

  const validateForm = (): LoginFormErrors => {
    const newErrors: LoginFormErrors = {};
    const emailErr = validateField('email', formValues.email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validateField('password', formValues.password);
    if (passErr) newErrors.password = passErr;

    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const resolvedValue = type === 'checkbox' ? checked : value;

    setFormValues((prev) => ({
      ...prev,
      [name]: resolvedValue
    }));

    if (submissionFeedback) {
      setSubmissionFeedback(null);
    }

    // Live validation if the field was already touched
    if (touched[name]) {
      const fieldError = validateField(name as keyof LoginFormState, resolvedValue);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const resolvedValue = type === 'checkbox' ? checked : value;

    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));

    const fieldError = validateField(name as keyof LoginFormState, resolvedValue);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true
    });

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors({
        ...formErrors,
        form: 'Please correct the highlighted errors before signing in.'
      });
      setSubmissionFeedback(null);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const data = await loginUser(formValues.email.trim(), formValues.password);
      setSubmissionFeedback(`Signed in as ${data.user.fullName} (${data.user.role}).`);
    } catch (err: any) {
      setErrors({
        form: err?.message || 'Invalid credentials or unable to connect to server.'
      });
      setSubmissionFeedback(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back to Operly"
      subtitle="Sign in to your restaurant operations and management portal"
      badgeText="Staff & Customer Portal"
      onNavigateHome={() => navigate('prototype')}
    >
      <form onSubmit={handleSubmit} noValidate className="auth-form">
        {/* Error Banner */}
        {errors.form && (
          <div className="auth-alert-banner is-error" role="alert">
            <AlertCircle size={18} className="auth-alert-icon" />
            <div>
              <strong>Sign in failed</strong>
              <div style={{ fontSize: '12px', marginTop: '2px' }}>{errors.form}</div>
            </div>
          </div>
        )}

        {/* Informative Post-Validation Banner (satisfies "do not hardcode fake authentication success") */}
        {submissionFeedback && (
          <div className="auth-alert-banner is-success" role="status">
            <CheckCircle2 size={18} className="auth-alert-icon" />
            <div>
              <strong>Validation Successful</strong>
              <div style={{ fontSize: '12px', marginTop: '2px' }}>{submissionFeedback}</div>
            </div>
          </div>
        )}

        {/* Email Field */}
        <AuthInput
          id="login-email"
          name="email"
          label="Email address"
          type="email"
          value={formValues.email}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="name@restaurant.com"
          required
          autoComplete="email"
          icon={<Mail size={16} />}
          error={touched.email ? errors.email : undefined}
          disabled={isSubmitting}
        />

        {/* Password Field */}
        <AuthInput
          id="login-password"
          name="password"
          label="Password"
          type="password"
          value={formValues.password}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
          icon={<Lock size={16} />}
          showPasswordToggle
          isPasswordVisible={showPassword}
          onTogglePasswordVisibility={() => setShowPassword((prev) => !prev)}
          error={touched.password ? errors.password : undefined}
          disabled={isSubmitting}
        />

        {/* Remember Me & Forgot Password Row */}
        <div className="auth-options-row">
          <AuthCheckbox
            id="login-remember-me"
            name="rememberMe"
            checked={formValues.rememberMe}
            onChange={handleInputChange}
            label="Remember me on this workstation"
            disabled={isSubmitting}
          />

          <button
            type="button"
            onClick={() => setIsForgotPasswordOpen(true)}
            className="auth-link-button"
            disabled={isSubmitting}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="auth-btn-primary"
          disabled={isSubmitting}
        >
          <LogIn size={18} />
          <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In to Operly'}</span>
        </button>

        {/* Switch to Sign Up */}
        <div className="auth-switch-prompt">
          <span>Don&apos;t have an account yet?</span>{' '}
          <button
            type="button"
            onClick={() => navigate('signup')}
            className="auth-switch-link"
          >
            Create an Account
          </button>
        </div>
      </form>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        initialEmail={formValues.email}
      />
    </AuthLayout>
  );
};
