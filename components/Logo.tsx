import React from 'react';

export default function Logo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center justify-center rounded-xl bg-blue-600 text-white p-1.5 shadow-sm shadow-blue-500/20">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Outer Gauge Arc */}
          <path d="M12 2a10 10 0 0 0-9.8 8c-.2.7-.2 1.3 0 2a10 10 0 0 0 19.6 0c.2-.7.2-1.3 0-2A10 10 0 0 0 12 2z" opacity="0.25" />
          {/* Dynamic Pulse Line */}
          <path d="M3 13h4l2.5-4.5 4 8 2.5-4.5h5" />
        </svg>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-base tracking-tight text-slate-900">Dealer</span>
          <span className="font-extrabold text-base tracking-tight text-blue-600">Pulse</span>
        </div>
        <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-400 -mt-1">
          Auto Network OS
        </span>
      </div>
    </div>
  );
}