import React from 'react';
import { Calendar } from 'lucide-react';

export default function MonthPicker({ selectedMonth, onChange }) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border px-4 py-2.5 rounded-xl shadow-sm hover:border-textSecondary/30 transition-colors">
      <Calendar className="text-textSecondary w-5 h-5" />
      <div className="flex flex-col">
        <label htmlFor="month-select" className="text-[10px] uppercase tracking-wider font-semibold text-textSecondary select-none">
          Active Month
        </label>
        <input
          id="month-select"
          type="month"
          value={selectedMonth}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent text-textPrimary font-semibold text-sm focus:outline-none cursor-pointer"
        />
      </div>
    </div>
  );
}
