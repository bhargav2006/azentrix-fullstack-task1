import React, { useState, useEffect } from 'react';
import { PlusCircle, Check, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import toast from 'react-hot-toast';

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Bonus',
  'Interest',
  'Other Income'
];

const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Shopping',
  'Utilities',
  'Travel',
  'Medical',
  'Entertainment',
  'Education',
  'Other Expense'
];

export default function TransactionForm({ onSave, editingTransaction, onCancelEdit }) {
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [description, setDescription] = useState('');

  // Set form values if editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      const isIncome = editingTransaction.type === 'income';
      const commonList = isIncome ? INCOME_CATEGORIES.slice(0, -1) : EXPENSE_CATEGORIES.slice(0, -1);
      const otherValue = isIncome ? 'Other Income' : 'Other Expense';
      
      const isCommon = commonList.includes(editingTransaction.category);
      if (isCommon) {
        setCategory(editingTransaction.category);
        setIsOtherSelected(false);
        setCustomCategory('');
      } else {
        setCategory(otherValue);
        setIsOtherSelected(true);
        setCustomCategory(editingTransaction.category);
      }
      setAmount(editingTransaction.amount.toString());
      setDate(editingTransaction.date);
      setDescription(editingTransaction.description || '');
    } else {
      resetForm();
    }
  }, [editingTransaction]);

  const resetForm = () => {
    setType('expense');
    setCategory('');
    setCustomCategory('');
    setIsOtherSelected(false);
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory('');
    setCustomCategory('');
    setIsOtherSelected(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalCategory = isOtherSelected ? customCategory.trim() : category.trim();

    // Client-side validations
    if (!finalCategory) {
      toast.error('Category is required');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Amount must be a positive number greater than zero');
      return;
    }
    if (!date) {
      toast.error('Date is required');
      return;
    }

    const payload = {
      type,
      category: finalCategory,
      amount: numAmount,
      date,
      description: description.trim()
    };

    onSave(payload);
    if (!editingTransaction) {
      resetForm();
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm p-6 transition-all duration-300">
      <h3 className="text-lg font-bold text-textPrimary mb-5 flex items-center gap-2">
        {editingTransaction ? (
          <>
            <span className="flex h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
            Edit Transaction
          </>
        ) : (
          <>
            <span className="flex h-2.5 w-2.5 rounded-full bg-income" />
            Add New Transaction
          </>
        )}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Transaction Type toggle buttons */}
        <div>
          <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                type === 'income'
                  ? 'bg-income/10 border-income text-income shadow-sm ring-1 ring-income/20'
                  : 'bg-surface border-border text-textSecondary hover:border-textSecondary/30'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Income
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                type === 'expense'
                  ? 'bg-expense/10 border-expense text-expense shadow-sm ring-1 ring-expense/20'
                  : 'bg-surface border-border text-textSecondary hover:border-textSecondary/30'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Expense
            </button>
          </div>
        </div>

        {/* Category Field (Styled Dropdown) */}
        <div>
          <label htmlFor="category" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
            Category
          </label>
          <div className="relative">
            <select
              id="category"
              value={category}
              onChange={(e) => {
                const val = e.target.value;
                setCategory(val);
                const otherValue = type === 'income' ? 'Other Income' : 'Other Expense';
                if (val === otherValue) {
                  setIsOtherSelected(true);
                } else {
                  setIsOtherSelected(false);
                  setCustomCategory('');
                }
              }}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 pr-10 text-sm text-textPrimary font-semibold focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all appearance-none cursor-pointer"
              required
            >
              <option value="" disabled>Select category</option>
              {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-textSecondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>

        {/* Custom Category Input Field */}
        {isOtherSelected && (
          <div className="animate-fade-in">
            <label htmlFor="customCategory" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
              Custom Category Name
            </label>
            <input
              id="customCategory"
              type="text"
              placeholder="Enter custom category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder-textSecondary/50 font-semibold focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
              required
            />
          </div>
        )}

        {/* Description Field (Optional, Subtle, Smaller) */}
        <div>
          <label htmlFor="description" className="block text-[10px] font-semibold text-textSecondary uppercase tracking-wider mb-1">
            Note (Optional)
          </label>
          <input
            id="description"
            type="text"
            placeholder="Add a note (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-textPrimary placeholder-textSecondary/50 font-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Amount Field */}
          <div>
            <label htmlFor="amount" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary/75 font-semibold text-sm">
                ₹
              </span>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl pl-8 pr-4 py-3 text-sm text-textPrimary font-semibold focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Date Field */}
          <div>
            <label htmlFor="date" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-textPrimary font-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all cursor-pointer"
              required
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          {editingTransaction ? (
            <>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 active:scale-[0.98] text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                Update Transaction
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="flex items-center justify-center gap-2 bg-surface hover:bg-border/40 text-textSecondary border border-border py-3 px-4 rounded-xl text-sm font-semibold transition-all"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 active:scale-[0.98] text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Add Transaction
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
