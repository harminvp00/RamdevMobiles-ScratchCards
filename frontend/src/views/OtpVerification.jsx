import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight, RefreshCw, Edit2, Send, CheckCircle } from 'lucide-react';
import API from '../services/api';
import MobileContainer from '../components/MobileContainer';

const OtpVerification = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Load email if pre-filled
  useEffect(() => {
    // Redirect to scratch if already logged in
    if (localStorage.getItem('customerToken')) {
      navigate('/scratch', { replace: true });
    }
  }, [navigate]);

  // Resend OTP timer tick
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await API.post('/auth/otp/request', { email });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setStep(2);
        setResendTimer(60);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error requesting OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrorMsg('OTP must be exactly 6 digits.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await API.post('/auth/otp/verify', { email, otp });
      if (res.data.success) {
        const { isRegistered, token, otpToken, user } = res.data;
        
        if (isRegistered) {
          // Returning customer: Log in
          localStorage.setItem('customerToken', token);
          navigate('/scratch', { replace: true });
        } else {
          // New customer: Redirect to register form with the temp OTP token
          navigate('/register', { 
            state: { 
              email, 
              otpToken 
            } 
          });
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmail = () => {
    setStep(1);
    setOtp('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col justify-center py-6 space-y-6">
        
        {/* Top Header Logo Banner */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto shadow-lg border border-brand-gold/30">
            <img src="/shop-logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-wide uppercase font-sans">
            Verify Email
          </h2>
          <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
            Verify your email to receive your unique lucky scratch card.
          </p>
        </div>

        {/* Form panel */}
        <div className="glass-panel p-5 rounded-2xl relative shadow-xl">
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl text-center font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl text-center font-medium">
              {successMsg}
            </div>
          )}

          {step === 1 ? (
            /* Step 1: Email Form */
            <form onSubmit={handleRequestOtp} className="space-y-4 sm:space-y-5">
              <div className="space-y-1 sm:space-y-2">
                <label className="text-[10px] sm:text-xs text-brand-gold font-bold uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 sm:h-6 sm:w-6" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    className="w-full bg-brand-blue-deep/60 border border-brand-blue-light/50 focus:border-brand-gold rounded-xl py-3 sm:py-4 pl-11 sm:pl-14 pr-4 text-sm sm:text-base text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-brand-gold-dark via-brand-gold to-brand-gold-dark text-brand-blue-deep font-bold py-3.5 sm:py-4 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 text-sm sm:text-base"
              >
                <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                {!loading && <Send className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </form>
          ) : (
            /* Step 2: OTP Verification Form */
            <form onSubmit={handleVerifyOtp} className="space-y-4 sm:space-y-5">
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] sm:text-xs text-brand-gold font-bold uppercase tracking-wider block">
                    Enter 6-Digit OTP
                  </label>
                  <button
                    type="button"
                    onClick={handleEditEmail}
                    className="text-[10px] text-slate-400 flex items-center space-x-1 hover:text-brand-gold"
                  >
                    <Edit2 size={10} />
                    <span>Change Email</span>
                  </button>
                </div>
                
                <div className="p-2.5 bg-brand-blue-deep/40 rounded-lg border border-brand-blue-light/30 flex items-center justify-between text-xs text-slate-300 mb-2">
                  <span className="truncate">{email}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase shrink-0 ml-2">Sent</span>
                </div>

                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 sm:h-6 sm:w-6" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="\d*"
                    placeholder="0 0 0 0 0 0"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-brand-blue-deep/60 border border-brand-blue-light/50 focus:border-brand-gold rounded-xl py-3 sm:py-4 pl-11 sm:pl-14 pr-4 text-sm sm:text-base tracking-[0.25em] text-center font-mono font-bold text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-brand-gold-dark via-brand-gold to-brand-gold-dark text-brand-blue-deep font-bold py-3.5 sm:py-4 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 text-sm sm:text-base"
              >
                <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                {!loading && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>

              <div className="text-center pt-2">
                {resendTimer > 0 ? (
                  <p className="text-[11px] text-slate-400">
                    Resend OTP in <strong className="text-brand-gold">{resendTimer}s</strong>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={loading}
                    className="text-xs text-brand-gold font-bold hover:underline flex items-center justify-center space-x-1.5 mx-auto active:scale-95 transition-all"
                  >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>
            </form>
          )}

        </div>
      </div>
    </MobileContainer>
  );
};

export default OtpVerification;
