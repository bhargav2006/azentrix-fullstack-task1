import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, PieChart } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border px-3 py-2 rounded-xl shadow-md text-xs font-semibold text-textPrimary animate-fade-in">
        <p className="text-textSecondary uppercase tracking-wider text-[10px] mb-0.5">{payload[0].payload.category}</p>
        <p className="text-textPrimary text-sm font-bold">
          ₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard({ summary }) {
  const { totalIncome, totalExpenses, netBalance, expensesByCategory } = summary;

  // Format currency for metrics
  const formatVal = (val) => {
    return `₹${Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const hasExpenses = expensesByCategory && expensesByCategory.length > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider text-textSecondary select-none">
              Total Income
            </span>
            <div className="bg-income/10 text-income p-2 rounded-xl">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-extrabold text-income tracking-tight">
              {formatVal(totalIncome)}
            </h4>
            <p className="text-[11px] font-medium text-textSecondary mt-1 select-none">
              This month's earnings
            </p>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider text-textSecondary select-none">
              Total Expenses
            </span>
            <div className="bg-expense/10 text-expense p-2 rounded-xl">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-extrabold text-expense tracking-tight">
              {formatVal(totalExpenses)}
            </h4>
            <p className="text-[11px] font-medium text-textSecondary mt-1 select-none">
              This month's spending
            </p>
          </div>
        </div>

        {/* Net Balance Card */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider text-textSecondary select-none">
              Net Balance
            </span>
            <div className={`p-2 rounded-xl ${netBalance >= 0 ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'}`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className={`text-2xl font-extrabold tracking-tight ${netBalance >= 0 ? 'text-income' : 'text-expense'}`}>
              {netBalance < 0 ? '-' : ''}{formatVal(netBalance)}
            </h4>
            <p className="text-[11px] font-medium text-textSecondary mt-1 select-none">
              {netBalance >= 0 ? 'Surplus remaining' : 'Deficit this month'}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-5 flex items-center gap-2 select-none">
          <PieChart className="w-4 h-4 text-accent" />
          Expenses by Category
        </h3>

        {!hasExpenses ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-surface/50 border border-dashed border-border rounded-xl select-none">
            <p className="text-sm font-semibold text-textPrimary">No spending data</p>
            <p className="text-xs text-textSecondary mt-1">
              Add some expense transactions to see your category breakdown.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={expensesByCategory}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="category"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border)', opacity: 0.1 }} />
                <Bar
                  dataKey="total"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                >
                  {expensesByCategory.map((entry, index) => {
                    // Harmonious colors based on index
                    const colors = [
                      '#ef2b2d', // Brand Red
                      '#f05252', // Accent Brand Coral
                      '#f87171', // Soft Red
                      '#fca5a5', // Muted Salmon
                      '#fecaca', // Pale Pink
                    ];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
