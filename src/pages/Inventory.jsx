import React, { useState } from 'react';
import { Plus, Search, Filter, Package, Edit, Trash2 } from 'lucide-react';

const sampleProducts = [
  { id: 1, name: 'Widget Pro', category: 'Electronics', supplier: 'TechCo', buyPrice: 25.00, sellPrice: 45.00, qty: 120, minStock: 20, status: 'In Stock' },
  { id: 2, name: 'Cable Kit', category: 'Accessories', supplier: 'WireCorp', buyPrice: 8.50, sellPrice: 15.00, qty: 3, minStock: 10, status: 'Low Stock' },
  { id: 3, name: 'Power Bank 20K', category: 'Electronics', supplier: 'TechCo', buyPrice: 18.00, sellPrice: 35.00, qty: 0, minStock: 15, status: 'Out of Stock' },
  { id: 4, name: 'USB-C Hub', category: 'Accessories', supplier: 'ConnectPlus', buyPrice: 12.00, sellPrice: 28.00, qty: 85, minStock: 10, status: 'In Stock' },
  { id: 5, name: 'Wireless Mouse', category: 'Peripherals', supplier: 'InputTech', buyPrice: 6.00, sellPrice: 14.00, qty: 200, minStock: 25, status: 'In Stock' },
];

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = sampleProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const map = { 'In Stock': 'badge-success', 'Low Stock': 'badge-warning', 'Out of Stock': 'badge-danger' };
    return <span className={`badge ${map[status] || ''}`}>{status}</span>;
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Inventory</h1><p className="page-subtitle">Manage your products and stock levels</p></div>
        <button className="btn btn-primary" id="add-product-btn"><Plus size={18} /> Add Product</button>
      </div>

      <div className="module-toolbar">
        <div className="toolbar-search">
          <Search size={18} />
          <input type="text" placeholder="Search products…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} id="inventory-search" />
        </div>
        <button className="btn btn-secondary"><Filter size={16} /> Filter</button>
      </div>

      <div className="glass-card-light table-container">
        <table className="data-table" id="inventory-table">
          <thead>
            <tr>
              <th>Product</th><th>Category</th><th>Supplier</th><th>Buy Price</th><th>Sell Price</th><th>Quantity</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td className="cell-bold"><Package size={16} /> {p.name}</td>
                <td>{p.category}</td>
                <td>{p.supplier}</td>
                <td className="numeric">${p.buyPrice.toFixed(2)}</td>
                <td className="numeric">${p.sellPrice.toFixed(2)}</td>
                <td className="numeric">{p.qty}</td>
                <td>{getStatusBadge(p.status)}</td>
                <td className="cell-actions">
                  <button className="icon-btn" aria-label="Edit"><Edit size={16} /></button>
                  <button className="icon-btn danger" aria-label="Delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
