import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import MobileContainer from '../components/MobileContainer';

const OtpVerification = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Redirect to scratch if already logged in
    if (localStorage.getItem('customerToken')) {
      navigate('/scratch', { replace: true });
    }
  }, [navigate]);

  const handleCredentialResponse = async (response) => {
    const idToken = response.credential;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await API.post('/auth/google', { idToken });
      if (res.data.success) {
        localStorage.setItem('customerToken', res.data.token);
        navigate('/scratch', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    /* global google */
    const initializeGoogleSignIn = () => {
      if (window.google) {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          {
            theme: 'filled_blue',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: 280,
          }
        );
      } else {
        setTimeout(initializeGoogleSignIn, 100);
      }
    };

    initializeGoogleSignIn();
  }, []);

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col justify-center py-6 space-y-6">
        
        {/* Top Header Logo Banner */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto shadow-lg border border-brand-gold/30">
            <img src="/shop-logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-wide uppercase font-sans">
            Lucky Scratch & Win
          </h2>
          <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
            Log in with your Google account to claim your lucky scratch card.
          </p>
        </div>

        {/* Form panel */}
        <div className="glass-panel p-6 rounded-2xl relative shadow-xl flex flex-col items-center space-y-4">
          
          {errorMsg && (
            <div className="w-full p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl text-center font-medium">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div key="loading-spinner" className="py-6 flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-brand-gold font-semibold uppercase tracking-wider">Verifying Account...</p>
            </div>
          ) : (
            <div key="google-btn-wrapper" className="py-4 flex justify-center w-full">
              <div id="google-signin-btn" className="w-full flex justify-center"></div>
            </div>
          )}

          <div className="text-[10px] text-slate-500 text-center max-w-[240px] leading-tight">
            By continuing, you agree to our Terms & Conditions. One card per Google account.
          </div>

        </div>
      </div>
    </MobileContainer>
  );
};

export default OtpVerification;

