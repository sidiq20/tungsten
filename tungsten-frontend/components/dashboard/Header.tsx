"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xs font-medium text-primary uppercase tracking-wider">
            Welcome back,
          </h1>
          <p className="text-xl font-bold">Alex Johnson</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="relative">
            <img
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuALAmpFokOWT4p2qB4rCy1SjqS9_nceygNE7ab_RyJwbRjogLRQLcWbMRLYRwsgJZxlUmAE6PwU5Vxm9bU_3diBFxjitTgvgeGh8T9jh9kA1CpUy-5LlyE_7cKBmYCeZsGYe9hrxma7DPfwfdkw9ezIRMVmAq2n5iVqc-8Qv9fzGjRR83cUlb5uksNJlNHBjLrQXZoUABE0zsPY784kl2RlqiG4WVuJKNCBpy9nIICgAIQRjiN9Yd7RNgOfxqehdRcCyHJkUXqVDg"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background-light dark:border-background-dark rounded-full"></span>
          </div>
        </div>
      </div>
      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input
          className="w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-900 border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary text-sm transition-all outline-none"
          placeholder="Search courses, notes, or tutors..."
          type="text"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
