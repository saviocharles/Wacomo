import React, { useState } from 'react';
import api from '../../api';

interface Commodity {
    id: string;
    parsedName: string;
    location: string;
    rate: number;
    quantity: number;
    unit: string;
    status: string;
    priority: string;
    deadline: string;
    remarks: string;
}

interface EditCommodityModalProps {
    commodity: Commodity;
    onClose: () => void;
    onUpdated: () => void;
}

const EditCommodityModal: React.FC<EditCommodityModalProps> = ({ commodity, onClose, onUpdated }) => {
    const [form, setForm] = useState({
        parsedName: commodity.parsedName || '',
        location: commodity.location || '',
        rate: commodity.rate || '',
        quantity: commodity.quantity || '',
        unit: commodity.unit || '',
        status: commodity.status || 'PENDING',
        priority: commodity.priority || 'MEDIUM',
        deadline: commodity.deadline ? commodity.deadline.split('T')[0] : '',
        remarks: commodity.remarks || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setLoading(true);
        setError('');
        try {
            await api.put(`/commodities/${commodity.id}`, {
                ...form,
                rate: form.rate ? parseFloat(String(form.rate)) : null,
                quantity: form.quantity ? parseFloat(String(form.quantity)) : null,
                deadline: form.deadline || null,
            });
            onUpdated();
            onClose();
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.error || 'Failed to save changes. Please check your permissions.');
        } finally {
            setLoading(false);
        }
    };

    const fields: { label: string; key: string; type?: string; options?: string[] }[] = [
        { label: 'Commodity Name', key: 'parsedName' },
        { label: 'Location', key: 'location' },
        { label: 'Expected Rate (₹)', key: 'rate', type: 'number' },
        { label: 'Quantity', key: 'quantity', type: 'number' },
        { label: 'Unit', key: 'unit' },
        { label: 'Status', key: 'status', options: ['PENDING', 'ASSIGNED', 'COMPLETED', 'UNIDENTIFIED'] },
        { label: 'Priority', key: 'priority', options: ['HIGH', 'MEDIUM', 'LOW'] },
        { label: 'Deadline', key: 'deadline', type: 'date' },
        { label: 'Remarks', key: 'remarks' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">Edit Commodity</h3>
                <div className="space-y-3">
                    {fields.map(f => (
                        <div key={f.key}>
                            <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                            {f.options ? (
                                <select
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                    value={(form as any)[f.key]}
                                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                >
                                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            ) : (
                                <input
                                    type={f.type || 'text'}
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                    value={(form as any)[f.key]}
                                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                />
                            )}
                        </div>
                    ))}
                </div>
                {error && <div className="mt-4 p-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{error}</div>}
                <div className="flex gap-3 mt-6">
                    <button onClick={handleSave} disabled={loading} className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default EditCommodityModal;
