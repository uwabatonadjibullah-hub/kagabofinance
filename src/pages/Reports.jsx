import React, { useState } from 'react';
import { FileText, FileSpreadsheet, Download, Package, ShoppingCart, DollarSign, ShoppingBag } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports = () => {
  const { data: sales } = useCollection('sales');
  const { data: purchases } = useCollection('purchases');
  const { data: products } = useCollection('products');
  const { data: income } = useCollection('income');
  const { data: expenses } = useCollection('expenses');

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filterByDate = (data) => {
    return data.filter(d => {
      if (!d.date) return true;
      if (dateFrom && d.date < dateFrom) return false;
      if (dateTo && d.date > dateTo) return false;
      return true;
    });
  };

  // ---- PDF Generation ----
  const generatePDF = (title, headers, rows) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(14, 42, 44);
    doc.text('KAGABO Finance & Logistics', 14, 20);
    doc.setFontSize(14);
    doc.text(title, 14, 30);
    doc.setFontSize(10);
    doc.setTextColor(91, 107, 108);
    const dateRange = dateFrom || dateTo
      ? `Period: ${dateFrom || 'Start'} to ${dateTo || 'Present'}`
      : `Generated: ${new Date().toLocaleDateString()}`;
    doc.text(dateRange, 14, 37);

    autoTable(doc, {
      startY: 44,
      head: [headers],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [14, 42, 44], textColor: [255, 255, 255], fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: [244, 241, 233] },
    });

    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // ---- Excel Generation ----
  const generateExcel = (title, headers, rows) => {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ---- Report Generators ----
  const exportSales = (format) => {
    const data = filterByDate(sales);
    const headers = ['Invoice #', 'Customer', 'Product', 'Type', 'Amount', 'Unit Price', 'Total', 'Paid', 'Balance', 'Method', 'Status', 'Date'];
    const rows = data.map(s => [
      s.id.substring(0, 8).toUpperCase(),
      s.customer || '',
      s.productName || '',
      s.sellType === 'quantity' ? 'Qty' : 'Item',
      s.amount ?? '',
      `$${(s.unitPrice || 0).toFixed(2)}`,
      `$${(s.total || 0).toFixed(2)}`,
      `$${(s.paid || 0).toFixed(2)}`,
      `$${(s.balance || 0).toFixed(2)}`,
      s.method || '',
      s.status || '',
      s.date || ''
    ]);
    const totalRow = ['', '', '', '', '', 'TOTALS', `$${data.reduce((s,r) => s + (r.total||0), 0).toFixed(2)}`, `$${data.reduce((s,r) => s + (r.paid||0), 0).toFixed(2)}`, `$${data.reduce((s,r) => s + (r.balance||0), 0).toFixed(2)}`, '', '', ''];
    rows.push(totalRow);
    format === 'pdf' ? generatePDF('Sales Report', headers, rows) : generateExcel('Sales Report', headers, rows);
  };

  const exportPurchases = (format) => {
    const data = filterByDate(purchases);
    const headers = ['PO #', 'Product', 'Supplier', 'Qty', 'IPQ', 'Total Items', 'Total Cost', 'Status', 'Date'];
    const rows = data.map(p => [
      p.id.substring(0, 8).toUpperCase(),
      p.productName || '',
      p.supplier || '',
      p.quantity ?? '',
      p.ipq ?? '',
      p.totalItems ?? '',
      `$${(p.total || 0).toFixed(2)}`,
      p.status || '',
      p.date || ''
    ]);
    const totalRow = ['', '', '', '', '', 'TOTAL', `$${data.reduce((s,r) => s + (r.total||0), 0).toFixed(2)}`, '', ''];
    rows.push(totalRow);
    format === 'pdf' ? generatePDF('Purchases Report', headers, rows) : generateExcel('Purchases Report', headers, rows);
  };

  const exportInventory = (format) => {
    const headers = ['Product', 'Category', 'Supplier', 'Buy Price', 'Sell/Qty', 'Sell/Item', 'Qty (boxes)', 'IPQ', 'Total Items', 'Status'];
    const rows = products.map(p => {
      const totalItems = p.totalItems ?? (p.qty * (p.ipq || 1));
      const qty = Math.floor(totalItems / (p.ipq || 1));
      let status = 'In Stock';
      if (totalItems <= 0) status = 'Out of Stock';
      else if (qty <= (p.minStock || 0)) status = 'Low Stock';
      return [
        p.name, p.category, p.supplier,
        `$${(p.buyPrice || 0).toFixed(2)}`,
        `$${(p.sellPriceQty || p.sellPrice || 0).toFixed(2)}`,
        `$${(p.sellPriceItem || 0).toFixed(2)}`,
        qty, p.ipq || 1, totalItems, status
      ];
    });
    format === 'pdf' ? generatePDF('Inventory Report', headers, rows) : generateExcel('Inventory Report', headers, rows);
  };

  const exportFinance = (format) => {
    const filteredIncome = filterByDate(income);
    const filteredExpenses = filterByDate(expenses);
    const headers = ['Type', 'Category', 'Description', 'Amount', 'Date'];
    const rows = [
      ...filteredIncome.map(i => ['Income', i.category || '', i.description || '', `$${(i.amount || 0).toFixed(2)}`, i.date || '']),
      ...filteredExpenses.map(e => ['Expense', e.category || '', e.description || '', `-$${(e.amount || 0).toFixed(2)}`, e.date || '']),
    ];
    const totalInc = filteredIncome.reduce((s,i) => s + (i.amount||0), 0);
    const totalExp = filteredExpenses.reduce((s,e) => s + (e.amount||0), 0);
    rows.push(['', '', 'Total Income', `$${totalInc.toFixed(2)}`, '']);
    rows.push(['', '', 'Total Expenses', `-$${totalExp.toFixed(2)}`, '']);
    rows.push(['', '', 'NET PROFIT', `$${(totalInc - totalExp).toFixed(2)}`, '']);
    format === 'pdf' ? generatePDF('Finance Report', headers, rows) : generateExcel('Finance Report', headers, rows);
  };

  const reportCards = [
    { title: 'Sales Report', description: 'All sales transactions with customer, product, and payment details.', icon: ShoppingCart, color: 'var(--color-success)', export: exportSales, count: sales.length },
    { title: 'Purchases Report', description: 'All purchase orders with supplier, product, and cost details.', icon: ShoppingBag, color: 'var(--color-info)', export: exportPurchases, count: purchases.length },
    { title: 'Inventory Report', description: 'Current stock levels, pricing, and product status snapshot.', icon: Package, color: 'var(--color-warning)', export: exportInventory, count: products.length },
    { title: 'Finance Report', description: 'Income vs expenses with category breakdown and net profit.', icon: DollarSign, color: 'var(--color-accent-lime)', export: exportFinance, count: income.length + expenses.length },
  ];

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Reports</h1><p className="page-subtitle">Generate and download PDF or Excel reports for your business data</p></div>
      </div>

      {/* Date Filter */}
      <div className="glass-card-light" style={{ padding: '20px 24px', marginBottom: '28px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: '14px' }}>Filter by date range:</span>
        <div className="form-group" style={{ margin: 0 }}>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: '160px' }} />
        </div>
        <span style={{ color: 'var(--color-text-secondary)' }}>to</span>
        <div className="form-group" style={{ margin: 0 }}>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: '160px' }} />
        </div>
        {(dateFrom || dateTo) && (
          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => { setDateFrom(''); setDateTo(''); }}>
            Clear Filter
          </button>
        )}
      </div>

      {/* Report Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {reportCards.map((report) => (
          <div key={report.title} className="glass-card-light" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${report.color}15`, color: report.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <report.icon size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '2px' }}>{report.title}</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{report.count} records</span>
              </div>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>{report.description}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ flex: 1, padding: '10px 16px', fontSize: '13px' }} onClick={() => report.export('pdf')}>
                <FileText size={16} /> PDF
              </button>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '10px 16px', fontSize: '13px' }} onClick={() => report.export('excel')}>
                <FileSpreadsheet size={16} /> Excel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
