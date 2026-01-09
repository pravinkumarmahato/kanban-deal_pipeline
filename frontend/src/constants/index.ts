import { DealStage } from '../types';

export const API_BASE_URL = 'http://localhost:8000';

export const PIPELINE_STAGES = [
  { id: DealStage.SOURCED, label: 'Sourced', color: 'bg-slate-100 border-slate-200' },
  { id: DealStage.SCREEN, label: 'Screen', color: 'bg-blue-50 border-blue-200' },
  { id: DealStage.DILIGENCE, label: 'Diligence', color: 'bg-indigo-50 border-indigo-200' },
  { id: DealStage.IC, label: 'IC Review', color: 'bg-purple-50 border-purple-200' },
  { id: DealStage.INVESTED, label: 'Invested', color: 'bg-green-50 border-green-200' },
  { id: DealStage.PASSED, label: 'Passed', color: 'bg-red-50 border-red-200' },
];

export const MEMO_SECTIONS = [
  { key: 'summary', label: 'Executive Summary' },
  { key: 'market', label: 'Market Opportunity' },
  { key: 'product', label: 'Product & Technology' },
  { key: 'traction', label: 'Traction & Metrics' },
  { key: 'risks', label: 'Risks & Mitigations' },
  { key: 'open_questions', label: 'Open Questions' },
] as const;
