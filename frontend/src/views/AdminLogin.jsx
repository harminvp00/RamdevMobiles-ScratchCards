import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight } from 'lucide-react';
import API from '../services/api';
import MobileContainer from '../components/MobileContainer';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // If admin is already logged in, redirect to admin dashboard
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await API.post('/admin/login', { username, password });
      if (res.data.success) {
        localStorage.setItem('adminToken', res.data.token);
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer hideNav={true}>
      <div className="flex-1 flex flex-col justify-center py-6 space-y-6">
        
        {/* Admin Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-brand-blue-navy border-2 border-brand-gold rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Lock className="text-brand-gold" size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-wide uppercase font-sans">
            Admin Portal
          </h2>
          <p className="text-xs text-slate-400 max-w-[280px] mx-auto">
            Authorized Personnel Only
          </p>
        </div>

        {/* Login form */}
        <div className="glass-panel p-5 rounded-2xl relative shadow-xl">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl text-center font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-xs text-brand-gold font-semibold uppercase tracking-wider block">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-brand-blue-deep/60 border border-brand-blue-light/50 focus:border-brand-gold rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-xs text-brand-gold font-semibold uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-blue-deep/60 border border-brand-blue-light/50 focus:border-brand-gold rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-gradient-to-r from-brand-gold-dark via-brand-gold to-brand-gold-dark text-brand-blue-deep font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{loading ? 'Logging In...' : 'Verify Admin Credentials'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

        </div>
      </div>
    </MobileContainer>
  );
};

export default AdminLogin;
