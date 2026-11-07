import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = ''
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
      setError(null);
      setSubmitted(false);
      setIsSubmitting(false);
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      setError('Please provide a valid email format (e.g. name@example.com).');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    // Simulate validation verification without fake backend calls
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 400);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="forgot-password-title">
      <div className="modal-card auth-modal-card">
        <div className="auth-modal-header">
          <div className="auth-modal-title-wrap">
            <div className="auth-modal-icon-badge">
              <Mail size={20} />
            </div>
            <div>
              <h2 id="forgot-password-title" className="auth-modal-title">Reset your password</h2>
              <p className="auth-modal-subtitle">
                Enter your registered email and we will send password reset instructions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="auth-modal-close-btn"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="auth-modal-body">
          {submitted ? (
            <div className="auth-modal-success-state">
              <div className="auth-success-badge">
                <CheckCircle2 size={36} color="#0f766e" />
              </div>
              <h3 className="auth-success-title">Instructions Dispatched</h3>
              <p className="auth-success-desc">
                If an Operly account exists for <strong>{email}</strong>, you will receive an email containing a link to reset your credentials shortly.
              </p>
              <div className="auth-modal-note">
                <span className="auth-note-tag">Note</span>
                <span>In this prototype phase, no actual email was transmitted. In production, this will trigger the auth recovery webhook.</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="auth-btn-primary"
                style={{ width: '100%', marginTop: '16px' }}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="auth-alert-banner is-error" role="alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-field-group">
                <label htmlFor="reset-email" className="auth-label">
                  Work / Personal Email
                  <span className="auth-required-star">*</span>
                </label>
                <div className={`auth-input-wrapper ${error ? 'has-error' : ''}`}>
                  <span className="auth-input-prefix-icon" aria-hidden="true">
                    <Mail size={16} />
                  </span>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="manager@restaurant.com"
                    className="auth-input-element"
                    autoFocus
                  />
                </div>
              </div>

              <div className="auth-modal-actions">
                <button
                  type="button"
                  onClick={onClose}
                  className="auth-btn-secondary"
                  disabled={isSubmitting}
                >
                  <ArrowLeft size={16} />
                  <span>Cancel</span>
                </button>

                <button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Verifying...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
