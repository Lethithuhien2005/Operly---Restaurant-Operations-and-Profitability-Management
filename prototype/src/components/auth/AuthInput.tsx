import React from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface AuthInputProps {
  id: string;
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'password';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  icon?: React.ReactNode;
  helperText?: string;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onTogglePasswordVisibility?: () => void;
  disabled?: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  autoComplete,
  icon,
  helperText,
  showPasswordToggle = false,
  isPasswordVisible = false,
  onTogglePasswordVisibility,
  disabled = false
}) => {
  const resolvedType = showPasswordToggle
    ? isPasswordVisible
      ? 'text'
      : 'password'
    : type;

  const hasError = Boolean(error);

  return (
    <div className="auth-field-group">
      <div className="auth-label-row">
        <label htmlFor={id} className="auth-label">
          {label}
          {required && <span className="auth-required-star" aria-hidden="true">*</span>}
        </label>
      </div>

      <div className={`auth-input-wrapper ${hasError ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
        {icon && <span className="auth-input-prefix-icon" aria-hidden="true">{icon}</span>}

        <input
          id={id}
          name={name}
          type={resolvedType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className="auth-input-element"
        />

        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePasswordVisibility}
            className="auth-password-toggle-btn"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            title={isPasswordVisible ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {hasError ? (
        <div id={`${id}-error`} className="auth-field-error" role="alert">
          <AlertCircle size={14} className="auth-error-icon" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <div id={`${id}-helper`} className="auth-field-helper">
          {helperText}
        </div>
      ) : null}
    </div>
  );
};
