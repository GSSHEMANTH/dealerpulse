'use client';

import React, { useState, useEffect, useMemo } from 'react';
import rawDataset from '@/Data/dealership_data.json';
import { DealershipData, Lead } from '@/lib/types';
import { calculateMetrics, getStalledLeads, getFunnelData } from '@/lib/analytics';
import ActionCenter from '@/components/ActionCenter';
import Logo from '@/components/Logo';
import ProductMixDonut from '@/components/ProductMixDonut';
import MarketingSourceBar from '@/components/MarketingSourceBar';
import AIAssistant from '@/components/AIAssistant';
import {
  TrendingUp,
  Calendar,
  IndianRupee,
  Car,
  Filter,
  RotateCcw,
  Users,
  Layers,
  PieChart,
  ShieldAlert,
} from 'lucide-react';

const dataset = rawDataset as unknown as DealershipData;

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedRep, setSelectedRep] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'pipeline' | 'analytics'>('pipeline');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter available sales reps based on branch
  const availableReps = useMemo(() => {
    if (!dataset?.sales_reps) return [];
    if (selectedBranch === 'all') return dataset.sales_reps;
    return dataset.sales_reps.filter(
      (r) => String(r.branch_id).trim().toLowerCase() === String(selectedBranch).trim().toLowerCase()
    );
  }, [selectedBranch]);

  // Lead filtering
  const filteredLeads = useMemo(() => {
    if (!dataset?.leads) return [];

    return dataset.leads.filter((lead: Lead) => {
      if (selectedBranch !== 'all') {
        const leadBranch = String(lead.branch_id || '').trim().toLowerCase();
        const targetBranch = String(selectedBranch).trim().toLowerCase();
        if (leadBranch !== targetBranch) return false;
      }

      if (selectedRep !== 'all') {
        const leadRep = String(lead.assigned_to || '').trim().toLowerCase();
        const targetRep = String(selectedRep).trim().toLowerCase();
        if (leadRep !== targetRep) return false;
      }

      if (selectedMonth !== 'all') {
        if (!lead.created_at || !lead.created_at.startsWith(selectedMonth)) {
          return false;
        }
      }

      return true;
    });
  }, [selectedBranch, selectedRep, selectedMonth]);

  const metrics = useMemo(() => calculateMetrics(filteredLeads), [filteredLeads]);
  const stalledLeads = useMemo(
    () =>
      getStalledLeads(
        filteredLeads,
        dataset.sales_reps || [],
        dataset.branches || [],
        dataset.metadata?.generated_at
      ),
    [filteredLeads]
  );
  const funnelData = useMemo(() => getFunnelData(filteredLeads), [filteredLeads]);

  // 1. Model breakdown calculation
  const modelStats = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number }>();
    filteredLeads.forEach((lead) => {
      const model = lead.model_interested || 'Other';
      const prev = map.get(model) || { count: 0, revenue: 0 };
      map.set(model, {
        count: prev.count + 1,
        revenue: prev.revenue + (lead.status === 'delivered' ? lead.deal_value || 0 : 0),
      });
    });
    return Array.from(map.entries())
      .map(([model, stats]) => ({ model, ...stats }))
      .sort((a, b) => b.count - a.count);
  }, [filteredLeads]);

  // 2. Marketing source calculation
  const sourceStats = useMemo(() => {
    const map = new Map<string, { total: number; delivered: number }>();
    filteredLeads.forEach((lead) => {
      const srcRaw = lead.source || 'other';
      const src = srcRaw.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const prev = map.get(src) || { total: 0, delivered: 0 };
      map.set(src, {
        total: prev.total + 1,
        delivered: prev.delivered + (lead.status === 'delivered' ? 1 : 0),
      });
    });
    return Array.from(map.entries())
      .map(([source, stats]) => ({
        source,
        total: stats.total,
        delivered: stats.delivered,
        winRate: stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredLeads]);

  // 3. Loss reasons breakdown
  const lossStats = useMemo(() => {
    const map = new Map<string, number>();
    const lostLeads = filteredLeads.filter((l) => l.status === 'lost');
    lostLeads.forEach((l) => {
      const reason = l.lost_reason || 'Unknown';
      map.set(reason, (map.get(reason) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([reason, count]) => ({
        reason,
        count,
        percent: lostLeads.length > 0 ? Math.round((count / lostLeads.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredLeads]);

  // 4. Rep leaderboard calculation
  const repLeaderboard = useMemo(() => {
    return availableReps
      .map((rep) => {
        const repLeads = filteredLeads.filter(
          (l) => String(l.assigned_to).trim().toLowerCase() === String(rep.id).trim().toLowerCase()
        );
        const delivered = repLeads.filter((l) => l.status === 'delivered');
        const revenue = delivered.reduce((sum, l) => sum + (l.deal_value || 0), 0);

        return {
          id: rep.id,
          name: rep.name,
          role: rep.role,
          totalAssigned: repLeads.length,
          deliveredCount: delivered.length,
          winRate: repLeads.length > 0 ? Math.round((delivered.length / repLeads.length) * 100) : 0,
          revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue || b.deliveredCount - a.deliveredCount);
  }, [availableReps, filteredLeads]);

  const months = ['2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12'];

  const resetFilters = () => {
    setSelectedBranch('all');
    setSelectedRep('all');
    setSelectedMonth('all');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-mono text-slate-400">
        INITIALIZING DEALERPULSE...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <Logo />

          {/* Clean 2-Color Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mr-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </div>

            {/* Branch Filter */}
            <select
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 cursor-pointer focus:outline-none focus:border-blue-600 transition"
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setSelectedRep('all');
              }}
            >
              <option value="all">All Branches ({dataset.branches?.length || 0})</option>
              {dataset.branches?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>

            {/* Sales Rep Filter */}
            <select
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 cursor-pointer focus:outline-none focus:border-blue-600 transition"
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
            >
              <option value="all">All Sales Reps ({availableReps.length})</option>
              {availableReps.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.role === 'branch_manager' ? 'Mgr' : 'Rep'})
                </option>
              ))}
            </select>

            {/* Month Filter */}
            <select
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 cursor-pointer focus:outline-none focus:border-blue-600 transition"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">All Months (7M)</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {new Date(m + '-01').toLocaleString('default', { month: 'short', year: 'numeric' })}
                </option>
              ))}
            </select>

            {(selectedBranch !== 'all' || selectedRep !== 'all' || selectedMonth !== 'all') && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-2 rounded-lg flex items-center gap-1 font-semibold cursor-pointer transition"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Executive KPI Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 uppercase font-semibold flex items-center justify-between">
              Delivered Revenue <IndianRupee className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold mt-2 text-slate-900">
              ₹{(metrics.totalDeliveredRevenue / 10000000).toFixed(2)} Cr
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Active Pipeline: ₹{(metrics.pipelineRevenue / 10000000).toFixed(2)} Cr
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 uppercase font-semibold flex items-center justify-between">
              Units Delivered <Car className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold mt-2 text-slate-900">{metrics.deliveredLeads}</div>
            <div className="text-xs text-slate-500 mt-1">
              Out of {metrics.totalLeads} Filtered Inquiries
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 uppercase font-semibold flex items-center justify-between">
              Win Rate <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold mt-2 text-slate-900">{metrics.conversionRate}%</div>
            <div className="text-xs text-slate-500 mt-1">{metrics.lostLeads} Closed as Lost</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 uppercase font-semibold flex items-center justify-between">
              Avg Delivery Cycle <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold mt-2 text-slate-900">{metrics.avgDaysToDelivery} Days</div>
            <div className="text-xs text-slate-500 mt-1">Inquiry to Handover</div>
          </div>
        </div>

        {/* AI Executive Copilot (Placed directly between KPI Strip and Action Center) */}
        <AIAssistant
          metrics={metrics}
          stalledLeads={stalledLeads}
          branchName={
            selectedBranch === 'all'
              ? 'All Branches'
              : dataset.branches.find((b) => b.id === selectedBranch)?.name || 'Selected Branch'
          }
          selectedMonth={selectedMonth}
          topLossReason={lossStats[0]?.reason || 'Budget constraints'}
        />

        {/* Action Center Banner */}
        <ActionCenter stalledLeads={stalledLeads} />

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`pb-3 transition border-b-2 ${
              activeTab === 'pipeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Pipeline Progression & Reps
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 transition border-b-2 ${
              activeTab === 'analytics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Product Mix & Marketing Channels
          </button>
        </div>

        {/* Tab 1: Pipeline & Reps */}
        {activeTab === 'pipeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Stage Progression Table */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Milestone Stage Conversion</h3>
                  <p className="text-xs text-slate-500">Funnel volume and retention at each stage</p>
                </div>
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-2.5">Pipeline Stage</th>
                    <th className="pb-2.5 text-center">Volume</th>
                    <th className="pb-2.5 text-right">Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {funnelData.map((item, index) => {
                    const baseCount = funnelData[0]?.count || 1;
                    const percent = Math.round((item.count / baseCount) * 100);

                    return (
                      <tr key={item.stage} className="hover:bg-slate-50 transition">
                        <td className="py-3 font-medium text-slate-800">
                          <span className="inline-block w-5 text-slate-400 font-mono text-[11px]">
                            {index + 1}.
                          </span>
                          {item.stage}
                        </td>
                        <td className="py-3 text-center font-bold text-slate-900">{item.count}</td>
                        <td className="py-3 text-right">
                          <span className="font-semibold text-slate-800 mr-2">{percent}%</span>
                          <span className="inline-block w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden align-middle">
                            <span
                              className="block bg-blue-600 h-full rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Sales Officers Leaderboard */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Sales Officers Leaderboard</h3>
                    <p className="text-xs text-slate-500">Ranked by closed deals and delivered revenue</p>
                  </div>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
                  {repLeaderboard.length} Reps
                </span>
              </div>

              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider sticky top-0 bg-white">
                      <th className="pb-2.5">Rep Name</th>
                      <th className="pb-2.5 text-center">Pipeline</th>
                      <th className="pb-2.5 text-center">Sold</th>
                      <th className="pb-2.5 text-center">Win %</th>
                      <th className="pb-2.5 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {repLeaderboard.map((rep) => (
                      <tr key={rep.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 font-medium text-slate-800">
                          {rep.name}
                          <span className="block text-[10px] text-slate-400">
                            {rep.role === 'branch_manager' ? 'Branch Manager' : 'Sales Officer'}
                          </span>
                        </td>
                        <td className="py-2.5 text-center text-slate-500">{rep.totalAssigned}</td>
                        <td className="py-2.5 text-center font-bold text-slate-900">{rep.deliveredCount}</td>
                        <td className="py-2.5 text-center font-medium text-blue-600">{rep.winRate}%</td>
                        <td className="py-2.5 text-right font-bold text-slate-900">
                          ₹{(rep.revenue / 100000).toFixed(1)}L
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Visual Charts + Detailed Breakdowns */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* Visual Row: Donut Chart + Horizontal Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProductMixDonut data={modelStats} />
              <MarketingSourceBar data={sourceStats} />
            </div>

            {/* Data Tables Row: Model Demand & Loss Reasons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vehicle Model Revenue Share */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Model Demand & Delivered Value</h3>
                    <p className="text-xs text-slate-500">Inquiry volume and delivered revenue per Toyota model</p>
                  </div>
                </div>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-2.5">Toyota Model</th>
                      <th className="pb-2.5 text-center">Inquiries</th>
                      <th className="pb-2.5 text-right">Delivered Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modelStats.map((item) => (
                      <tr key={item.model} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 font-semibold text-slate-800">{item.model}</td>
                        <td className="py-2.5 text-center text-slate-600">{item.count}</td>
                        <td className="py-2.5 text-right font-bold text-blue-600">
                          ₹{(item.revenue / 100000).toFixed(1)}L
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Deal Loss Reasons Diagnostic */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Primary Deal Drop-Off Reasons</h3>
                    <p className="text-xs text-slate-500">Why prospective buyers fell out of the active funnel</p>
                  </div>
                </div>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-2.5">Loss Factor</th>
                      <th className="pb-2.5 text-center">Lost Deals</th>
                      <th className="pb-2.5 text-right">% of Losses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lossStats.map((item) => (
                      <tr key={item.reason} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 font-medium text-slate-800">{item.reason}</td>
                        <td className="py-2.5 text-center font-bold text-amber-700">{item.count}</td>
                        <td className="py-2.5 text-right font-semibold text-slate-700">{item.percent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}