import React from 'react';

const Inventory = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2>Inventory Management</h2>
        <button className="btn btn-primary">+ Add Product</button>
      </div>
      
      <div className="glass-card-light" style={{ padding: '24px' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Inventory list will be populated here.</p>
      </div>
    </div>
  );
};

export default Inventory;
