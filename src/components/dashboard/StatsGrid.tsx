interface Stat {
    label: string;
    value: number | string;
    color: string;
    icon: string;
}

interface StatsGridProps {
    stats: {
        total: number;
        pending: number;
        assigned: number;
        completed: number;
        high: number;
        overdue: number;
    };
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
    const items: Stat[] = [
        { label: 'Total', value: stats.total, color: 'bg-blue-100 text-blue-800', icon: '📦' },
        { label: 'Pending', value: stats.pending, color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
        { label: 'Assigned', value: stats.assigned, color: 'bg-indigo-100 text-indigo-800', icon: '👤' },
        { label: 'Completed', value: stats.completed, color: 'bg-green-100 text-green-800', icon: '✅' },
        { label: 'High Priority', value: stats.high, color: 'bg-red-100 text-red-800', icon: '🔴' },
        { label: 'Overdue', value: stats.overdue, color: 'bg-orange-100 text-orange-800', icon: '⚠️' },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {items.map(item => (
                <div key={item.label} className={`rounded-xl p-4 ${item.color} shadow-sm flex flex-col items-center justify-center text-center`}>
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-2xl font-bold">{item.value}</div>
                    <div className="text-xs font-medium mt-1 opacity-80">{item.label}</div>
                </div>
            ))}
        </div>
    );
};

export default StatsGrid;
