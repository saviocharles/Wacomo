import React, { useEffect, useState } from 'react';
import api from '../../api';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AssignModalProps {
    commodityId: string;
    commodityName: string;
    onClose: () => void;
    onAssigned: () => void;
}

const AssignModal: React.FC<AssignModalProps> = ({ commodityId, commodityName, onClose, onAssigned }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [deadline, setDeadline] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/master/users').then(r => setUsers(r.data.filter((u: User) => u.role === 'USER')));
    }, []);

    const handleAssign = async () => {
        if (!selectedUser) return;
        setLoading(true);
        setError('');
        try {
            await api.post('/assignments', { commodityId, userId: selectedUser, deadline: deadline || undefined });
            onAssigned();
            onClose();
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.error || 'Failed to assign commodity. Please check your permissions.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold mb-1">Assign Commodity</h3>
                <p className="text-sm text-gray-500 mb-4">📦 {commodityName}</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                        <select
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedUser}
                            onChange={e => setSelectedUser(e.target.value)}
                        >
                            <option value="">Select User</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (optional)</label>
                        <input
                            type="datetime-local"
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={deadline}
                            onChange={e => setDeadline(e.target.value)}
                        />
                    </div>
                </div>
                {error && <div className="mt-4 p-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{error}</div>}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleAssign}
                        disabled={!selectedUser || loading}
                        className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Assigning...' : 'Assign'}
                    </button>
                    <button onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignModal;
