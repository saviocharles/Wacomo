import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/register', form);
            login(response.data.token, response.data.user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
                <div className="text-center mb-6">
                    <div className="text-5xl mb-3">📱</div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-sm text-gray-500 mt-1">Join the Commodity Sourcing System</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },
                        { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
                        { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
                        { label: 'Phone (optional)', key: 'phone', type: 'tel', placeholder: '+91 XXXXX XXXXX' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="text-sm font-medium text-gray-700 block mb-1">{f.label}</label>
                            <input
                                type={f.type}
                                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder={f.placeholder}
                                value={(form as any)[f.key]}
                                onChange={e => update(f.key, e.target.value)}
                                required={f.key !== 'phone'}
                            />
                        </div>
                    ))}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Role</label>
                        <select
                            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={form.role}
                            onChange={e => update('role', e.target.value)}
                        >
                            <option value="USER">User (Sourcing Agent)</option>
                            <option value="ADMIN">Admin</option>
                            <option value="VIEWER">Viewer (Read Only)</option>
                        </select>
                    </div>
                    {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Already have an account? <Link to="/login" className="text-green-600 hover:underline font-medium">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
