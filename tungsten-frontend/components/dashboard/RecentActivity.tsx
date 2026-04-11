export function RecentActivity() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Recent Activity</h2>
      </div>
      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        <div className="relative">
          <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-4 border-background-light dark:border-background-dark"></div>
          <div>
            <p className="text-sm font-medium">
              Completed Quiz:{" "}
              <span className="text-primary font-bold italic">
                Linear Algebra 101
              </span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">2 hours ago</p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700 border-4 border-background-light dark:border-background-dark"></div>
          <div>
            <p className="text-sm font-medium">
              Uploaded{" "}
              <span className="text-primary font-bold italic">
                Lab Report 4.pdf
              </span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Yesterday, 4:15 PM
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700 border-4 border-background-light dark:border-background-dark"></div>
          <div>
            <p className="text-sm font-medium">
              Earned badge:{" "}
              <span className="text-primary font-bold italic">
                Quick Learner
              </span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">3 days ago</p>
          </div>
        </div>
      </div>
    </section>
  );
}
