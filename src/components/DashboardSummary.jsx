// components/DashboardSummary.jsx
import React from "react";

export default function DashboardSummary({ data = [], loading = false }) {
  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((block, index) => (
        <div
          key={index}
          className={`p-4 rounded-xl bg-[#0d1117] border-l-4 ${block.border} border-[#30363d]`}
        >
          <div className="text-2xl">{block.icon}</div>
          <div className="mt-2 text-sm text-gray-400">{block.title}</div>
          <div className="text-white text-lg font-semibold mt-1">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              block.value
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">{block.subtext}</div>
        </div>
      ))}
    </div>
  );
}
