import { TrendingUp, FileText, ScrollText, Bookmark } from "lucide-react";

export function PopularNotes() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Popular Notes Today</h2>
        <TrendingUp className="w-6 h-6 text-slate-400" />
      </div>
      <div className="space-y-3">
        {/* Note Card 1 */}
        <div className="flex items-center p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate">
              Macroeconomics Final Prep
            </h4>
            <p className="text-[10px] text-slate-500 uppercase font-medium truncate">
              By Sarah Williams • 1.2k views
            </p>
          </div>
          <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary transition-colors shrink-0">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
        {/* Note Card 2 */}
        <div className="flex items-center p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mr-4 shrink-0">
            <ScrollText className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate">
              Roman Architecture Summary
            </h4>
            <p className="text-[10px] text-slate-500 uppercase font-medium truncate">
              By Marcus Chen • 850 views
            </p>
          </div>
          <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary transition-colors shrink-0">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
