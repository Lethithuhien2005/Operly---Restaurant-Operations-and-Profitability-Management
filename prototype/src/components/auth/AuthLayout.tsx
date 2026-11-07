import React from 'react';
import { ArrowLeft, Sparkles, CheckCircle2, Shield, Utensils, Zap } from 'lucide-react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  badgeText?: string;
  onNavigateHome?: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  badgeText = 'Operly Cloud v1.0',
  onNavigateHome
}) => {
  return (
    <div className="auth-viewport-wrapper">
      {/* Top utility bar to return to Prototype */}
      <div className="auth-top-nav">
        <button
          type="button"
          onClick={onNavigateHome}
          className="auth-back-link"
          title="Return to Interactive Prototype Evaluation"
        >
          <ArrowLeft size={16} />
          <span>Back to Operations Prototype</span>
        </button>

        <div className="auth-nav-meta">
          <span className="auth-live-indicator" />
          <span>Real-time System Online</span>
        </div>
      </div>

      <div className="auth-container">
        {/* Left Side: Brand Showcase Panel (Desktop & Tablet) */}
        <aside className="auth-branding-panel">
          <div className="auth-brand-content">
            <div className="auth-brand-badge-pill">
              <span className="auth-brand-emoji">🍽️</span>
              <span className="auth-brand-text">OPERLY</span>
              <span className="auth-badge-tag">{badgeText}</span>
            </div>

            <h1 className="auth-hero-headline">
              Restaurant Operations & Profitability Management
            </h1>

            <p className="auth-hero-subtext">
              The unified operational platform synchronizing front-of-house, kitchen display queues, automated inventory, and AI forecasting in real time.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon-box">
                  <Zap size={16} />
                </div>
                <div>
                  <div className="auth-feature-heading">Sub-second Realtime Sync</div>
                  <div className="auth-feature-desc">Instant dispatch between QR orders, KDS tickets, and POS terminals.</div>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon-box">
                  <Sparkles size={16} />
                </div>
                <div>
                  <div className="auth-feature-heading">AI Margin & Demand Engine</div>
                  <div className="auth-feature-desc">Dynamic menu pair recommendations and accurate foot-traffic forecasting.</div>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon-box">
                  <Shield size={16} />
                </div>
                <div>
                  <div className="auth-feature-heading">Enterprise RBAC & Auditing</div>
                  <div className="auth-feature-desc">Granular roles for Waiters, Chefs, Cashiers, Managers, and Admins.</div>
                </div>
              </div>
            </div>

            <div className="auth-brand-footer">
              <div className="auth-metric-pill">
                <strong>6 Core Roles</strong>
                <span>Unified in 1 System</span>
              </div>
              <div className="auth-metric-pill">
                <strong>0% Paper Drift</strong>
                <span>End-to-end Digital</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Side: Form Content Card */}
        <div className="auth-card-panel">
          <div className="auth-mobile-brand-header">
            <div className="auth-brand-tag-mini">
              <span style={{ fontSize: '18px' }}>🍽️</span>
              <span style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>OPERLY</span>
              <span className="proto-badge" style={{ fontSize: '9px' }}>v1.0</span>
            </div>
          </div>

          <div className="auth-card-header">
            <h2 className="auth-page-title">{title}</h2>
            <p className="auth-page-subtitle">{subtitle}</p>
          </div>

          <div className="auth-form-wrapper">
            {children}
          </div>

          <div className="auth-security-footnote">
            <Shield size={13} style={{ color: '#0f766e' }} />
            <span>Secured with 256-bit TLS encryption & RBAC access controls.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
