import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

export interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  onAccept
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="terms-modal-title">
      <div className="modal-card auth-modal-card auth-terms-card">
        <div className="auth-modal-header">
          <div className="auth-modal-title-wrap">
            <div className="auth-modal-icon-badge">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 id="terms-modal-title" className="auth-modal-title">Terms & Conditions</h2>
              <p className="auth-modal-subtitle">
                Operly Restaurant Operations & Management Platform
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="auth-modal-close-btn"
            aria-label="Close terms modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="auth-modal-body auth-terms-content">
          <section className="auth-terms-section">
            <h4>1. Acceptance of Terms</h4>
            <p>
              By accessing or creating an account on Operly (&quot;the Platform&quot;), you agree to comply with and be bound by these Terms and Conditions, our Privacy Policy, and relevant restaurant operational standards.
            </p>
          </section>

          <section className="auth-terms-section">
            <h4>2. Account Security & Role-Based Access</h4>
            <p>
              Users must maintain confidentiality of credentials. Access is governed by strict Role-Based Access Control (RBAC): Customer, Waiter, Chef, Cashier, Manager, and Admin. Unauthorized privilege escalation or credential sharing is strictly prohibited.
            </p>
          </section>

          <section className="auth-terms-section">
            <h4>3. Order Processing & Dining Reservations</h4>
            <p>
              QR code orders submitted via customer terminals create real-time kitchen tickets. Online reservations exceeding 1,000,000 VND require pre-order verification and a minimum 40% deposit according to branch policies.
            </p>
          </section>

          <section className="auth-terms-section">
            <h4>4. Data Privacy & Auditability</h4>
            <p>
              Financial adjustments, price overrides, voids, and refunds are permanently recorded in immutable audit logs. User phone numbers and personal data are encrypted and utilized exclusively for loyalty rewards and reservation fulfillment.
            </p>
          </section>

          <section className="auth-terms-section">
            <h4>5. Operational Reliability</h4>
            <p>
              Operly strives for 99.9% uptime across kitchen display systems (KDS), waiter tablets, and POS terminals to prevent service interruption during peak hours.
            </p>
          </section>
        </div>

        <div className="auth-modal-actions auth-terms-actions">
          <button
            type="button"
            onClick={onClose}
            className="auth-btn-secondary"
          >
            Close
          </button>
          {onAccept && (
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="auth-btn-primary"
            >
              I Understand & Agree
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
