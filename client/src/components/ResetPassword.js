import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { resetToken } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);

        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/reset-password/${resetToken}`, {
                password
            });
            toast.success(response.data.message);
            navigate('/login');
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error(error.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light" style={{ fontFamily: 'inherit' }}>
            <div className="card shadow rounded-4 p-4" style={{ maxWidth: 400, width: '100%', border: 'none' }}>
                <div className="mb-4 text-center">
                    <h2 className="fw-bold mb-2" style={{ color: '#111' }}>Reset Password</h2>
                    <p className="text-muted mb-0">Please enter your new password</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label fw-medium">New Password</label>
                        <div className="input-group">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="form-control rounded-3 border-dark-subtle py-2 px-3"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ fontSize: 16 }}
                            />
                            <button
                                type="button"
                                className="input-group-text bg-white border-0"
                                style={{ cursor: 'pointer', color: '#c4a03c' }}
                                tabIndex={-1}
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="form-label fw-medium">Confirm Password</label>
                        <div className="input-group">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                className="form-control rounded-3 border-dark-subtle py-2 px-3"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{ fontSize: 16 }}
                            />
                            <button
                                type="button"
                                className="input-group-text bg-white border-0"
                                style={{ cursor: 'pointer', color: '#c4a03c' }}
                                tabIndex={-1}
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn w-100 py-2 fw-bold text-white"
                        style={{ background: '#111', borderRadius: '2rem', fontSize: 16, letterSpacing: 1 }}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword; 