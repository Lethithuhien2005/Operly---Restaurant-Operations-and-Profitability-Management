import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface AuthCheckboxProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: React.ReactNode;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const AuthCheckbox: React.FC<AuthCheckboxProps> = ({
  id,
  name,
  checked,
  onChange,
  label,
  error,
  required = false,
  disabled = false
}) => {
  const hasError = Boolean(error);

  return (
    <div className="auth-checkbox-group">
      <label htmlFor={id} className={`auth-checkbox-label ${disabled ? 'is-disabled' : ''}`}>
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className="auth-checkbox-input"
        />
        <span className="auth-checkbox-custom" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none" className="auth-checkmark-icon">
            <path
              d="M3.5 8.5L6.5 11.5L12.5 4.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="auth-checkbox-text">{label}</span>
      </label>

      {hasError && (
        <div id={`${id}-error`} className="auth-field-error checkbox-error" role="alert">
          <AlertCircle size={14} className="auth-error-icon" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
