'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ModelMixItem {
  model: string;
  count: number;
  revenue: number;
}

// 2-Color monochromatic shade sequence using primary Electric Blue shades + slate neutrals
const BLUE_SHADES = [
  '#1D4ED8', // deep blue
  '#2563EB', // electric blue
  '#3B82F6', // royal blue
  '#60A5FA', // sky blue
  '#93C5FD', // soft blue
  '#CBD5E1', // slate neutral
  '#94A3B8', // dark slate
];

export default function ProductMixDonut({ data }: { data: ModelMixItem[] }) {
  const totalVolume = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-slate-900 text-sm">Product Mix Distribution</h3>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {totalVolume} Total Leads
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Share of customer demand across vehicle models
        </p>

        {/* Donut Chart */}
        <div className="h-56 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any, name: any, entry: any) => [
                  `${value} leads (${Math.round((Number(value) / (totalVolume || 1)) * 100)}%)`,
                  entry.payload.model,
                ]}
                contentStyle={{
                  borderRadius: '8px',
                  fontSize: '12px',
                  borderColor: '#E2E8F0',
                }}
              />
              <Pie
                data={data}
                dataKey="count"
                nameKey="model"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={BLUE_SHADES[index % BLUE_SHADES.length]}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-slate-900">{totalVolume}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Vehicles
            </span>
          </div>
        </div>
      </div>

      {/* Mini Legend */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
        {data.slice(0, 6).map((item, index) => (
          <div key={item.model} className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: BLUE_SHADES[index % BLUE_SHADES.length] }}
              />
              <span className="truncate text-slate-700 font-medium">{item.model}</span>
            </div>
            <span className="font-semibold text-slate-900">
              {Math.round((item.count / (totalVolume || 1)) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}