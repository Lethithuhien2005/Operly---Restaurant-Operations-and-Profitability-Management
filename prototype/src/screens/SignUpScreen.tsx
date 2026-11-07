import React, { useState } from 'react';
import { User, Mail, Phone, Lock, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthInput } from '../components/auth/AuthInput';
import { AuthCheckbox } from '../components/auth/AuthCheckbox';
import { PasswordStrengthMeter, evaluatePassword } from '../components/auth/PasswordStrengthMeter';
import { TermsModal } from '../components/auth/TermsModal';
import { useMockStore } from '../store/mockStore';
import { MockStoreHook } from '../types/store';

export interface SignUpFormState {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface SignUpFormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  form?: string;
}

export const SignUpScreen: React.FC = () => {
  const { navigate, showToast } = useMockStore() as MockStoreHook;

  const [formValues, setFormValues] = useState<SignUpFormState>({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState<SignUpFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: keyof SignUpFormState, value: string | boolean): string | undefined => {
    switch (name) {
      case 'fullName': {
        const str = (value as string).trim();
        if (!str) return 'Full name is required.';
        if (str.length < 2) return 'Full name must be at least 2 characters.';
        return undefined;
      }

      case 'email': {
        const str = (value as string).trim();
        if (!str) return 'Email address is required.';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(str)) {
          return 'Please enter a valid email format (e.g. name@example.com).';
        }
        return undefined;
      }

      case 'phoneNumber': {
        const str = (value as string).trim();
        if (!str) return 'Phone number is required.';
        // Match standard Vietnamese & international phone patterns (9 to 15 digits)
        const digitsOnly = str.replace(/[\s\-.()]/g, '');
        const phoneRegex = /^\+?[0-9]{9,15}$/;
        if (!phoneRegex.test(digitsOnly)) {
          return 'Please enter a valid phone number (at least 9-11 digits).';
        }
        return undefined;
      }

      case 'password': {
        const str = value as string;
        if (!str) return 'Password is required.';
        if (str.length < 8) return 'Password must be at least 8 characters long.';
        const { score } = evaluatePassword(str);
        if (score < 2) {
          return 'Password is too weak. Please include letters, numbers, and symbols.';
        }
        return undefined;
      }

      case 'confirmPassword': {
        const str = value as string;
        if (!str) return 'Please confirm your password.';
        if (str !== formValues.password) {
          return 'Passwords do not match.';
        }
        return undefined;
      }

      case 'agreeToTerms': {
        const checked = Boolean(value);
        if (!checked) {
          return 'You must accept the Terms and Conditions to proceed.';
        }
        return undefined;
      }

      default:
        return undefined;
    }
  };

  const validateForm = (): SignUpFormErrors => {
    const newErrors: SignUpFormErrors = {};

    const fnErr = validateField('fullName', formValues.fullName);
    if (fnErr) newErrors.fullName = fnErr;

    const emailErr = validateField('email', formValues.email);
    if (emailErr) newErrors.email = emailErr;

    const phoneErr = validateField('phoneNumber', formValues.phoneNumber);
    if (phoneErr) newErrors.phoneNumber = phoneErr;

    const passErr = validateField('password', formValues.password);
    if (passErr) newErrors.password = passErr;

    const confErr = validateField('confirmPassword', formValues.confirmPassword);
    if (confErr) newErrors.confirmPassword = confErr;

    const termsErr = validateField('agreeToTerms', formValues.agreeToTerms);
    if (termsErr) newErrors.agreeToTerms = termsErr;

    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const resolvedValue = type === 'checkbox' ? checked : value;

    setFormValues((prev) => {
      const updated = { ...prev, [name]: resolvedValue };
      return updated;
    });

    if (submissionFeedback) {
      setSubmissionFeedback(null);
    }

    if (touched[name]) {
      const fieldError = validateField(name as keyof SignUpFormState, resolvedValue);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError
      }));
    }

    // Special case: if changing password, re-check confirmPassword if touched
    if (name === 'password' && touched.confirmPassword) {
      if (formValues.confirmPassword && formValues.confirmPassword !== value) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: 'Passwords do not match.'
        }));
      } else if (formValues.confirmPassword && formValues.confirmPassword === value) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: undefined
        }));
      }
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const resolvedValue = type === 'checkbox' ? checked : value;

    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));

    const fieldError = validateField(name as keyof SignUpFormState, resolvedValue);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      fullName: true,
      email: true,
      phoneNumber: true,
      password: true,
      confirmPassword: true,
      agreeToTerms: true
    });

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors({
        ...formErrors,
        form: 'Please review and resolve the highlighted errors below.'
      });
      setSubmissionFeedback(null);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Explicit technical constraint:
    // Do not connect to backend yet.
    // Do not hardcode fake authentication success.
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionFeedback(
        `Registration input validated for ${formValues.fullName} (${formValues.email}). Ready for backend registration pipeline (POST /api/v1/auth/register).`
      );
      showToast?.('Registration form validated successfully (pre-backend stage).');
    }, 450);
  };

  return (
    <AuthLayout
      title="Create your Operly Account"
      subtitle="Register for restaurant operations, dining rewards, or management access"
      badgeText="Staff & Customer Registration"
      onNavigateHome={() => navigate('prototype')}
    >
      <form onSubmit={handleSubmit} noValidate className="auth-form">
        {/* Error Banner */}
        {errors.form && (
          <div className="auth-alert-banner is-error" role="alert">
            <AlertCircle size={18} className="auth-alert-icon" />
            <div>
              <strong>Form validation incomplete</strong>
              <div style={{ fontSize: '12px', marginTop: '2px' }}>{errors.form}</div>
            </div>
          </div>
        )}

        {/* Informative Post-Validation Banner */}
        {submissionFeedback && (
          <div className="auth-alert-banner is-success" role="status">
            <CheckCircle2 size={18} className="auth-alert-icon" />
            <div>
              <strong>Account Data Validated</strong>
              <div style={{ fontSize: '12px', marginTop: '2px' }}>{submissionFeedback}</div>
            </div>
          </div>
        )}

        {/* Full Name Field */}
        <AuthInput
          id="signup-fullname"
          name="fullName"
          label="Full Name"
          type="text"
          value={formValues.fullName}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="e.g. Alex Nguyen"
          required
          autoComplete="name"
          icon={<User size={16} />}
          error={touched.fullName ? errors.fullName : undefined}
          disabled={isSubmitting}
        />

        {/* Email Field */}
        <AuthInput
          id="signup-email"
          name="email"
          label="Email Address"
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

        {/* Phone Number Field */}
        <AuthInput
          id="signup-phone"
          name="phoneNumber"
          label="Phone Number"
          type="tel"
          value={formValues.phoneNumber}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="0912 345 678 or +84912345678"
          required
          autoComplete="tel"
          icon={<Phone size={16} />}
          helperText="Used for table reservations and SMS OTP notifications"
          error={touched.phoneNumber ? errors.phoneNumber : undefined}
          disabled={isSubmitting}
        />

        {/* Password Field */}
        <AuthInput
          id="signup-password"
          name="password"
          label="Password"
          type="password"
          value={formValues.password}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="Create a strong password"
          required
          autoComplete="new-password"
          icon={<Lock size={16} />}
          showPasswordToggle
          isPasswordVisible={showPassword}
          onTogglePasswordVisibility={() => setShowPassword((prev) => !prev)}
          error={touched.password ? errors.password : undefined}
          disabled={isSubmitting}
        />

        {/* Password Strength Indicator */}
        <PasswordStrengthMeter password={formValues.password} />

        {/* Confirm Password Field */}
        <AuthInput
          id="signup-confirm-password"
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          value={formValues.confirmPassword}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="Re-enter your password"
          required
          autoComplete="new-password"
          icon={<Lock size={16} />}
          showPasswordToggle
          isPasswordVisible={showConfirmPassword}
          onTogglePasswordVisibility={() => setShowConfirmPassword((prev) => !prev)}
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
          disabled={isSubmitting}
        />

        {/* Terms and Conditions Checkbox */}
        <AuthCheckbox
          id="signup-terms"
          name="agreeToTerms"
          checked={formValues.agreeToTerms}
          onChange={handleInputChange}
          required
          disabled={isSubmitting}
          label={
            <span>
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
                className="auth-inline-link"
              >
                Terms and Conditions
              </button>{' '}
              and Privacy Policy.
            </span>
          }
          error={touched.agreeToTerms ? errors.agreeToTerms : undefined}
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="auth-btn-primary"
          disabled={isSubmitting}
        >
          <UserPlus size={18} />
          <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
        </button>

        {/* Switch to Login */}
        <div className="auth-switch-prompt">
          <span>Already have an Operly account?</span>{' '}
          <button
            type="button"
            onClick={() => navigate('login')}
            className="auth-switch-link"
          >
            Sign In
          </button>
        </div>
      </form>

      {/* Terms and Conditions Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={() => {
          setFormValues((prev) => ({ ...prev, agreeToTerms: true }));
          setErrors((prev) => ({ ...prev, agreeToTerms: undefined }));
        }}
      />
    </AuthLayout>
  );
};
