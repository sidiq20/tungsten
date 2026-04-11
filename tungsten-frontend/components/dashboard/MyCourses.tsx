import { Sigma, Microscope } from "lucide-react";

export function MyCourses() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">My Courses</h2>
        <a className="text-xs font-semibold text-primary" href="#">
          View All
        </a>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {/* Course Card 1 */}
        <div className="flex-none w-64 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sigma className="w-6 h-6 text-primary" />
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
              85% DONE
            </span>
          </div>
          <h3 className="font-bold text-sm mb-1">Advanced Calculus II</h3>
          <p className="text-xs text-slate-500 mb-4">Mathematics Department</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[85%] rounded-full"></div>
          </div>
        </div>
        {/* Course Card 2 */}
        <div className="flex-none w-64 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Microscope className="w-6 h-6 text-primary" />
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
              32% DONE
            </span>
          </div>
          <h3 className="font-bold text-sm mb-1">Molecular Biology</h3>
          <p className="text-xs text-slate-500 mb-4">Science &amp; Research</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[32%] rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
