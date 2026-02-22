import React, { useState } from 'react';
import api from '../../api';

interface SimulatorProps {
    onMessageSent?: () => void;
}

const SAMPLE_MESSAGES = [
    'Need 50 tons Wheat in Mumbai at 2500',
    'Buy 100 quintal Rice from Delhi at 3800',
    'Require 20 MT Soybean in Indore at 4200 per quintal',
    'Urgent: 500 kg Maize in Pune @ 2100',
    'Looking for 30 tons Sugar in Chennai rate 3500',
];

const Simulator: React.FC<SimulatorProps> = ({ onMessageSent }) => {
    const [message, setMessage] = useState('');
    const [sender, setSender] = useState('');
    const [groupName, setGroupName] = useState('');
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        setLoading(true);
        try {
            const res = await api.post('/whatsapp', {
                message,
                sender: sender || 'Simulator User',
                groupName: groupName || 'Commodity Group'
            });
            setResponse(res.data);
            setMessage('');
            if (onMessageSent) onMessageSent();
        } catch (err) {
            setResponse({ error: 'Failed to send message' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* WhatsApp-like Header */}
            <div className="bg-green-600 text-white px-4 py-3 flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                    <p className="font-semibold text-sm">WhatsApp Simulator</p>
                    <p className="text-xs text-green-200">Simulate incoming group messages</p>
                </div>
            </div>

            <div className="p-4">
                <form onSubmit={sendMessage} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Sender Name</label>
                            <input
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                placeholder="e.g. Rajesh Kumar"
                                value={sender}
                                onChange={e => setSender(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Group Name</label>
                            <input
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                placeholder="e.g. Commodity India"
                                value={groupName}
                                onChange={e => setGroupName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Message</label>
                        <textarea
                            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                            rows={3}
                            placeholder="Type commodity message..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            required
                        />
                    </div>

                    {/* Sample messages */}
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Quick samples:</p>
                        <div className="flex flex-wrap gap-1">
                            {SAMPLE_MESSAGES.map(sm => (
                                <button key={sm} type="button" onClick={() => setMessage(sm)}
                                    className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded hover:bg-green-100">
                                    {sm.substring(0, 30)}...
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? '⏳ Sending...' : '📤 Send Message'}
                    </button>
                </form>

                {response && (
                    <div className={`mt-4 p-3 rounded-lg text-xs ${response.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'}`}>
                        {response.error ? (
                            <p>❌ {response.error}</p>
                        ) : (
                            <div>
                                <p className="font-semibold mb-1">✅ Parsed Successfully:</p>
                                <p>📦 Commodity: <strong>{response.data?.parsedName}</strong></p>
                                <p>📍 Location: <strong>{response.parsed?.location || '—'}</strong></p>
                                <p>💰 Rate: <strong>{response.parsed?.rate ? `₹${response.parsed.rate}` : '—'}</strong></p>
                                <p>⚖️ Quantity: <strong>{response.parsed?.quantity ? `${response.parsed.quantity} ${response.parsed?.unit || ''}` : '—'}</strong></p>
                                <p>🟡 Status: <strong>{response.data?.status}</strong></p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Simulator;
