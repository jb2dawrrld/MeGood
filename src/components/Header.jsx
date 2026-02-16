import { LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Header({ userName = '', userFullName = '', greeting = "Good Morning,", onSignOut }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Derive initials safely
  const initials = (userName || '')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('') || userName.slice(0, 2).toUpperCase();

  // Track scroll for sticky header compact mode
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className="sticky top-0 z-40 bg-gray-100 py-4 shadow-card">
      <div className="relative flex items-center justify-between max-w-6xl mx-auto px-8">
        {/* Left side: Greeting/Name */}
        <div className="flex flex-col min-w-0 flex-1">
          {!isScrolled && (
            <p className="text-gray-500 text-base font-light mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {greeting}
            </p>
          )}
          <h1
            className={`font-bold text-gray-900 tracking-tight transition-all duration-300 ${
              isScrolled ? 'text-2xl' : 'text-3xl'
            }`}
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            {userName}
          </h1>
        </div>

        {/* Center: Me-Good logo */}
        <div
          className="inline-flex items-center justify-center text-5xl font-bold"
          style={{ fontFamily: 'Bagel Fat One, sans-serif' }}
        >   
            Me-Good 
        </div>

        {/* Right side: Profile and Nav */}
        <div className="flex items-center gap-4 min-w-0 flex-1 justify-end">
          <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold shadow-card hover:scale-105 transition-all duration-200 cursor-pointer"
            aria-label="Profile menu"
          >
            {initials}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-card border border-gray-200 py-2 z-50">
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
    </header>
  );
}