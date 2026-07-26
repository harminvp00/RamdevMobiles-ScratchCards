import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import ScratchCard from '../components/ScratchCard';
import MobileContainer from '../components/MobileContainer';
import { Gift, ShieldCheck, LogOut } from 'lucide-react';

const ScratchScreen = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        navigate('/verify', { replace: true });
        return;
      }

      try {
        const res = await API.get('/auth/me');
        if (res.data.success) {
          const userData = res.data.user;
          setUser(userData);
          
          // If already scratched, bypass scratch screen and go to dashboard
          const cardNum = userData.assignedCard?.cardNumber;
          if (cardNum && localStorage.getItem(`scratched_${cardNum}`)) {
            navigate('/dashboard', { replace: true });
          }
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load scratch card. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleRevealComplete = () => {
    setIsRevealed(true);
  };

  const handleSaveReward = () => {
    if (!user || !user.assignedCard) return;
    
    // Mark card as scratched in localStorage to prevent showing scratch canvas again
    localStorage.setItem(`scratched_${user.assignedCard.cardNumber}`, 'true');
    
    // Navigate to dashboard
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    navigate('/verify', { replace: true });
  };

  if (loading) {
    return (
      <MobileContainer>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MobileContainer>
    );
  }

  if (errorMsg) {
    return (
      <MobileContainer hideNav={true}>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="glass-panel p-6 rounded-2xl w-full border border-red-500/20">
            <span className="text-3xl">⚠️</span>
            <h2 className="text-lg font-bold text-red-400 mt-2">Error</h2>
            <p className="text-sm text-slate-300 mt-2">{errorMsg}</p>
            <button
              onClick={handleLogout}
              className="mt-6 bg-brand-gold text-brand-blue-deep font-bold px-5 py-2.5 rounded-lg text-sm active:scale-95 transition-all"
            >
              Back to Login
            </button>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-4">
        
        {/* Screen Header Info */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-wide uppercase font-sans">
            Your Lucky Scratch
          </h2>
          <p className="text-xs text-slate-400 max-w-[280px] mx-auto">
            {isRevealed 
              ? 'Awesome! You unlocked your prize!' 
              : 'Scratch the gold card below using your finger to reveal your reward.'}
          </p>
        </div>

        {/* Scratch Card Interaction Container */}
        <div className="flex items-center justify-center py-2 animate-pulse-subtle">
          {user && user.assignedCard && (
            <ScratchCard
              rewardText={user.assignedCard.reward}
              cardNumber={user.assignedCard.cardNumber}
              onRevealComplete={handleRevealComplete}
            />
          )}
        </div>

        {/* Action controls */}
        <div className="w-full max-w-[300px] flex flex-col items-center space-y-4">
          {isRevealed ? (
            <>
              <button
                onClick={handleSaveReward}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 text-brand-blue-deep font-extrabold py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.98] animate-bounce"
              >
                <Gift size={18} />
                <span>Save Reward & Continue</span>
              </button>
              <button 
                onClick={() => navigate('/terms-and-conditions')}
                className="text-xs text-brand-gold hover:text-brand-gold-shimmer font-semibold underline mt-1 cursor-pointer"
              >
                ઇનામની શરતો વાંચો / नियम और शर्तें पढ़ें
              </button>
            </>
          ) : (
            <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1.5 py-2 px-3 bg-brand-blue-deep/60 rounded-full border border-brand-blue-light/20">
              <ShieldCheck size={13} className="text-brand-gold" />
              <span>Your prize is locked to your account</span>
            </div>
          )}

          {/* User Signout Link */}
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 font-medium flex items-center space-x-1 hover:text-red-400 transition-colors duration-200"
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </MobileContainer>
  );
};

export default ScratchScreen;
