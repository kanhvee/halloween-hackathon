import { useState, useEffect } from 'react';
import {
  Loader2, ShieldCheck, UserCheck, UserX, AlertTriangle,
  Check, X, Clock, MessageSquare, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Cook, Complaint } from '@/types';

export default function AdminDashboard() {
  const [cooks, setCooks] = useState<Cook[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'cooks' | 'complaints'>('cooks');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [cooksRes, complaintsRes] = await Promise.all([
      supabase.from('cooks').select('*').order('created_at', { ascending: false }),
      supabase.from('complaints').select('*').order('created_at', { ascending: false }),
    ]);
    setCooks(cooksRes.data || []);
    setComplaints(complaintsRes.data || []);
    setLoading(false);
  }

  async function approveCook(cookId: string) {
    await supabase.from('cooks').update({ approved: true }).eq('id', cookId);
    setCooks(cooks.map((c) => c.id === cookId ? { ...c, approved: true } : c));
    setActionMsg('Cook approved successfully');
    setTimeout(() => setActionMsg(''), 3000);
  }

  async function rejectCook(cookId: string) {
    const { error } = await supabase.from('cooks').delete().eq('id', cookId);
    if (!error) {
      setCooks(cooks.filter((c) => c.id !== cookId));
      setActionMsg('Cook application rejected');
      setTimeout(() => setActionMsg(''), 3000);
    }
  }

  async function resolveComplaint(complaintId: string) {
    if (!responseText.trim()) return;
    await supabase.from('complaints').update({
      status: 'resolved',
      admin_response: responseText,
    }).eq('id', complaintId);

    setComplaints(complaints.map((c) =>
      c.id === complaintId ? { ...c, status: 'resolved', admin_response: responseText } : c
    ));
    setRespondingTo(null);
    setResponseText('');
    setActionMsg('Complaint resolved');
    setTimeout(() => setActionMsg(''), 3000);
  }

  const pendingCooks = cooks.filter((c) => !c.approved);
  const approvedCooks = cooks.filter((c) => c.approved);
  const openComplaints = complaints.filter((c) => c.status === 'open');
  const resolvedComplaints = complaints.filter((c) => c.status === 'resolved');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-orange-600" />
          Admin Panel
        </h1>
        <p className="text-sm text-gray-500 mt-1">Approve cooks and manage customer complaints</p>
      </div>

      {actionMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
          <Check className="w-4 h-4" /> {actionMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStat icon={UserCheck} label="Approved Cooks" value={approvedCooks.length} color="bg-green-50 text-green-600" />
        <AdminStat icon={Clock} label="Pending Approvals" value={pendingCooks.length} color="bg-amber-50 text-amber-600" />
        <AdminStat icon={AlertTriangle} label="Open Complaints" value={openComplaints.length} color="bg-red-50 text-red-600" />
        <AdminStat icon={MessageSquare} label="Resolved" value={resolvedComplaints.length} color="bg-blue-50 text-blue-600" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setTab('cooks')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'cooks' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Cook Approvals {pendingCooks.length > 0 && `(${pendingCooks.length})`}
        </button>
        <button
          onClick={() => setTab('complaints')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'complaints' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Complaints {openComplaints.length > 0 && `(${openComplaints.length})`}
        </button>
      </div>

      {tab === 'cooks' && (
        <div className="space-y-6">
          {pendingCooks.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Pending Approval
              </h2>
              <div className="space-y-3">
                {pendingCooks.map((cook) => (
                  <div key={cook.id} className="bg-white rounded-2xl shadow-sm border border-amber-200 p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{cook.name}</h3>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pending</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span>{cook.area}</span>
                        <span>•</span>
                        <span>{cook.cuisine}</span>
                        <span>•</span>
                        <span>₹{cook.price_weekly}/wk</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{cook.bio}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => approveCook(cook.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => rejectCook(cook.id)}
                        className="bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Approved Cooks ({approvedCooks.length})
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3 hidden sm:table-cell">Area</th>
                    <th className="px-5 py-3 hidden md:table-cell">Cuisine</th>
                    <th className="px-5 py-3">Subs</th>
                    <th className="px-5 py-3">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {approvedCooks.map((cook) => (
                    <tr key={cook.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900 text-sm">{cook.name}</td>
                      <td className="px-5 py-3 text-sm text-gray-500 hidden sm:table-cell">{cook.area}</td>
                      <td className="px-5 py-3 text-sm text-gray-500 hidden md:table-cell">{cook.cuisine}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{cook.total_subscribers}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{cook.rating.toFixed(1)}★</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'complaints' && (
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No complaints to show.</p>
            </div>
          ) : (
            complaints.map((complaint) => {
              const cook = cooks.find((c) => c.id === complaint.cook_id);
              const isOpen = complaint.status === 'open';
              const isResponding = respondingTo === complaint.id;
              return (
                <div
                  key={complaint.id}
                  className={`bg-white rounded-2xl shadow-sm border p-5 ${
                    isOpen ? 'border-red-100' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{complaint.subject}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          complaint.status === 'open' ? 'bg-red-100 text-red-700' :
                          complaint.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {complaint.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        By {complaint.customer_name}
                        {cook && ` • against ${cook.name}`}
                        {' • '} {new Date(complaint.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{complaint.description}</p>

                      {complaint.admin_response && (
                        <div className="mt-3 bg-green-50 border border-green-100 rounded-xl p-3">
                          <div className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Admin Response
                          </div>
                          <p className="text-sm text-green-800">{complaint.admin_response}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {isOpen && !complaint.admin_response && (
                    <div className="mt-3">
                      {isResponding ? (
                        <div className="space-y-2">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Write your response to the customer..."
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => resolveComplaint(complaint.id)}
                              disabled={!responseText.trim()}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                            >
                              Resolve & Respond
                            </button>
                            <button
                              onClick={() => { setRespondingTo(null); setResponseText(''); }}
                              className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespondingTo(complaint.id)}
                          className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
                        >
                          Respond & Resolve <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function AdminStat({ icon: Icon, label, value, color }: { icon: typeof ShieldCheck; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
