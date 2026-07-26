import React, { useEffect, useState } from 'react';
import API from '../services/api';
import MobileContainer from '../components/MobileContainer';
import { Trophy, Calendar } from 'lucide-react';

const Winners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const res = await API.get('/campaign/winners');
        if (res.data.success) {
          setWinners(res.data.winners);
        }
      } catch (err) {
        console.error('Error loading winners:', err);
        setErrorMsg('Failed to load winners list.');
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, []);

  return (
    <MobileContainer>
      <div className="flex flex-col space-y-5 pt-2 pb-6">
        
        {/* Leaderboard Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-brand-gold/10 border border-brand-gold rounded-full flex items-center justify-center mx-auto shadow-md">
            <Trophy className="text-brand-gold" size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-wide uppercase font-sans">
            Winners Board
          </h2>
          <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto">
            Celebrating our top winners of ₹100 and ₹200 cash vouchers!
          </p>
        </div>

        {loading ? (
          <div className="w-full py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : errorMsg ? (
          <div className="glass-panel p-4 rounded-xl text-center text-red-300 text-xs">
            {errorMsg}
          </div>
        ) : winners.length === 0 ? (
          <div className="glass-panel p-6 rounded-2xl text-center text-slate-400 text-sm sm:text-base">
            No winners recorded yet. Be the first to win!
          </div>
        ) : (
          /* Winners List Scroll Container */
          <div className="space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
            {winners.map((w, idx) => (
              <div 
                key={w.id || idx}
                className="glass-panel p-4 sm:p-5 rounded-xl flex items-center justify-between border-l-4 border-brand-gold shadow-md hover:border-brand-gold-shimmer transition-all duration-200"
              >
                <div className="space-y-1 max-w-[65%]">
                  <div className="font-bold text-white text-sm sm:text-base truncate">{w.name}</div>
                  <div className="text-[10px] sm:text-xs text-slate-400">
                    <span className="font-mono">{w.email}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-brand-gold uppercase tracking-wider block">Won</span>
                  <span className="text-sm sm:text-base font-extrabold text-white gold-shimmer font-sans">{w.reward || w.assignedCard?.reward}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </MobileContainer>
  );
};

export default Winners;
