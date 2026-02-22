import React from 'react';

interface FilterBarProps {
    filters: {
        search: string;
        status: string;
        priority: string;
        location: string;
        dateFrom: string;
        dateTo: string;
    };
    onChange: (key: string, value: string) => void;
    onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, onReset }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <input
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="🔍 Search message..."
                    value={filters.search}
                    onChange={e => onChange('search', e.target.value)}
                />
                <select
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.status}
                    onChange={e => onChange('status', e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="UNIDENTIFIED">Unidentified</option>
                </select>
                <select
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.priority}
                    onChange={e => onChange('priority', e.target.value)}
                >
                    <option value="">All Priorities</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </select>
                <input
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="📍 Location"
                    value={filters.location}
                    onChange={e => onChange('location', e.target.value)}
                />
                <input
                    type="date"
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.dateFrom}
                    onChange={e => onChange('dateFrom', e.target.value)}
                />
                <input
                    type="date"
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.dateTo}
                    onChange={e => onChange('dateTo', e.target.value)}
                />
            </div>
            <button onClick={onReset} className="mt-3 text-xs text-gray-500 hover:text-red-500 underline">
                Reset Filters
            </button>
        </div>
    );
};

export default FilterBar;
