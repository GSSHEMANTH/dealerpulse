'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface FunnelDataPoint {
  stage: string;
  count: number;
}

const COLORS = ['#3B82F6', '#60A5FA', '#818CF8', '#A78BFA', '#F59E0B', '#10B981'];

export default function FunnelChart({ data }: { data: FunnelDataPoint[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
      <h3 className="font-bold text-gray-900 text-base mb-1">Conversion Funnel Progression</h3>
      <p className="text-xs text-gray-500 mb-4">
        Total volume of leads that reached or passed through each milestone stage.
      </p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="stage"
              tick={{ fontSize: 11, fill: '#4B5563' }}
              width={100}
            />
            <Tooltip
              formatter={(value: any) => [`${value} Leads`, 'Reached Stage']}
              contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}