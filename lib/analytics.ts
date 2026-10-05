import { Lead, Branch, SalesRep, LeadStatus } from './types';

export interface DashboardMetrics {
  totalLeads: number;
  deliveredLeads: number;
  lostLeads: number;
  activePipelineLeads: number;
  totalDeliveredRevenue: number;
  pipelineRevenue: number;
  conversionRate: number;
  avgDaysToDelivery: number;
}

export interface StalledLeadAlert {
  leadId: string;
  customerName: string;
  model: string;
  status: LeadStatus;
  daysInactive: number;
  dealValue: number;
  repName: string;
  branchName: string;
}

export function calculateMetrics(leads: Lead[]): DashboardMetrics {
  const totalLeads = leads.length;
  if (totalLeads === 0) {
    return {
      totalLeads: 0,
      deliveredLeads: 0,
      lostLeads: 0,
      activePipelineLeads: 0,
      totalDeliveredRevenue: 0,
      pipelineRevenue: 0,
      conversionRate: 0,
      avgDaysToDelivery: 0,
    };
  }

  const delivered = leads.filter((l) => l.status === 'delivered');
  const lost = leads.filter((l) => l.status === 'lost');
  const active = leads.filter((l) => l.status !== 'delivered' && l.status !== 'lost');

  const totalDeliveredRevenue = delivered.reduce((sum, l) => sum + l.deal_value, 0);
  const pipelineRevenue = active.reduce((sum, l) => sum + l.deal_value, 0);

  // Win / Conversion rate %
  const conversionRate = totalLeads > 0 ? (delivered.length / totalLeads) * 100 : 0;

  // Average days from created_at to delivered
  let totalDays = 0;
  delivered.forEach((l) => {
    const created = new Date(l.created_at).getTime();
    const lastActive = new Date(l.last_activity_at).getTime();
    totalDays += (lastActive - created) / (1000 * 60 * 60 * 24);
  });
  const avgDaysToDelivery = delivered.length > 0 ? Math.round(totalDays / delivered.length) : 0;

  return {
    totalLeads,
    deliveredLeads: delivered.length,
    lostLeads: lost.length,
    activePipelineLeads: active.length,
    totalDeliveredRevenue,
    pipelineRevenue,
    conversionRate: Math.round(conversionRate * 10) / 10,
    avgDaysToDelivery,
  };
}

// Action Center: Find leads stuck in active stages with no activity for > 7 days
export function getStalledLeads(
  leads: Lead[],
  reps: SalesRep[],
  branches: Branch[],
  referenceDateStr?: string
): StalledLeadAlert[] {
  // Use the metadata generated_at or latest date as reference anchor
  const refDate = referenceDateStr ? new Date(referenceDateStr).getTime() : new Date('2025-12-31T23:59:59Z').getTime();

  const repMap = new Map(reps.map((r) => [r.id, r.name]));
  const branchMap = new Map(branches.map((b) => [b.id, b.name]));

  const activeStages: LeadStatus[] = ['new', 'contacted', 'test_drive', 'negotiation', 'order_placed'];

  return leads
    .filter((l) => activeStages.includes(l.status))
    .map((l) => {
      const lastActive = new Date(l.last_activity_at).getTime();
      const daysInactive = Math.floor((refDate - lastActive) / (1000 * 60 * 60 * 24));
      return {
        leadId: l.id,
        customerName: l.customer_name,
        model: l.model_interested,
        status: l.status,
        daysInactive,
        dealValue: l.deal_value,
        repName: repMap.get(l.assigned_to) || 'Unknown Rep',
        branchName: branchMap.get(l.branch_id) || 'Unknown Branch',
      };
    })
    .filter((item) => item.daysInactive >= 7)
    .sort((a, b) => b.daysInactive - a.daysInactive);
}

// Conversion Funnel Data
export function getFunnelData(leads: Lead[]) {
  const stageOrder: LeadStatus[] = ['new', 'contacted', 'test_drive', 'negotiation', 'order_placed', 'delivered'];
  
  // Count how many reached or passed each stage via status_history
  return stageOrder.map((stage) => {
    const count = leads.filter((l) => l.status_history.some((h) => h.status === stage)).length;
    return {
      stage: stage.replace('_', ' ').toUpperCase(),
      count,
    };
  });
}