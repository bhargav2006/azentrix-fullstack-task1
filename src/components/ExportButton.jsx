import React from 'react';
import { Download } from 'lucide-react';
import { exportTransactions } from '../api';
import toast from 'react-hot-toast';

export default function ExportButton({ selectedMonth }) {
  const handleExport = async () => {
    try {
      const csvContent = await exportTransactions(selectedMonth);
      
      // Check if CSV only has header (no transactions)
      const rows = csvContent.split('\n');
      if (rows.length <= 1) {
        toast.error('No transactions available to export for this month.');
        return;
      }

      // Create blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_${selectedMonth || 'all'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV exported successfully!');
    } catch (error) {
      console.error('Failed to export CSV:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center justify-center gap-2 bg-surface hover:bg-border/40 text-textPrimary border border-border px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:border-textSecondary/30 transition-all duration-200"
      title="Export month data to CSV"
    >
      <Download className="w-4 h-4 text-textSecondary" />
      <span>Export CSV</span>
    </button>
  );
}
