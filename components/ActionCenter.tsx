'use client';

import React from 'react';
import { StalledLeadAlert } from '@/lib/analytics';
import { AlertTriangle, Clock, User, Building2 } from 'lucide-react';

interface ActionCenterProps {
  stalledLeads: StalledLeadAlert[];
}

export default function ActionCenter({ stalledLeads }: ActionCenterProps) {
  if (stalledLeads.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-sm flex items-center gap-2">
        <span className="font-semibold">Pipeline Health Good:</span> No stalled leads detected in the current selection.
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500 text-white rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Action Center: Attention Required</h3>
            <p className="text-xs text-amber-900">
              {stalledLeads.length} active leads haven't had updates in 7+ days. Prioritize these to avoid deal loss.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
        {stalledLeads.slice(0, 6).map((lead) => (
          <div
            key={lead.leadId}
            className="bg-white border border-amber-200/70 rounded-lg p-3 shadow-xs hover:border-amber-400 transition"
          >
            <div className="flex justify-between items-start mb-1.5">
              <span className="font-semibold text-gray-900 text-sm">{lead.customerName}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {lead.daysInactive}d idle
              </span>
            </div>
            <div className="text-xs text-gray-600 mb-2">
              Interested in: <strong className="text-gray-900">{lead.model}</strong> • ₹{(lead.dealValue / 100000).toFixed(1)}L
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 border-t pt-2 mt-2">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" /> {lead.repName}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" /> {lead.branchName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}