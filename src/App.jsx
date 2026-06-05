import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { getDB } from './db';
import { getTransactions, getSummary, addTransaction, updateTransaction, deleteTransaction } from './api';
import MonthPicker from './components/MonthPicker';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import ExportButton from './components/ExportButton';
import ThemeToggle from './components/ThemeToggle';
import { Wallet } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('theme');
      if (typeof storedPrefs === 'string') {
        return storedPrefs;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    expensesByCategory: []
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isDbReady, setIsDbReady] = useState(false);

  // Initialize SQLite DB
  useEffect(() => {
    getDB()
      .then(() => {
        setIsDbReady(true);
      })
      .catch((err) => {
        console.error('Failed to initialize database:', err);
        toast.error('Failed to initialize SQLite database.');
      });
  }, []);

  // Fetch transactions and summary when month changes or db is ready
  const loadData = async () => {
    try {
      const txs = await getTransactions(selectedMonth);
      const sum = await getSummary(selectedMonth);
      setTransactions(txs);
      setSummary(sum);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load transaction data.');
    }
  };

  useEffect(() => {
    if (isDbReady) {
      loadData();
    }
  }, [selectedMonth, isDbReady]);

  // Handle Form Saves (Create & Update)
  const handleSaveTransaction = async (data) => {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, data);
        toast.success('Transaction updated successfully!');
        setEditingTransaction(null);
      } else {
        await addTransaction(data);
        toast.success('Transaction added successfully!');
      }
      loadData();
    } catch (err) {
      console.error('Save failed:', err);
      toast.error(err.message || 'Failed to save transaction');
    }
  };

  // Handle Deletion
  const handleDeleteTransaction = async (id) => {
    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted successfully!');
      // Reset edit mode if deleted transaction was being edited
      if (editingTransaction && editingTransaction.id === id) {
        setEditingTransaction(null);
      }
      loadData();
    } catch (err) {
      console.error('Deletion failed:', err);
      toast.error('Failed to delete transaction.');
    }
  };

  // Cancel editing mode
  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  // Loader screen while sql.js initializes
  if (!isDbReady) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 select-none">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 border-4 border-accent/25 border-t-accent rounded-full animate-spin"></div>
          <div className="absolute text-2xl">💰</div>
        </div>
        <h2 className="text-base font-bold text-textPrimary tracking-tight">Initializing SQLite Engine</h2>
        <p className="text-xs text-textSecondary mt-1.5 font-medium">
          Loading WebAssembly SQLite in your browser...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12 flex flex-col">
      {/* Toast Notifications */}
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 3000,
          style: {
            background: 'var(--card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }
        }} 
      />

      {/* Header bar */}
      <header className="sticky top-0 bg-card/85 backdrop-blur-md border-b border-border z-40 px-6 py-4 shadow-sm select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-accent to-red-600 p-2.5 rounded-xl text-white shadow-sm shadow-accent/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-textPrimary leading-none">
                Budget Tracker
              </h1>
              <p className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mt-0.5">
                Powered by SQLite WASM
              </p>
            </div>
          </div>

          {/* Month picker & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <MonthPicker selectedMonth={selectedMonth} onChange={setSelectedMonth} />
            <ExportButton selectedMonth={selectedMonth} />
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form & Transactions List */}
          <section className="lg:col-span-5 space-y-6">
            <TransactionForm
              onSave={handleSaveTransaction}
              editingTransaction={editingTransaction}
              onCancelEdit={handleCancelEdit}
            />
            <TransactionList
              transactions={transactions}
              onEdit={setEditingTransaction}
              onDelete={handleDeleteTransaction}
              editingId={editingTransaction?.id}
            />
          </section>

          {/* Right Column: Dashboard & Visualization */}
          <section className="lg:col-span-7">
            <Dashboard summary={summary} />
          </section>

        </div>
      </main>
    </div>
  );
}
