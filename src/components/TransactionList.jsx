import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Pencil, Trash2, AlertCircle, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';

export default function TransactionList({ transactions, onEdit, onDelete, editingId }) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle actual deletion approval
  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // Filter transactions based on category search
  const filteredTransactions = transactions.filter(t =>
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dynamic category emoji mapper
  const getCategoryEmoji = (cat) => {
    switch (cat.toLowerCase()) {
      case 'salary': return '💼';
      case 'freelance': return '💻';
      case 'business': return '🏢';
      case 'investment': return '📊';
      case 'bonus': return '🎁';
      case 'interest': return '🏦';
      case 'food': return '🍔';
      case 'rent': return '🏠';
      case 'shopping': return '🛒';
      case 'utilities': return '⚡';
      case 'travel': return '✈️';
      case 'medical': return '🩺';
      case 'entertainment': return '🎬';
      case 'education': return '📚';
      case 'other income': return '💰';
      case 'other expense': return '📦';
      default: return '💰';
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col h-[536px] transition-all duration-300">
      
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-border/60">
        <h3 className="text-lg font-bold text-textPrimary flex items-center gap-2 select-none">
          <span className="flex h-2.5 w-2.5 rounded-full bg-accent" />
          Transactions
        </h3>
        
        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary/60 w-4 h-4" />
          <input
            type="text"
            placeholder="Search category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-1.5 text-xs text-textPrimary placeholder-textSecondary/50 font-medium focus:outline-none focus:border-accent transition-all"
          />
        </div>
      </div>

      {/* Transaction List Container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none animate-fade-in">
            <div className="bg-surface rounded-full p-4 mb-3 border border-border">
              <AlertCircle className="w-6 h-6 text-textSecondary/50" />
            </div>
            <p className="text-sm font-semibold text-textPrimary">No transactions found</p>
            <p className="text-xs text-textSecondary mt-1">
              {searchTerm ? 'Try adjusting your search filter' : 'Add your first income or expense above'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((t) => {
            const formattedDate = format(parseISO(t.date), 'dd MMM yyyy');
            const isEditing = editingId === t.id;

            return (
              <div
                key={t.id}
                className={`group flex items-start justify-between p-3.5 rounded-xl border transition-all duration-200 animate-fade-in ${
                  isEditing
                    ? 'border-accent/40 bg-accent/[0.02] shadow-sm'
                    : 'border-border/60 hover:border-border hover:bg-surface/40 hover:shadow-sm'
                }`}
              >
                {/* Left side details */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center mt-0.5 shrink-0 ${
                      t.type === 'income'
                        ? 'bg-income/10 text-income'
                        : 'bg-expense/10 text-expense'
                    }`}
                  >
                    {t.type === 'income' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-textPrimary flex items-center gap-1.5 truncate max-w-[120px] sm:max-w-[180px]">
                      <span className="text-base leading-none select-none">{getCategoryEmoji(t.category)}</span>
                      <span>{t.category}</span>
                    </h4>
                    {t.description && (
                      <p className="text-xs text-textSecondary font-normal mt-0.5 leading-tight select-all">
                        {t.description}
                      </p>
                    )}
                    <p className="text-[10px] font-medium text-textSecondary/60 mt-1 select-none">
                      {formattedDate}
                    </p>
                  </div>
                </div>

                {/* Right side actions and amount */}
                <div className="flex items-center gap-4">
                  <span
                    className={`text-sm font-bold tracking-tight ${
                      t.type === 'income' ? 'text-income' : 'text-textPrimary'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>

                  <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onEdit(t)}
                      title="Edit"
                      className="p-1.5 rounded-lg text-textSecondary hover:text-accent hover:bg-accent/10 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(t.id)}
                      title="Delete"
                      className="p-1.5 rounded-lg text-textSecondary hover:text-expense hover:bg-expense/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-expense">
              <div className="bg-expense/10 p-2.5 rounded-full">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-textPrimary">Delete Transaction</h4>
            </div>
            
            <p className="text-sm text-textSecondary leading-relaxed">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="bg-surface hover:bg-border/40 text-textSecondary border border-border px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-expense hover:bg-expense/90 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
