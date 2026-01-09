import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Deal, Memo, MemoVersion, Activity, MemoSection } from '../types';
import { Role } from '../types';
import { MEMO_SECTIONS } from '../constants';
import { useAuth } from '../context/AuthContext';

const MemoViewer: React.FC = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [memo, setMemo] = useState<Memo | null>(null);
  const [versions, setVersions] = useState<MemoVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<MemoSection>({
    summary: '', market: '', product: '', traction: '', risks: '', open_questions: ''
  });

  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<any>(null);
  const [newComment, setNewComment] = useState('');

  const fetchData = useCallback(async () => {
    if (!dealId) return;
    setLoading(true);
    try {
      const dId = parseInt(dealId);
      const [dealData, activityData] = await Promise.all([
        api.getDeals().then(ds => ds.find((d: any) => d.id === dId)), // Mocking getDealById via list for now if strictly following spec
        api.getDealActivities(dId)
      ]);
      setDeal(dealData);
      setActivities(activityData);
      
      // Check if user has voted
      if (dealData) {
        try {
          const vote = await api.getUserVote(dId);
          setUserVote(vote);
        } catch (e) {
          // User hasn't voted or error - setUserVote stays null
        }
      }

      // Try get memo
      try {
        const memoData = await api.getMemoByDeal(dId);
        setMemo(memoData);
        // Backend returns fields directly, not wrapped in content
        setFormData({
          summary: memoData.summary || '',
          market: memoData.market || '',
          product: memoData.product || '',
          traction: memoData.traction || '',
          risks: memoData.risks || '',
          open_questions: memoData.open_questions || ''
        });
        
        const versionsData = await api.getMemoVersions(memoData.id);
        setVersions(versionsData);
      } catch (e) {
        // No memo exists yet
        setMemo(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dealId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!dealId) return;
    try {
      if (memo) {
        // Backend expects fields directly, not wrapped in content
        await api.updateMemo(memo.id, formData);
      } else {
        // Backend expects deal_id + individual fields
        await api.createMemo({ deal_id: parseInt(dealId), ...formData });
      }
      setEditMode(false);
      fetchData(); // Refresh to get new version ID
    } catch (err) {
      alert("Failed to save memo");
    }
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vId = Number(e.target.value);
    setSelectedVersionId(vId === -1 ? null : vId);
  };

  // Helper to convert memo/version to MemoSection
  const toMemoSection = (data: Memo | MemoVersion | undefined): MemoSection | undefined => {
    if (!data) return undefined;
    return {
      summary: data.summary || '',
      market: data.market || '',
      product: data.product || '',
      traction: data.traction || '',
      risks: data.risks || '',
      open_questions: data.open_questions || ''
    };
  };

  // Determine what content to show
  const displayContent = selectedVersionId 
    ? toMemoSection(versions.find(v => v.id === selectedVersionId))
    : editMode ? formData : toMemoSection(memo || undefined);

  const canEdit = (user?.role === Role.ADMIN || user?.role === Role.ANALYST) && !selectedVersionId;
  const isPartnerRole = user?.role === Role.PARTNER;

  const handleComment = async () => {
    if (!dealId || !newComment.trim()) return;
    try {
      await api.addComment(parseInt(dealId), newComment);
      setNewComment('');
      fetchData(); // Refresh activities
    } catch (err) {
      alert("Failed to add comment");
    }
  };

  const handleVote = async () => {
    if (!dealId) return;
    try {
      await api.voteOnDeal(parseInt(dealId));
      setUserVote({ id: 1 }); // Mark as voted
      fetchData(); // Refresh activities
    } catch (err: any) {
      alert(err.message || "Failed to vote");
    }
  };

  const handleApprove = async () => {
    if (!dealId) return;
    if (!confirm("Are you sure you want to approve this deal?")) return;
    try {
      const updatedDeal = await api.approveDeal(parseInt(dealId));
      if (deal) setDeal({ ...deal, status: updatedDeal.status });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to approve deal");
    }
  };

  const handleDecline = async () => {
    if (!dealId) return;
    if (!confirm("Are you sure you want to decline this deal?")) return;
    try {
      const updatedDeal = await api.declineDeal(parseInt(dealId));
      if (deal) setDeal({ ...deal, status: updatedDeal.status });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to decline deal");
    }
  };

  if (loading) return <div className="p-8">Loading Deal Context...</div>;
  if (!deal) return <div className="p-8">Deal not found</div>;

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <button onClick={() => navigate('/')} className="text-slate-400 hover:text-brand-600 text-sm">&larr; Pipeline</button>
             <span className="text-slate-300">|</span>
             <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{deal.stage}</span>
           </div>
           <h1 className="text-3xl font-bold text-slate-900">{deal.name}</h1>
           <a href={deal.company_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline text-sm">{deal.company_url}</a>
        </div>
        <div className="text-right text-sm text-slate-500">
           <p>Owned by <span className="font-medium text-slate-800">User #{deal.owner_id}</span></p>
           <p className="mt-1">Est. Check: <span className="font-mono text-slate-800">${deal.check_size?.toLocaleString()}</span></p>
        </div>
      </div>

      <div className="flex gap-6 h-[75vh] min-h-0">
        {/* Memo Editor/Viewer */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center sticky top-0 z-10">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Investment Memo
            </h2>
            
            <div className="flex items-center gap-3">
              {/* Version Selector */}
              <div className="flex items-center gap-2 text-sm">
                 <span className="text-slate-500">History:</span>
                 <select 
                   className="border border-slate-300 rounded px-2 py-1 text-slate-700 bg-white focus:ring-brand-500"
                   value={selectedVersionId || -1}
                   onChange={handleVersionChange}
                 >
                   <option value={-1}>Current (Latest)</option>
                  {versions.map(v => (
                    <option key={v.id} value={v.id}>v{v.version_number} - {new Date(v.created_at).toLocaleString()}</option>
                  ))}
                 </select>
              </div>

              {canEdit && !editMode && (
                <button 
                  onClick={() => setEditMode(true)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 text-sm font-medium"
                >
                  Edit Memo
                </button>
              )}
              {editMode && (
                <>
                  <button 
                    onClick={() => { 
                      setEditMode(false); 
                      // Reset formData to memo's current state
                      if (memo) {
                        setFormData({
                          summary: memo.summary || '',
                          market: memo.market || '',
                          product: memo.product || '',
                          traction: memo.traction || '',
                          risks: memo.risks || '',
                          open_questions: memo.open_questions || ''
                        });
                      }
                    }}
                    className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-3 py-1.5 bg-brand-600 text-white rounded hover:bg-brand-700 text-sm font-medium shadow-sm"
                  >
                    Save Version
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {MEMO_SECTIONS.map((section) => (
              <div key={section.key} className="space-y-2">
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-1">
                  {section.label}
                </label>
                {editMode ? (
                  <textarea
                    className="w-full min-h-[120px] p-3 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-700 text-sm leading-relaxed"
                    value={formData[section.key as keyof MemoSection] || ''}
                    onChange={(e) => setFormData({...formData, [section.key as keyof MemoSection]: e.target.value})}
                    placeholder={`Enter ${section.label.toLowerCase()}... (Markdown supported)`}
                  />
                ) : (
                  <div className="prose prose-sm max-w-none text-slate-600">
                    {displayContent?.[section.key as keyof MemoSection] ? (
                       <div className="whitespace-pre-wrap">{displayContent[section.key as keyof MemoSection]}</div>
                    ) : (
                       <p className="text-slate-400 italic">No content provided.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Activity Log & Partner Actions */}
        <div className="w-80 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
           {isPartnerRole && (
             <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3 flex-shrink-0">
               <h3 className="font-semibold text-slate-800 text-sm">Partner Actions</h3>
               
               {/* Vote Button */}
               {!userVote && (
                 <button
                   onClick={handleVote}
                   className="w-full px-3 py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                 >
                   Vote on Deal
                 </button>
               )}
               {userVote && (
                 <div className="px-3 py-2 bg-green-50 text-green-700 rounded text-xs text-center">
                   ✓ You have voted
                 </div>
               )}

               {/* Approve/Decline Buttons */}
               {deal && deal.status === 'active' && (
                 <div className="flex gap-2">
                   <button
                     onClick={handleApprove}
                     className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                   >
                     Approve
                   </button>
                   <button
                     onClick={handleDecline}
                     className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
                   >
                     Decline
                   </button>
                 </div>
               )}

               {/* Deal Status */}
               {deal && deal.status !== 'active' && (
                 <div className={`px-3 py-2 rounded text-xs text-center font-medium ${
                   deal.status === 'approved' ? 'bg-green-100 text-green-700' :
                   deal.status === 'declined' ? 'bg-red-100 text-red-700' :
                   'bg-gray-100 text-gray-700'
                 }`}>
                   Status: {deal.status.toUpperCase()}
                 </div>
               )}

               {/* Comment Input */}
               <div className="space-y-2">
                 <textarea
                   value={newComment}
                   onChange={(e) => setNewComment(e.target.value)}
                   placeholder="Add a comment..."
                   className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded resize-none"
                   rows={2}
                 />
                 <button
                   onClick={handleComment}
                   disabled={!newComment.trim()}
                   className="w-full px-3 py-1.5 bg-slate-600 text-white rounded text-xs font-medium hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                 >
                   Add Comment
                 </button>
               </div>
             </div>
           )}

           <div className="p-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
             <h3 className="font-semibold text-slate-800 text-sm">Activity Log</h3>
           </div>
           <div className="flex-1 overflow-y-auto p-4 min-h-0">
              <ul className="space-y-4">
                {activities.length === 0 && <p className="text-xs text-slate-400 text-center">No activity recorded.</p>}
                {activities.map(act => (
                  <li key={act.id} className="relative pl-4 border-l-2 border-slate-200 pb-1">
                     <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white"></div>
                     <p className="text-xs text-slate-800">{act.description}</p>
                     <p className="text-[10px] text-slate-400 mt-0.5">{new Date(act.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MemoViewer;
