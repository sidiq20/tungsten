import { Home, Search, Plus, Bookmark, User } from "lucide-react";

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 px-6 py-3 flex items-center justify-between z-50">
      <button className="flex flex-col items-center gap-1 text-primary">
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-bold">Home</span>
      </button>
      <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
        <Search className="w-6 h-6" />
        <span className="text-[10px] font-medium">Search</span>
      </button>
      {/* Central Upload Button */}
      <button className="relative -top-6 bg-primary text-white w-14 h-14 rounded-full shadow-lg shadow-primary/40 flex items-center justify-center transform active:scale-95 transition-transform border-4 border-background-light dark:border-background-dark">
        <Plus className="w-8 h-8" />
      </button>
      <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
        <Bookmark className="w-6 h-6" />
        <span className="text-[10px] font-medium">Saved</span>
      </button>
      <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
        <User className="w-6 h-6" />
        <span className="text-[10px] font-medium">Profile</span>
      </button>
    </nav>
  );
}
