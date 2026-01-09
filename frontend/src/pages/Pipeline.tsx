import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Deal, DealStage } from '../types';
import { Role } from '../types';
import { PIPELINE_STAGES } from '../constants';
import { useAuth } from '../context/AuthContext';
import DealModal from '../components/DealModal';

const Pipeline: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  
  // Drag and Drop state
  const [draggedDealId, setDraggedDealId] = useState<number | null>(null);

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getDeals();
      setDeals(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load deals. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleDragStart = (e: React.DragEvent, dealId: number) => {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image or default
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    if (draggedDealId === null) return;

    const deal = deals.find(d => d.id === draggedDealId);
    if (!deal) return;

    if (deal.stage === stage) return;

    // Optimistic update
    const previousDeals = [...deals];
    setDeals(prev => prev.map(d => d.id === draggedDealId ? { ...d, stage } : d));

    try {
      if (user?.role === Role.ADMIN || user?.role === Role.ANALYST) {
        await api.updateDeal(draggedDealId, { ...deal, stage });
      } else {
        alert("Only Analysts and Admins can move deals.");
        setDeals(previousDeals); // Revert
      }
    } catch (err) {
      console.error(err);
      setDeals(previousDeals); // Revert
      alert("Failed to update deal stage.");
    } finally {
      setDraggedDealId(null);
    }
  };

  const handleCreateOrUpdate = async (data: Partial<Deal>) => {
    try {
      if (editingDeal) {
        await api.updateDeal(editingDeal.id, data);
      } else {
        await api.createDeal(data);
      }
      fetchDeals();
    } catch (err) {
      alert("Operation failed");
    }
  };

  const openDeal = (deal: Deal) => {
    // If clicking the title, go to details/memo. If clicking edit, open modal.
    // For now, let's just make clicking the card go to memo.
    navigate(`/deals/${deal.id}`);
  };
  
  const canEdit = user?.role === Role.ADMIN || user?.role === Role.ANALYST;

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-400">Loading Pipeline...</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Pipeline</h2>
           {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
       
        {canEdit && (
          <button 
            onClick={() => { setEditingDeal(null); setIsModalOpen(true); }}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors"
          >
            + New Deal
          </button>
        )}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-4 h-full min-w-max">
          {PIPELINE_STAGES.map((stage) => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            // const totalValue = stageDeals.reduce((sum, d) => sum + (d.check_size || 0), 0);
            
            return (
              <div 
                key={stage.id}
                className={`flex flex-col w-72 rounded-lg border-1 ${stage.color} bg-slate-100/50 flex-shrink-0 h-[85vh]`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="p-3 border-b border-slate-200/50">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-slate-700 text-sm">{stage.label}</h3>
                    <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 border border-slate-200">
                      {stageDeals.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {stageDeals.map(deal => (
                    <div
                      key={deal.id}
                      draggable={canEdit}
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onClick={() => openDeal(deal)}
                      className="bg-white p-4 rounded border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-slate-800 text-sm leading-tight mb-1">{deal.name}</h4>
                        {canEdit && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingDeal(deal); setIsModalOpen(true); }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-brand-600 p-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-2 truncate">{deal.company_url}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {deal.round && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800">
                            {deal.round}
                          </span>
                        )}
                         <span className="text-[10px] text-slate-400 ml-auto">
                           {new Date(deal.updated_at || deal.created_at).toLocaleDateString()}
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DealModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingDeal}
      />
    </div>
  );
};

export default Pipeline;
