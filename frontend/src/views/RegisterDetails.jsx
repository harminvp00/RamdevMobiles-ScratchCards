import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Phone, MapPin, Send, HelpCircle } from 'lucide-react';
import API from '../services/api';
import MobileContainer from '../components/MobileContainer';

const RegisterDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otpToken } = location.state || {};

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // If no email or OTP token was passed in state, go back to verification page
    if (!email || !otpToken) {
      navigate('/verify', { replace: true });
    }
  }, [email, otpToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Indian Mobile Number Validator: starts with 6-9, followed by 9 digits
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setErrorMsg('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    if (name.trim().length < 2) {
      setErrorMsg('Name must be at least 2 characters long.');
      return;
    }

    if (city.trim().length < 2) {
      setErrorMsg('City is required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await API.post('/auth/register', {
        name,
        phone,
        city,
        email,
        otpToken,
      });

      if (res.data.success) {
        // Save customer token and navigate to scratch screen
        localStorage.setItem('customerToken', res.data.token);
        navigate('/scratch', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer hideNav={true}>
      <div className="flex-1 flex flex-col justify-center py-4 space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-wide uppercase font-sans">
            Complete Registration
          </h2>
          <p className="text-xs text-slate-400 max-w-[280px] mx-auto">
            Please fill in your details to claim your scratch card.
          </p>
        </div>

        {/* Input Details Card */}
        <div className="glass-panel p-5 rounded-2xl shadow-xl">
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl text-center font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email Field (Disabled) */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block">
                Verified Email
              </label>
              <div className="p-3 sm:p-4 bg-brand-blue-deep/60 border border-brand-blue-light/30 rounded-xl text-slate-400 text-sm sm:text-base select-none truncate">
                {email}
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-[10px] sm:text-xs text-brand-gold font-bold uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 sm:h-6 sm:w-6" />
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-blue-deep/60 border border-brand-blue-light/50 focus:border-brand-gold rounded-xl py-3 sm:py-4 pl-11 sm:pl-14 pr-4 text-sm sm:text-base text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-[10px] sm:text-xs text-brand-gold font-bold uppercase tracking-wider block">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 sm:h-6 sm:w-6" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  pattern="\d*"
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-brand-blue-deep/60 border border-brand-blue-light/50 focus:border-brand-gold rounded-xl py-3 sm:py-4 pl-11 sm:pl-14 pr-4 text-sm sm:text-base text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* City Field */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-[10px] sm:text-xs text-brand-gold font-bold uppercase tracking-wider block">
                City / Town
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 sm:h-6 sm:w-6" />
                <input
                  type="text"
                  required
                  placeholder="Enter your city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-brand-blue-deep/60 border border-brand-blue-light/50 focus:border-brand-gold rounded-xl py-3 sm:py-4 pl-11 sm:pl-14 pr-4 text-sm sm:text-base text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Callout Notice */}
            <div className="p-3 sm:p-4 bg-brand-blue-deep/40 rounded-xl border border-brand-blue-light/20 flex items-start space-x-2 text-[10px] sm:text-xs text-slate-400">
              <HelpCircle className="text-brand-gold shrink-0 mt-0.5 h-4 w-4 sm:h-5 sm:w-5" />
              <p className="leading-normal">
                One entry per mobile number is strictly enforced. Prizes must be claimed in person by presenting the downloaded voucher code.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !name || !phone || !city}
              className="w-full bg-gradient-to-r from-brand-gold-dark via-brand-gold to-brand-gold-dark text-brand-blue-deep font-bold py-3.5 sm:py-4 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 text-sm sm:text-base"
            >
              <span>{loading ? 'Submitting...' : 'Register & Get Scratch Card'}</span>
              {!loading && <Send className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </form>

        </div>
      </div>
    </MobileContainer>
  );
};

export default RegisterDetails;
