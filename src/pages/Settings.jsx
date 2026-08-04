import React, { useState, useEffect } from 'react';
import { Save, Building2, DollarSign, FileText, Shield, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const SettingsPage = () => {
  const { userProfile } = useAuth();
  const isOwner = userProfile?.role === 'owner';

  const [businessName, setBusinessName] = useState('KAGABO Finance & Logistics');
  const [currency, setCurrency] = useState('RWF');
  const [taxRate, setTaxRate] = useState('18');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-');
  const [paymentTerms, setPaymentTerms] = useState('30');
  const [email, setEmail] = useState('info@kagabofinance.com');
  const [phone, setPhone] = useState('+250 788 000 000');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchSettings();
    if (isOwner) {
      fetchUsers();
    }
  }, [isOwner]);

  const fetchSettings = async () => {
    try {
      const snap = await getDoc(doc(db, 'settings', 'general'));
      if (snap.exists()) {
        const data = snap.data();
        if (data.businessName) setBusinessName(data.businessName);
        if (data.currency) setCurrency(data.currency);
        if (data.taxRate) setTaxRate(data.taxRate);
        if (data.invoicePrefix) setInvoicePrefix(data.invoicePrefix);
        if (data.paymentTerms) setPaymentTerms(data.paymentTerms);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const fetchedUsers = [];
      snapshot.forEach(doc => {
        fetchedUsers.push({ id: doc.id, ...doc.data() });
      });
      setUsersList(fetchedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
    setLoadingUsers(false);
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        status: newRole === 'pending' ? 'pending_approval' : 'approved'
      });
      fetchUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
    }
  };

  const handleSave = async () => {
    if (!isOwner) {
      alert("Only owners can modify settings.");
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), {
        businessName,
        currency,
        taxRate,
        invoicePrefix,
        paymentTerms,
        email,
        phone,
        updatedAt: serverTimestamp(),
        updatedBy: userProfile?.displayName || userProfile?.email || 'Owner'
      }, { merge: true });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings: ' + err.message);
    }
    setSaving(false);
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
            <div className="form-group"><label>Business Name</label><input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} id="setting-business-name" disabled={!isOwner} /></div>
            <div className="form-group"><label>Business Logo</label><div className="logo-upload-area"><img src="/icon.jpg" alt="Logo" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} /></div></div>
            <div className="form-group"><label>Contact Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} id="setting-email" disabled={!isOwner} /></div>
            <div className="form-group"><label>Phone Number</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} id="setting-phone" disabled={!isOwner} /></div>
          </div>
        </div>

        {/* Financial */}
        <div className="glass-card-light settings-section">
          <div className="settings-section-header"><DollarSign size={20} /><h3>Financial Settings</h3></div>
          <div className="settings-form">
            <div className="form-group"><label>Currency</label><select value={currency} onChange={e => setCurrency(e.target.value)} id="setting-currency" disabled={!isOwner}><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="RWF">RWF (FRw)</option><option value="GBP">GBP (£)</option></select></div>
            <div className="form-group"><label>Tax Rate (%)</label><input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} id="setting-tax" disabled={!isOwner} /></div>
          </div>
        </div>

        {/* Invoice */}
        <div className="glass-card-light settings-section">
          <div className="settings-section-header"><FileText size={20} /><h3>Invoice Settings</h3></div>
          <div className="settings-form">
            <div className="form-group"><label>Invoice Prefix</label><input type="text" value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} id="setting-invoice-prefix" disabled={!isOwner} /></div>
            <div className="form-group"><label>Default Payment Terms (Days)</label><input type="number" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} id="setting-payment-terms" disabled={!isOwner} /></div>
          </div>
        </div>

        {/* Security */}
        <div className="glass-card-light settings-section">
          <div className="settings-section-header"><Shield size={20} /><h3>Security & Access</h3></div>
          <div className="settings-form">
            <div className="form-group"><label>Session Timeout</label><select defaultValue="30" id="setting-timeout"><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">1 hour</option><option value="120">2 hours</option></select></div>
          </div>
        </div>

        {/* Team Management (Owner Only) */}
        {isOwner && (
          <div className="glass-card-light settings-section" style={{ gridColumn: '1 / -1' }}>
            <div className="settings-section-header"><Users size={20} /><h3>Team Management</h3></div>
            <p className="page-subtitle" style={{ marginBottom: '16px' }}>Manage user roles and permissions. You can make other users owners here.</p>
            
            {loadingUsers ? (
              <div className="loading-spinner-small"></div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {usersList.map(u => (
                    <tr key={u.id}>
                      <td>{u.displayName}</td>
                      <td>{u.email}</td>
                      <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                      <td><span className={`badge ${u.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>{u.status.replace('_', ' ')}</span></td>
                      <td>
                        <select 
                          value={u.role} 
                          onChange={(e) => updateUserRole(u.id, e.target.value)}
                          style={{ width: 'auto', padding: '6px 10px' }}
                        >
                          <option value="owner">Owner</option>
                          <option value="admin">Admin</option>
                          <option value="user">User</option>
                          <option value="pending">Pending</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && <tr><td colSpan="5">No users found.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
