import React from 'react';
import { FileText } from 'lucide-react';

const TermsConditions = () => {
  return (
    <div className="module-page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText size={28} color="var(--color-primary-dark)" />
          <div><h1>Terms & Conditions</h1><p className="page-subtitle">Rules and guidelines for using KAGABO Finance & Logistics</p></div>
        </div>
      </div>

      <div className="glass-card-light" style={{ padding: '40px', lineHeight: 1.8, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
        <p style={{ marginBottom: '8px', color: 'var(--color-text-primary)', fontWeight: 600 }}>Last Updated: August 2026</p>

        <h3 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>1. Acceptance of Terms</h3>
        <p>By accessing and using the KAGABO Finance & Logistics platform, you agree to be bound by these Terms and Conditions. If you do not agree, you must not use the platform.</p>

        <h3 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>2. User Accounts</h3>
        <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
          <li>You must provide accurate and complete information when registering.</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>The first registered user becomes the Owner and has full administrative privileges.</li>
          <li>Additional users require approval and role assignment by the Owner.</li>
        </ul>

        <h3 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>3. Roles and Permissions</h3>
        <p>The platform operates on a role-based access control system:</p>
        <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
          <li><strong>Owner:</strong> Full access to all features, user management, and system settings.</li>
          <li><strong>Manager:</strong> Access to inventory, purchases, suppliers, logistics, and operational management.</li>
          <li><strong>Accountant:</strong> Access to sales, customers, finance (income/expenses), and financial reporting.</li>
        </ul>

        <h3 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>4. Acceptable Use</h3>
        <p>You agree to use the platform only for lawful business purposes. You must not:</p>
        <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
          <li>Attempt to gain unauthorized access to other users' data or system resources.</li>
          <li>Upload malicious content or attempt to disrupt the platform's services.</li>
          <li>Use the platform for any fraudulent or illegal activity.</li>
          <li>Share your login credentials with unauthorized individuals.</li>
        </ul>

        <h3 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>5. Data Accuracy</h3>
        <p>Users are responsible for the accuracy of all data entered into the platform, including inventory records, financial transactions, and customer/supplier information. KAGABO Finance & Logistics is not liable for business decisions made based on inaccurate data entry.</p>

        <h3 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>6. Service Availability</h3>
        <p>We strive to maintain high availability of the platform but do not guarantee uninterrupted access. Scheduled maintenance and unforeseen technical issues may temporarily affect service availability.</p>

        <h3 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>7. Limitation of Liability</h3>
        <p>KAGABO Finance & Logistics is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from the use of the platform.</p>

        <h3 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>8. Modifications</h3>
        <p>We reserve the right to modify these Terms and Conditions at any time. Continued use of the platform after changes constitute acceptance of the updated terms.</p>

        <h3 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>9. Contact</h3>
        <p>For any questions regarding these Terms and Conditions, please contact the platform administrator through the Settings page.</p>
      </div>
    </div>
  );
};

export default TermsConditions;
