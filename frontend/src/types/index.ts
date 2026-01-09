export const Role = {
  ADMIN: 'admin',
  ANALYST: 'analyst',
  PARTNER: 'partner',
} as const;
  
export type Role = typeof Role[keyof typeof Role];

export const DealStage = {
  SOURCED: 'sourced',
  SCREEN: 'screen',
  DILIGENCE: 'diligence',
  IC: 'ic',
  INVESTED: 'invested',
  PASSED: 'passed',
} as const;
  
export type DealStage = typeof DealStage[keyof typeof DealStage];
  
export interface User {
  id: number;
  email: string;
  role: Role;
  full_name?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface UserCreate {
  email: string;
  password: string;
  role: Role;
  full_name?: string | null;
}
  
export interface Deal {
  id: number;
  name: string;
  company_url?: string;
  owner_id: number; // User ID (backend returns owner_id)
  stage: DealStage;
  round?: string;
  check_size?: number;
  status: 'active' | 'archived' | 'approved' | 'declined';
  created_at: string;
  updated_at: string | null;
}
  
export interface Activity {
  id: number;
  deal_id: number;
  user_id: number;
  activity_type: string;
  description: string; // e.g., "Moved from Screen to Diligence"
  created_at: string;
}
  
export interface MemoSection {
  summary: string;
  market: string;
  product: string;
  traction: string;
  risks: string;
  open_questions: string;
}
  
export interface Memo {
  id: number;
  deal_id: number;
  created_by_id: number;
  summary?: string | null;
  market?: string | null;
  product?: string | null;
  traction?: string | null;
  risks?: string | null;
  open_questions?: string | null;
  created_at: string;
  updated_at: string | null;
}
  
export interface MemoVersion {
  id: number;
  memo_id: number;
  version_number: number;
  summary?: string | null;
  market?: string | null;
  product?: string | null;
  traction?: string | null;
  risks?: string | null;
  open_questions?: string | null;
  created_by_id: number;
  created_at: string;
}

export interface Vote {
  id: number;
  deal_id: number;
  user_id: number;
  created_at: string;
}
  