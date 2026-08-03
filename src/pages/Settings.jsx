import React, { useState } from 'react';
import { Save, Building2, DollarSign, FileText, Shield } from 'lucide-react';

const SettingsPage = () => {
  const [businessName, setBusinessName] = useState('KAGABO Finance & Logistics');
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState('18');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-');
  const [paymentTerms, setPaymentTerms] = useState('30');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Settings</h1><p className="page-subtitle">Configure your business and system preferences</p></div>
        <button className="btn btn-primary" onClick={handleSave} id="save-settings-btn"><Save size={18} /> {saved ? 'Saved!' : 'Save Changes'}</button>
      </div>

      <div className="settings-grid">
        {/* Business Info */}
        <div className="glass-card-light settings-section">
          <div className="settings-section-header"><Building2 size={20} /><h3>Business Information</h3></div>
          <div className="settings-form">
            <div className="form-group"><label>Business Name</label><input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} id="setting-business-name" /></div>
            <div className="form-group"><label>Business Logo</label><div className="logo-upload-area"><img src="/icon.jpg" alt="Logo" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} /><button className="btn btn-secondary" style={{ marginLeft: '16px' }}>Upload New Logo</button></div></div>
            <div className="form-group"><label>Contact Email</label><input type="email" defaultValue="info@kagabofinance.com" id="setting-email" /></div>
            <div className="form-group"><label>Phone Number</label><input type="tel" defaultValue="+250 788 000 000" id="setting-phone" /></div>
          </div>
        </div>

        {/* Financial */}
        <div className="glass-card-light settings-section">
          <div className="settings-section-header"><DollarSign size={20} /><h3>Financial Settings</h3></div>
          <div className="settings-form">
            <div className="form-group"><label>Currency</label><select value={currency} onChange={e => setCurrency(e.target.value)} id="setting-currency"><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="RWF">RWF (FRw)</option><option value="GBP">GBP (£)</option></select></div>
            <div className="form-group"><label>Tax Rate (%)</label><input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} id="setting-tax" /></div>
          </div>
        </div>

        {/* Invoice */}
        <div className="glass-card-light settings-section">
          <div className="settings-section-header"><FileText size={20} /><h3>Invoice Settings</h3></div>
          <div className="settings-form">
            <div className="form-group"><label>Invoice Prefix</label><input type="text" value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} id="setting-invoice-prefix" /></div>
            <div className="form-group"><label>Default Payment Terms (Days)</label><input type="number" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} id="setting-payment-terms" /></div>
          </div>
        </div>

        {/* Security */}
        <div className="glass-card-light settings-section">
          <div className="settings-section-header"><Shield size={20} /><h3>Security & Access</h3></div>
          <div className="settings-form">
            <div className="form-group"><label>Session Timeout</label><select defaultValue="30" id="setting-timeout"><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">1 hour</option><option value="120">2 hours</option></select></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
