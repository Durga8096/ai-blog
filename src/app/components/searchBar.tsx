'use client';

import { useState, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onClear?: () => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search blogs by title, content, or topic...",
  disabled = false,
  onClear
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input') as HTMLInputElement;
        searchInput?.focus();
      }
      
   
      if (e.key === 'Escape' && value) {
        onChange('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [value, onChange]);

  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Container */}
      <div 
        className={`relative flex items-center transition-all duration-300 ease-in-out ${
          isFocused 
            ? 'transform scale-[1.02] shadow-2xl' 
            : 'shadow-lg hover:shadow-xl'
        }`}
      >
        
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <svg 
            className={`h-5 w-5 transition-colors duration-200 ${
              isFocused ? 'text-blue-500' : 'text-gray-400'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        <input
          id="search-input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`w-full pl-12 pr-20 py-4 
                     bg-white 
                     border-2 
                     rounded-2xl 
                     transition-all 
                     duration-300 
                     ease-in-out
                     placeholder-gray-400
                     text-gray-700
                     text-lg
                     ${isFocused 
                       ? 'border-blue-500 ring-4 ring-blue-100 outline-none' 
                       : 'border-gray-200 hover:border-gray-300'
                     }
                     ${disabled 
                       ? 'bg-gray-50 cursor-not-allowed opacity-60' 
                       : ''
                     }`}
        />

        
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-2">
          
          {value && (
            <button
              onClick={handleClear}
              disabled={disabled}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200
                         text-gray-400 hover:text-gray-600 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear search (Esc)"
            >
              <svg 
                className="h-4 w-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          )}

          
          {!value && !isFocused && (
            <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border">
              <kbd className="font-mono">⌘</kbd>
              <span>K</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}