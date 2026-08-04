import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="module-page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={28} color="var(--color-primary-dark)" />
          <div><h1>Privacy Policy</h1><p className="page-subtitle">How KAGABO Finance & Logistics handles your data</p></div>
        </div>
      </div>

      <div className="glass-card-light" style={{ padding: '40px', lineHeight: 1.8, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
        <p style={{ marginBottom: '8px', color: 'var(--color-text-primary)', fontWeight: 600 }}>Last Updated: August 2026</p>

        <h3 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>1. Information We Collect</h3>
        <p>KAGABO Finance & Logistics ("we", "our", "the platform") collects the following types of information when you use our services:</p>
        <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
          <li><strong>Account Information:</strong> Your full name, email address, and role within the organization.</li>
          <li><strong>Business Data:</strong> Inventory records, sales transactions, purchase orders, financial records, customer and supplier information, and logistics data that you voluntarily enter into the platform.</li>
          <li><strong>Activity Logs:</strong> Timestamps and descriptions of actions performed within the platform for audit trail purposes.</li>
        </ul>

        <h3 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>2. How We Use Your Information</h3>
        <p>We use the information collected to:</p>
        <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
          <li>Provide, maintain, and improve the platform's functionality.</li>
          <li>Authenticate users and enforce role-based access control.</li>
          <li>Generate business reports and analytics dashboards.</li>
          <li>Maintain audit logs for security and accountability purposes.</li>
        </ul>

        <h3 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>3. Data Storage & Security</h3>
        <p>All data is stored securely using Google Firebase infrastructure, which provides encryption at rest and in transit. Access to data is restricted through Firestore Security Rules based on user roles (Owner, Manager, Accountant).</p>

        <h3 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>4. Data Sharing</h3>
        <p>We do not sell, trade, or otherwise transfer your business data to third parties. Data is only accessible to authenticated users within your organization based on their assigned roles.</p>

        <h3 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>5. Data Retention</h3>
        <p>Your data remains stored as long as your account is active. The Owner of the organization may request deletion of all data by contacting the platform administrator.</p>

        <h3 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>6. Your Rights</h3>
        <p>You have the right to access, correct, or request deletion of your personal information. Contact the Owner of your organization or the platform administrator to exercise these rights.</p>

        <h3 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>7. Contact</h3>
        <p>If you have questions about this Privacy Policy, please contact KAGABO Finance & Logistics through the platform's Settings page.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
