import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import MobileContainer from '../components/MobileContainer';

const Landing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [endedInfo, setEndedInfo] = useState(false);

  useEffect(() => {
    const checkCampaign = async () => {
      try {
        const res = await API.get('/campaign/status');
        const { status } = res.data;

        if (status === 'coming_soon') {
          navigate('/coming-soon', { replace: true });
        } else if (status === 'paused') {
          setErrorMsg('The Lucky Scratch promotion is temporarily paused. Please check back soon!');
          setLoading(false);
        } else if (status === 'ended') {
          setEndedInfo(true);
          setLoading(false);
        } else if (status === 'active') {
          // If customer is already authenticated, take them to scratch page
          const token = localStorage.getItem('customerToken');
          if (token) {
            navigate('/scratch', { replace: true });
          } else {
            navigate('/verify', { replace: true });
          }
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Unable to connect to server. Please check your network connection.');
        setLoading(false);
      }
    };

    checkCampaign();
  }, [navigate]);

  if (loading) {
    return (
      <MobileContainer hideNav={true}>
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-300 font-medium">Connecting to Campaign...</p>
        </div>
      </MobileContainer>
    );
  }

  if (endedInfo) {
    return (
      <MobileContainer hideNav={true}>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6">
          <div className="w-20 h-20 bg-brand-gold/10 border-2 border-brand-gold rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl">🎁</span>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-brand-gold gold-shimmer uppercase tracking-wide">
              Campaign Ended
            </h2>
            <p className="text-sm text-slate-300 mt-3 font-sans leading-relaxed">
              All Scratch Cards Have Been Claimed.<br />
              Thank You for your participation!
            </p>
          </div>
          <div className="w-full pt-6">
            <button
              onClick={() => navigate('/winners')}
              className="w-full bg-brand-blue-navy border border-brand-gold/40 text-brand-gold font-bold py-3 px-6 rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              View Winners Board
            </button>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer hideNav={true}>
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="glass-panel p-6 rounded-2xl w-full border border-red-500/20">
          <span className="text-3xl">⚠️</span>
          <h2 className="text-lg font-bold text-red-400 mt-2">Notice</h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">{errorMsg}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-brand-blue-light text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-blue-accent transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    </MobileContainer>
  );
};

export default Landing;
