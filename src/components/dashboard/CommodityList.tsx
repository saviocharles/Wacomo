import React, { useEffect, useState } from 'react';
import api from '../../api';

interface Commodity {
    id: string;
    parsedName: string;
    location: string;
    rate: number;
    quantity: number;
    status: string;
    rawMessage: string;
    createdAt: string;
}

const CommodityList: React.FC = () => {
    const [commodities, setCommodities] = useState<Commodity[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCommodities = async () => {
        try {
            const res = await api.get('/whatsapp');
            setCommodities(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommodities();
        const interval = setInterval(fetchCommodities, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    if (loading && commodities.length === 0) return <div>Loading...</div>;

    return (
        <div className="bg-white p-4 rounded shadow mt-4">
            <h2 className="text-xl font-bold mb-4">Incoming Commodities</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Location
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Rate
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Qty
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {commodities.map((item) => (
                            <tr key={item.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{item.parsedName}</p>
                                    <p className="text-gray-500 text-xs">{item.rawMessage.substring(0, 30)}...</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{item.location || '-'}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{item.rate || '-'}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{item.quantity || '-'}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${item.status === 'PENDING' ? 'text-yellow-900' : 'text-green-900'
                                        }`}>
                                        <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${item.status === 'PENDING' ? 'bg-yellow-200' : 'bg-green-200'
                                            }`}></span>
                                        <span className="relative">{item.status}</span>
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CommodityList;
