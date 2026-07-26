import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageSquare, MapPin } from 'lucide-react';
import API from '../services/api';
import MobileContainer from '../components/MobileContainer';

const ComingSoon = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [campaignStart, setCampaignStart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await API.get('/campaign/status');
        const { status, startDate } = res.data;
        
        if (status === 'active') {
          // If already active, redirect immediately
          navigate('/', { replace: true });
          return;
        }
        
        setCampaignStart(new Date(startDate));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching campaign start:', err);
        // Fallback to 2 days from now if server fails
        setCampaignStart(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));
        setLoading(false);
      }
    };

    fetchStatus();
  }, [navigate]);

  useEffect(() => {
    if (!campaignStart) return;

    const timer = setInterval(() => {
      const difference = campaignStart.getTime() - new Date().getTime();

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        // Redirect to Landing, which will send them to registration
        navigate('/', { replace: true });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [campaignStart, navigate]);

  if (loading) {
    return (
      <MobileContainer hideNav={true}>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer hideNav={true}>
      <div className="flex flex-col items-center text-center space-y-6 pt-4">
        
        {/* Card Header & Badge */}
        <div>
          <span className="bg-brand-gold/10 border border-brand-gold/40 text-brand-gold font-bold px-3 py-1 rounded-full text-xs tracking-wider uppercase">
            Coming Soon
          </span>
          <h2 className="text-xl font-extrabold text-white uppercase mt-4 tracking-wide px-2">
            Lucky Scratch & Win Promotion
          </h2>
        </div>

        {/* Shop Image */}
        <div className="w-full h-44 sm:h-60 rounded-2xl overflow-hidden shadow-lg border border-brand-gold/20 relative">
          <img 
            src="/shop.png" 
            alt="New Ramdev Mobile Shapar Store" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-deep/90 via-transparent to-transparent flex items-end p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-brand-gold font-semibold">New Ramdev Mobile Shapar</p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="w-full glass-panel p-5 sm:p-7 rounded-2xl">
          <h3 className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest font-semibold mb-3 sm:mb-4">
            Campaign Starts In
          </h3>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { val: timeLeft.days, label: 'Days' },
              { val: timeLeft.hours, label: 'Hrs' },
              { val: timeLeft.minutes, label: 'Mins' },
              { val: timeLeft.seconds, label: 'Secs' }
            ].map((t, idx) => (
              <div key={idx} className="flex flex-col items-center p-2.5 sm:p-4 bg-brand-blue-deep/60 rounded-xl border border-brand-blue-light/35 shadow-inner">
                <span className="text-2xl sm:text-4xl font-extrabold text-brand-gold font-mono tracking-tight">
                  {String(t.val).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[11px] text-slate-400 mt-1 uppercase font-semibold">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Description */}
        <div className="text-left w-full space-y-2">
          <h4 className="text-xs sm:text-sm text-brand-gold uppercase tracking-wider font-bold">About the Campaign</h4>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            Get ready to win exciting rewards! With every purchase, verify your email and receive a unique scratch card. Prizes include <strong>6D tempered glass</strong>, <strong>data cables</strong>, cash vouchers worth up to <strong>₹200</strong>!
          </p>
        </div>

        {/* Shop Details */}
        <div className="w-full text-left bg-brand-blue-navy/40 p-4 sm:p-6 rounded-xl border border-brand-blue-light/20 space-y-3">
          <div className="flex items-start space-x-2.5">
            <MapPin className="text-brand-gold shrink-0 mt-0.5 h-4 w-4 sm:h-5 sm:w-5" />
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-white uppercase">Store Location</h5>
              <p className="text-[11px] sm:text-xs text-slate-300 leading-tight mt-0.5">
                New Ramdev Mobile, Main Road, opposite Bus Station, Shapar, Gujarat 360024
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-brand-blue-light/20">
            <a 
              href="tel:+919999999999" 
              className="flex flex-col items-center justify-center p-2.5 sm:p-4 bg-brand-blue-deep rounded-xl border border-brand-blue-light/30 text-brand-gold hover:bg-brand-blue-light/20 transition-all text-center"
            >
              <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-[9px] sm:text-[11px] mt-1 font-semibold">Call Now</span>
            </a>

            <a 
              href="https://wa.me/919999999999" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 sm:p-4 bg-brand-blue-deep rounded-xl border border-brand-blue-light/30 text-brand-gold hover:bg-brand-blue-light/20 transition-all text-center"
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-[9px] sm:text-[11px] mt-1 font-semibold">WhatsApp</span>
            </a>

            <a 
              href="https://maps.google.com/?q=Ramdev+Mobile+Shapar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 sm:p-4 bg-brand-blue-deep rounded-xl border border-brand-blue-light/30 text-brand-gold hover:bg-brand-blue-light/20 transition-all text-center"
            >
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-[9px] sm:text-[11px] mt-1 font-semibold">Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
};

export default ComingSoon;
