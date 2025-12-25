
import { Menu, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Header({ userName = '', userFullName = '', greeting = "Good Morning", onSignOut }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Derive initials safely
  const initials = (userName || '')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('') || userName.slice(0, 2).toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  return (
    <div className="flex items-start justify-between mb-8">
      {/* Left side: Greeting and Name */}
      <div>
        <p className="text-gray-500 text-base font-light mb-1">{greeting}</p>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          {userName}
        </h1>
      </div>

      {/* Right side: Profile and Nav */}
      <div className="flex items-center gap-4">
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Navigation menu"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        
        {/* Profile Picture with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
            aria-label="Profile menu"
          >
            {initials}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{userFullName || userName}</p>
                <p className="text-xs text-gray-500 mt-0.5">@{userName}</p>
              </div>

              {/* Sign Out Button */}
              {onSignOut && (
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onSignOut();
                  }}
                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}