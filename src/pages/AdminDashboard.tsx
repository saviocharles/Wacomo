import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import StatsGrid from '../components/dashboard/StatsGrid';
import FilterBar from '../components/dashboard/FilterBar';
import Simulator from '../components/whatsapp/Simulator';
import AssignModal from '../components/modals/AssignModal';
import EditCommodityModal from '../components/modals/EditCommodityModal';

const PRIORITY_COLORS: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-700 border border-red-200',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    LOW: 'bg-green-100 text-green-700 border border-green-200',
};

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700',
    ASSIGNED: 'bg-blue-50 text-blue-700',
    COMPLETED: 'bg-green-50 text-green-700',
    UNIDENTIFIED: 'bg-gray-100 text-gray-600',
};

const DEFAULT_FILTERS = { search: '', status: '', priority: '', location: '', dateFrom: '', dateTo: '' };

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>({});
    const [commodities, setCommodities] = useState<any[]>([]);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [assignTarget, setAssignTarget] = useState<any>(null);
    const [editTarget, setEditTarget] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'simulator' | 'master'>('dashboard');

    const fetchStats = useCallback(() => {
        api.get('/dashboard').then(r => setStats(r.data)).catch(() => { });
    }, []);

    const fetchCommodities = useCallback(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
        api.get(`/commodities?${params}`).then(r => setCommodities(r.data)).catch(() => { });
    }, [filters]);

    useEffect(() => {
        fetchStats();
        fetchCommodities();
        const interval = setInterval(() => { fetchStats(); fetchCommodities(); }, 5000);
        return () => clearInterval(interval);
    }, [fetchStats, fetchCommodities]);

    const handleFilterChange = (key: string, value: string) => setFilters(p => ({ ...p, [key]: value }));
    const handleExport = () => { window.open('/api/commodities/export/csv', '_blank'); };
    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-40 px-6 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">📱</span>
                    <div>
                        <h1 className="font-bold text-gray-900 text-lg leading-tight">Commodity Sourcing</h1>
                        <p className="text-xs text-gray-400">WhatsApp Admin Dashboard</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 hidden sm:block">👤 {user?.name} <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-1">{user?.role}</span></span>
                    <button onClick={handleExport} className="text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 flex items-center gap-1">⬇ CSV</button>
                    <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">Logout</button>
                </div>
            </header>

            {/* Nav Tabs */}
            <div className="bg-white border-b px-6 flex gap-0">
                {[['dashboard', '📊 Dashboard'], ['simulator', '📤 Simulate'], ['master', '⚙️ Master Data']].map(([tab, label]) => (
                    <button key={tab} onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            <div className="p-4 md:p-6 max-w-screen-2xl mx-auto">
                {activeTab === 'dashboard' && (
                    <>
                        <StatsGrid stats={stats} />
                        <FilterBar filters={filters} onChange={handleFilterChange} onReset={() => setFilters(DEFAULT_FILTERS)} />

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b flex items-center justify-between">
                                <h2 className="font-semibold text-gray-800">Commodity Requests ({commodities.length})</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                        <tr>
                                            {['Commodity', 'Location', 'Rate', 'Qty', 'Sourcing Update', 'Sender/Group', 'Priority', 'Status', 'Assigned To', 'Deadline', 'Actions'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {commodities.length === 0 && (
                                            <tr><td colSpan={11} className="text-center py-10 text-gray-400">No commodities found. Simulate a WhatsApp message to get started.</td></tr>
                                        )}
                                        {commodities.map((c: any) => {
                                            const asgn = c.assignments?.[0];
                                            const isOverdue = c.deadline && new Date(c.deadline) < new Date() && c.status !== 'COMPLETED';
                                            return (
                                                <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${isOverdue ? 'bg-red-50/40' : ''}`}>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-gray-900">{c.parsedName || '—'}</div>
                                                        <div className="text-xs text-gray-400 truncate max-w-[160px]" title={c.rawMessage}>{c.rawMessage}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">{c.location || '—'}</td>
                                                    <td className="px-4 py-3 text-gray-600">{c.rate ? `₹${c.rate}` : '—'}</td>
                                                    <td className="px-4 py-3 text-gray-600">{c.quantity ? `${c.quantity} ${c.unit || ''}` : '—'}</td>
                                                    <td className="px-4 py-3">
                                                        {asgn && (asgn.updatedRate || asgn.userRemarks) ? (
                                                            <div className="text-xs">
                                                                {asgn.updatedRate && <div className="text-blue-600 font-medium">₹{asgn.updatedRate} ({asgn.updatedQuantity} {c.unit})</div>}
                                                                {asgn.sourceLocation && <div className="text-gray-500">📍 {asgn.sourceLocation}</div>}
                                                                {asgn.userRemarks && <div className="text-gray-400 italic truncate max-w-[120px]" title={asgn.userRemarks}>"{asgn.userRemarks}"</div>}
                                                            </div>
                                                        ) : <span className="text-gray-300">—</span>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-gray-700 text-xs">{c.sender || '—'}</div>
                                                        <div className="text-gray-400 text-xs">{c.groupName || '—'}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[c.priority] || ''}`}>{c.priority}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] || ''}`}>{c.status}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 text-xs">{asgn?.user?.name || '—'}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-600">
                                                        {c.deadline ? (
                                                            <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                                                                {isOverdue ? '⚠️ ' : ''}{new Date(c.deadline).toLocaleDateString()}
                                                            </span>
                                                        ) : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-1">
                                                            {user?.role === 'ADMIN' && (
                                                                <>
                                                                    <button onClick={() => setEditTarget(c)} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">✏️ Edit</button>
                                                                    <button onClick={() => setAssignTarget(c)} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded">👤 Assign</button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'simulator' && (
                    <div className="max-w-xl mx-auto">
                        <Simulator onMessageSent={() => { fetchStats(); fetchCommodities(); }} />
                    </div>
                )}

                {activeTab === 'master' && <MasterDataPanel />}
            </div>

            {assignTarget && (
                <AssignModal
                    commodityId={assignTarget.id}
                    commodityName={assignTarget.parsedName}
                    onClose={() => setAssignTarget(null)}
                    onAssigned={() => { fetchCommodities(); fetchStats(); }}
                />
            )}
            {editTarget && (
                <EditCommodityModal
                    commodity={editTarget}
                    onClose={() => setEditTarget(null)}
                    onUpdated={() => { fetchCommodities(); fetchStats(); }}
                />
            )}
        </div>
    );
};

// Inline Master Data Panel
const MasterDataPanel: React.FC = () => {
    const [tab, setTab] = useState<'users' | 'locations' | 'groups' | 'commodities'>('users');
    const [users, setUsers] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [commodityMaster, setCommodityMaster] = useState<any[]>([]);
    const [newValue, setNewValue] = useState('');
    const [newExtra, setNewExtra] = useState('');

    const load = useCallback(() => {
        api.get('/master/users').then(r => setUsers(r.data));
        api.get('/master/locations').then(r => setLocations(r.data));
        api.get('/master/groups').then(r => setGroups(r.data));
        api.get('/master/commodity-master').then(r => setCommodityMaster(r.data));
    }, []);

    useEffect(() => { load(); }, [load]);

    const add = async () => {
        if (!newValue.trim()) return;
        if (tab === 'locations') await api.post('/master/locations', { name: newValue, state: newExtra });
        else if (tab === 'groups') await api.post('/master/groups', { name: newValue });
        else if (tab === 'commodities') await api.post('/master/commodity-master', { name: newValue, unit: newExtra });
        setNewValue(''); setNewExtra(''); load();
    };

    const del = async (id: string) => {
        if (tab === 'users') await api.delete(`/master/users/${id}`);
        else if (tab === 'locations') await api.delete(`/master/locations/${id}`);
        else if (tab === 'groups') await api.delete(`/master/groups/${id}`);
        else if (tab === 'commodities') await api.delete(`/master/commodity-master/${id}`);
        load();
    };

    const currentData = { users, locations, groups, commodities: commodityMaster }[tab];
    const showAdd = tab !== 'users';

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b p-4 flex gap-2 flex-wrap">
                {[['users', '👥 Users'], ['locations', '📍 Locations'], ['groups', '💬 WA Groups'], ['commodities', '🌾 Commodity Names']].map(([t, l]) => (
                    <button key={t} onClick={() => setTab(t as any)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {l}
                    </button>
                ))}
            </div>

            {showAdd && (
                <div className="p-4 border-b flex gap-2">
                    <input className="border rounded-lg px-3 py-2 text-sm flex-1" placeholder={tab === 'locations' ? 'Location name' : tab === 'groups' ? 'Group name' : 'Commodity name'} value={newValue} onChange={e => setNewValue(e.target.value)} />
                    {tab !== 'groups' && <input className="border rounded-lg px-3 py-2 text-sm w-32" placeholder={tab === 'locations' ? 'State' : 'Unit (kg, MT)'} value={newExtra} onChange={e => setNewExtra(e.target.value)} />}
                    <button onClick={add} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">+ Add</button>
                </div>
            )}

            <div className="divide-y">
                {(currentData as any[]).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                        <div>
                            <div className="font-medium text-sm text-gray-800">{item.name || `${item.email}`}</div>
                            <div className="text-xs text-gray-400">
                                {item.role && <span className="mr-2 bg-gray-100 px-1.5 py-0.5 rounded">{item.role}</span>}
                                {item.state && <span>{item.state}</span>}
                                {item.unit && <span>Unit: {item.unit}</span>}
                                {item.email && <span>{item.email}</span>}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {tab === 'users' && (
                                <button
                                    onClick={async () => {
                                        const newPass = prompt(`Reset password for ${item.name || item.email}:`);
                                        if (newPass) {
                                            try {
                                                await api.put(`/master/users/${item.id}/reset-password`, { newPassword: newPass });
                                                alert('Password reset successful');
                                            } catch (e) { alert('Failed to reset password'); }
                                        }
                                    }}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                                >
                                    🔑 Reset
                                </button>
                            )}
                            <button onClick={() => del(item.id)} className="text-xs text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded">🗑️</button>
                        </div>
                    </div>
                ))}
                {(currentData as any[]).length === 0 && <div className="text-center py-10 text-gray-400 text-sm">No records yet</div>}
            </div>
        </div>
    );
};

export default AdminDashboard;
