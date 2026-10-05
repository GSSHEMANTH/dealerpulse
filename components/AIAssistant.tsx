'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, Bot, ChevronDown, ChevronUp, ArrowRight, Lightbulb } from 'lucide-react';
import { DashboardMetrics, StalledLeadAlert } from '@/lib/analytics';

interface AIAssistantProps {
  metrics: DashboardMetrics;
  stalledLeads: StalledLeadAlert[];
  branchName: string;
  selectedMonth: string;
  topLossReason: string;
}

export default function AIAssistant({
  metrics,
  stalledLeads,
  branchName,
  selectedMonth,
  topLossReason,
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeQuery, setActiveQuery] = useState<string | null>(null);

  // Auto-generate dynamic executive insights based on live data
  const summary = useMemo(() => {
    const isUnderperforming = metrics.conversionRate < 35;
    const highIdleRisk = stalledLeads.length > 5;

    let sentiment = 'Healthy & Pacing Well';
    let sentimentColor = 'text-blue-600 bg-blue-50 border-blue-200';

    if (isUnderperforming || highIdleRisk) {
      sentiment = 'Action Required: Pipeline At Risk';
      sentimentColor = 'text-amber-800 bg-amber-50 border-amber-200';
    }

    const narrative = `In ${branchName}${selectedMonth !== 'all' ? ` for ${selectedMonth}` : ''}, the network closed ₹${(metrics.totalDeliveredRevenue / 10000000).toFixed(2)} Cr across ${metrics.deliveredLeads} units (${metrics.conversionRate}% win rate). Currently, ${stalledLeads.length} active inquiries have had zero touchpoints in over 7 days. The primary root cause of lost deals is "${topLossReason}".`;

    const recommendations = [
      highIdleRisk
        ? `Reassign ${stalledLeads.length} idle leads immediately; older inquiries lose 60% conversion probability after 7 days.`
        : `Lead velocity is steady with low idle counts. Maintain follow-up SLAs.`,
      `Partner with alternate NBFC financing lenders to address "${topLossReason}", which is the leading cause of deal drop-offs.`,
      metrics.conversionRate < 30
        ? `Conversion rate (${metrics.conversionRate}%) is below 30% baseline. Run a test-drive re-engagement initiative.`
        : `Turnaround cycle averages ${metrics.avgDaysToDelivery} days from inquiry to keys handover.`,
    ];

    return { sentiment, sentimentColor, narrative, recommendations };
  }, [metrics, stalledLeads, branchName, selectedMonth, topLossReason]);

  const quickAnswers: Record<string, string> = {
    'Bottleneck Analysis': `The largest bottleneck is currently deal loss due to "${topLossReason}". Addressing this factor will yield the fastest conversion lift.`,
    'Revenue Forecast': `With ₹${(metrics.pipelineRevenue / 10000000).toFixed(2)} Cr in active pipeline and a historical ${metrics.conversionRate}% conversion rate, expected near-term closed revenue is approximately ₹${((metrics.pipelineRevenue * (metrics.conversionRate / 100)) / 10000000).toFixed(2)} Cr.`,
    'Rep SLA Health': stalledLeads.length === 0
      ? 'All sales officers are currently within SLA.'
      : `${stalledLeads.length} leads violate the 7-day follow-up SLA standard. Top idle deal is worth ₹${(((stalledLeads[0]?.dealValue || 0)) / 100000).toFixed(1)}L (${stalledLeads[0]?.customerName || ''}).`,
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all">
      {/* Top Banner Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs shadow-blue-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight">Executive Copilot</span>
              <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.5 rounded font-semibold">
                AI Synthesis
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Live strategic briefing for {branchName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${summary.sentimentColor}`}>
            {summary.sentiment}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Expanded Briefing Body */}
      {isOpen && (
        <div className="p-5 space-y-4 text-xs">
          {/* Executive Narrative */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-slate-700 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <Bot className="w-3.5 h-3.5 text-blue-600" /> Strategic Summary
            </div>
            {summary.narrative}
          </div>

          {/* Actionable Recommendations */}
          <div>
            <div className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Prescribed Manager Actions
            </div>
            <ul className="space-y-1.5">
              {summary.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-600">
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Question Chips */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Instant AI Deep Dives
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(quickAnswers).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setActiveQuery(activeQuery === chip ? null : chip)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition ${
                    activeQuery === chip
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Answer Display */}
            {activeQuery && (
              <div className="mt-2.5 p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-950 text-xs">
                <span className="font-bold block mb-0.5">{activeQuery}:</span>
                {quickAnswers[activeQuery]}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}