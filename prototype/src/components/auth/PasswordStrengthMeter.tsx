import React from 'react';
import { Check, X } from 'lucide-react';

export interface PasswordCriterion {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordStrengthMeterProps {
  password: string;
}

export function evaluatePassword(password: string): {
  score: number;
  criteria: PasswordCriterion[];
  label: string;
  color: string;
} {
  const criteria: PasswordCriterion[] = [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'uppercase', label: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { id: 'lowercase', label: 'At least one lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { id: 'number', label: 'At least one number (0-9)', met: /[0-9]/.test(password) },
    { id: 'special', label: 'At least one symbol (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(password) }
  ];

  const metCount = criteria.filter((c) => c.met).length;

  let score = 0;
  let label = 'Too weak';
  let color = '#94a3b8';

  if (password.length === 0) {
    score = 0;
    label = 'Enter password';
    color = '#cbd5e1';
  } else if (metCount <= 2) {
    score = 1;
    label = 'Weak';
    color = '#ef4444';
  } else if (metCount === 3) {
    score = 2;
    label = 'Fair';
    color = '#f59e0b';
  } else if (metCount === 4) {
    score = 3;
    label = 'Good';
    color = '#0284c7';
  } else {
    score = 4;
    label = 'Strong';
    color = '#10b981';
  }

  return { score, criteria, label, color };
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) {
    return null;
  }

  const { score, criteria, label, color } = evaluatePassword(password);

  return (
    <div className="auth-password-strength-container" aria-live="polite">
      <div className="auth-strength-header">
        <span className="auth-strength-title">Password Strength:</span>
        <span className="auth-strength-badge" style={{ color }}>{label}</span>
      </div>

      <div className="auth-strength-bars" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={4}>
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className="auth-strength-segment"
            style={{
              backgroundColor: step <= score ? color : '#e2e8f0'
            }}
          />
        ))}
      </div>

      <ul className="auth-strength-criteria-list">
        {criteria.map((item) => (
          <li
            key={item.id}
            className={`auth-criterion-item ${item.met ? 'is-met' : 'is-unmet'}`}
          >
            {item.met ? (
              <Check size={13} className="auth-criterion-icon met" />
            ) : (
              <X size={13} className="auth-criterion-icon unmet" />
            )}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
