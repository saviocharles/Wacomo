import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: Reset
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            setStep(2);
            setMessage('A reset code 123456 has been simulated for your email.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/reset-password', { email, code, newPassword });
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid code or error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
                <div className="text-center mb-6">
                    <div className="text-5xl mb-3">🔑</div>
                    <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {step === 1 ? 'Enter your email to receive instructions' : 'Enter the code and your new password'}
                    </p>
                </div>

                {message && <div className="mb-4 bg-green-50 text-green-700 text-xs p-3 rounded-lg border border-green-100">{message}</div>}
                {error && <div className="mb-4 bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100">{error}</div>}

                {step === 1 ? (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Reset Code</label>
                            <input
                                className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="123456"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">New Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <p className="text-center text-sm text-gray-500 mt-4">
                    Remembered? <Link to="/login" className="text-blue-600 hover:underline font-medium">Back to Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
