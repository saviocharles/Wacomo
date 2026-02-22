import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const STATUS_OPTIONS = ['ASSIGNED', 'WORK_IN_PROGRESS', 'COMPLETED'];

const UserDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [editId, setEditId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [saving, setSaving] = useState(false);

    const fetch = useCallback(() => {
        api.get('/assignments').then(r => setAssignments(r.data));
    }, []);

    useEffect(() => { fetch(); const i = setInterval(fetch, 5000); return () => clearInterval(i); }, [fetch]);

    const startEdit = (asgn: any) => {
        setEditId(asgn.id);
        setEditForm({
            status: asgn.status,
            userRemarks: asgn.userRemarks || '',
            updatedRate: asgn.updatedRate || '',
            updatedQuantity: asgn.updatedQuantity || '',
            sourceLocation: asgn.sourceLocation || '',
        });
    };

    const saveEdit = async (id: string) => {
        setSaving(true);
        try {
            await api.put(`/assignments/${id}`, {
                ...editForm,
                updatedRate: editForm.updatedRate ? parseFloat(editForm.updatedRate) : null,
                updatedQuantity: editForm.updatedQuantity ? parseFloat(editForm.updatedQuantity) : null,
            });
            setEditId(null);
            fetch();
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const PRIORITY_COLORS: Record<string, string> = {
        HIGH: 'bg-red-100 text-red-700',
        MEDIUM: 'bg-yellow-100 text-yellow-700',
        LOW: 'bg-green-100 text-green-700',
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">📱</span>
                    <div>
                        <h1 className="font-bold text-gray-900 text-lg">My Assignments</h1>
                        <p className="text-xs text-gray-400">Commodity Sourcing</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 hidden sm:block">👤 {user?.name}</span>
                    <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-500 hover:text-red-700">Logout</button>
                </div>
            </header>

            <div className="p-4 md:p-6 max-w-4xl mx-auto">
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                    <span>📦 {assignments.length} assigned commodit{assignments.length !== 1 ? 'ies' : 'y'}</span>
                    <span className="ml-auto text-xs text-green-600 animate-pulse">⟳ Auto-refreshing</span>
                </div>

                {assignments.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
                        <div className="text-5xl mb-4">📭</div>
                        <p className="font-medium">No assignments yet</p>
                        <p className="text-xs mt-1">Your admin will assign commodities to you shortly.</p>
                    </div>
                )}

                <div className="space-y-4">
                    {assignments.map((asgn: any) => {
                        const c = asgn.commodity;
                        const isEditing = editId === asgn.id;
                        const isOverdue = asgn.deadline && new Date(asgn.deadline) < new Date() && asgn.status !== 'COMPLETED';

                        return (
                            <div key={asgn.id} className={`bg-white rounded-xl shadow-sm border ${isOverdue ? 'border-red-300' : 'border-gray-100'} overflow-hidden`}>
                                {/* Header */}
                                <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-800">{c?.parsedName || 'Unidentified'}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[c?.priority]}`}>{c?.priority}</span>
                                        {isOverdue && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">⚠️ Overdue</span>}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${asgn.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            asgn.status === 'WORK_IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {asgn.status.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Original Info */}
                                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm border-b">
                                    <div><p className="text-xs text-gray-400">Location</p><p className="font-medium">{c?.location || '—'}</p></div>
                                    <div><p className="text-xs text-gray-400">Rate (₹)</p><p className="font-medium">{c?.rate || '—'}</p></div>
                                    <div><p className="text-xs text-gray-400">Quantity</p><p className="font-medium">{c?.quantity ? `${c.quantity} ${c?.unit || ''}` : '—'}</p></div>
                                    <div><p className="text-xs text-gray-400">Deadline</p><p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>{asgn.deadline ? new Date(asgn.deadline).toLocaleDateString() : '—'}</p></div>
                                </div>

                                {/* Raw message */}
                                <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-b italic">"{c?.rawMessage}"</div>

                                {/* Update form */}
                                {isEditing ? (
                                    <div className="p-4 space-y-3">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-xs text-gray-500">Status</label>
                                                <select className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1"
                                                    value={editForm.status} onChange={e => setEditForm((p: any) => ({ ...p, status: e.target.value }))}>
                                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Available Rate (₹)</label>
                                                <input type="number" className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1"
                                                    value={editForm.updatedRate} onChange={e => setEditForm((p: any) => ({ ...p, updatedRate: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Available Qty</label>
                                                <input type="number" className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1"
                                                    value={editForm.updatedQuantity} onChange={e => setEditForm((p: any) => ({ ...p, updatedQuantity: e.target.value }))} />
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="text-xs text-gray-500">Source Location</label>
                                                <input className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1"
                                                    value={editForm.sourceLocation} onChange={e => setEditForm((p: any) => ({ ...p, sourceLocation: e.target.value }))} />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-gray-500">Remarks</label>
                                                <textarea className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1" rows={2}
                                                    value={editForm.userRemarks} onChange={e => setEditForm((p: any) => ({ ...p, userRemarks: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => saveEdit(asgn.id)} disabled={saving} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                                                {saving ? 'Saving...' : 'Save Update'}
                                            </button>
                                            <button onClick={() => setEditId(null)} className="border px-4 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            {asgn.userRemarks && <p>💬 {asgn.userRemarks}</p>}
                                            {asgn.updatedRate && <p>Rate: ₹{asgn.updatedRate} | Qty: {asgn.updatedQuantity}</p>}
                                            {!asgn.userRemarks && !asgn.updatedRate && <p className="text-xs text-gray-400">No updates yet</p>}
                                        </div>
                                        <button onClick={() => startEdit(asgn)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">
                                            ✍️ Update
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
