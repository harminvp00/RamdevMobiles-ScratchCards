import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import RewardCardDownloader from '../components/RewardCardDownloader';
import MobileContainer from '../components/MobileContainer';
import { User, Phone, MapPin, Mail, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
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
          setUserData(res.data.user);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load dashboard. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

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
      <div className="flex flex-col space-y-5 pt-2 pb-6">
        
        {/* Profile Card Summary */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-brand-gold/10 pb-2">
            <h3 className="text-xs sm:text-sm font-bold text-brand-gold uppercase tracking-wider">
              Customer Profile
            </h3>
            <button 
              onClick={handleLogout}
              className="text-[10px] sm:text-xs text-slate-400 flex items-center space-x-1 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Logout</span>
            </button>
          </div>

          {userData && (
            <div className="flex items-center space-x-4 p-2 bg-brand-blue-deep/30 rounded-xl border border-brand-blue-light/20">
              {userData.profilePicture ? (
                <img 
                  src={userData.profilePicture} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full border-2 border-brand-gold/30 object-cover shadow-md shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-brand-gold/10 border-2 border-brand-gold/30 flex items-center justify-center text-brand-gold shadow-md shrink-0">
                  <User className="h-6 w-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-white text-sm sm:text-base truncate">{userData.fullName}</h4>
                <p className="text-xs text-slate-400 truncate">{userData.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Voucher card graphic and download button */}
        {userData && userData.assignedCard ? (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-brand-gold uppercase tracking-wider ml-1">
              Your Lucky Voucher
            </h3>
            
            <RewardCardDownloader
              userName={userData.fullName}
              cardNumber={userData.assignedCard.cardNumber}
              rewardText={userData.assignedCard.reward}
              isRedeemed={userData.assignedCard.redeemed}
              token={userData.assignedCard.token}
              email={userData.email}
            />

            {/* Status explanation block */}
            <div className="p-4 rounded-2xl glass-panel flex items-start space-x-3 text-xs leading-normal">
              {userData.assignedCard.redeemed ? (
                <>
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-400">Reward Redeemed Successfully</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      This voucher was verified and claimed physically at New Ramdev Mobile. 
                      Thank you for shopping with us!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle size={18} className="text-brand-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">How to Redeem?</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      1. Download the voucher PNG to your phone gallery.<br />
                      2. Visit the <strong>New Ramdev Mobile Shapar</strong> shop physically.<br />
                      3. Present the downloaded voucher QR code at the counter.<br />
                      4. Store staff will scan, verify, and hand over your prize!
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Terms and Conditions Link */}
            <div className="text-center pt-2">
              <button 
                onClick={() => navigate('/terms-and-conditions')}
                className="text-xs text-brand-gold/90 hover:text-brand-gold font-bold underline cursor-pointer"
              >
                નિયમો અને શરતો / नियम और शर्तें વાંચો &rarr;
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6 rounded-2xl text-center text-slate-400 text-sm">
            No scratch card assigned yet. Please log in with Google first.
          </div>
        )}

      </div>
    </MobileContainer>
  );
};

export default Dashboard;
