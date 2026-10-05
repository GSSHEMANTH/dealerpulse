export type LeadStatus = 
  | 'new' 
  | 'contacted' 
  | 'test_drive' 
  | 'negotiation' 
  | 'order_placed' 
  | 'delivered' 
  | 'lost';

export interface StatusHistoryItem {
  status: LeadStatus;
  timestamp: string;
  note: string;
}

export interface Lead {
  id: string;
  customer_name: string;
  phone: string;
  source: string;
  model_interested: string;
  status: LeadStatus;
  assigned_to: string;
  branch_id: string;
  created_at: string;
  last_activity_at: string;
  status_history: StatusHistoryItem[];
  expected_close_date: string;
  deal_value: number;
  lost_reason: string | null;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
}

export interface SalesRep {
  id: string;
  name: string;
  branch_id: string;
  role: 'branch_manager' | 'sales_officer';
  joined: string;
}

export interface DealershipData {
  metadata: {
    generated_at: string;
    description: string;
    date_range: string;
    notes: string;
  };
  branches: Branch[];
  sales_reps: SalesRep[];
  leads: Lead[];
}