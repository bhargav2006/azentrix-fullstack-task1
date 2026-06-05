import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center p-2.5 bg-surface hover:bg-border/30 text-textPrimary border border-border rounded-xl shadow-sm hover:border-textSecondary/30 active:scale-95 transition-all duration-300 group"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        {/* Sun Icon */}
        <Sun 
          className={`w-5 h-5 text-accent absolute transition-all duration-500 transform ${
            theme === 'dark' 
              ? 'translate-y-0 rotate-0 opacity-100' 
              : 'translate-y-8 -rotate-90 opacity-0'
          } group-hover:scale-110`} 
        />
        {/* Moon Icon */}
        <Moon 
          className={`w-5 h-5 text-textSecondary absolute transition-all duration-500 transform ${
            theme === 'light' 
              ? 'translate-y-0 rotate-0 opacity-100' 
              : '-translate-y-8 rotate-90 opacity-0'
          } group-hover:scale-110 group-hover:text-accent`} 
        />
      </div>
    </button>
  );
}
