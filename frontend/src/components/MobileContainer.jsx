import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Trophy, Store, User as UserIcon } from 'lucide-react';

const MobileContainer = ({ children, hideNav = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isLoggedIn = !!localStorage.getItem('customerToken');

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      path: isLoggedIn ? '/scratch' : '/',
      activePaths: ['/', '/scratch', '/verify', '/register', '/coming-soon'],
    },
    {
      label: 'Winners',
      icon: Trophy,
      path: '/winners',
      activePaths: ['/winners'],
    },
    {
      label: 'Shop',
      icon: Store,
      path: '/shop',
      activePaths: ['/shop'],
    },
    {
      label: 'My Card',
      icon: UserIcon,
      path: isLoggedIn ? '/dashboard' : '/verify',
      activePaths: ['/dashboard'],
    },
  ];

  const isActive = (item) => {
    return item.activePaths.includes(path);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0c0a1a] overflow-hidden sm:py-6 sm:px-4">
      {/* Frame boundary mimicking a mobile device / tablet layout */}
      <div className="w-full sm:max-w-[600px] md:max-w-[720px] h-[100dvh] sm:h-[85vh] bg-gradient-to-b from-brand-blue-deep via-[#070e26] to-brand-blue-deep flex flex-col relative sm:shadow-2xl border-x sm:border border-brand-blue-light/20 sm:rounded-3xl overflow-hidden pb-16 sm:pb-20">
        
        {/* Golden Shimmer Header */}
        <header className="w-full py-4 px-4 sm:py-5 sm:px-6 bg-brand-blue-navy/80 backdrop-blur-md border-b border-brand-gold/10 sticky top-0 z-40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/shop-logo.jpeg" 
              alt="New Ramdev Mobile Logo" 
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover shadow-md border border-brand-gold/30"
            />
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-wide text-brand-gold gold-shimmer font-sans uppercase">
                New Ramdev Mobile
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-400 -mt-1 font-sans">LUCKY SCRATCH & WIN</p>
            </div>
          </div>
          <div className="text-[10px] sm:text-xs bg-brand-gold/10 border border-brand-gold/30 text-brand-gold px-2.5 py-0.5 rounded-full font-semibold">
            Shapar
          </div>
        </header>

        <main className="flex-1 w-full p-4 sm:p-6 flex flex-col overflow-y-auto no-scrollbar">
          {children}
          
          {/* Terms & Conditions Footer Link */}
          {!path.startsWith('/admin') && path !== '/terms-and-conditions' && (
            <div className="mt-auto pt-6 pb-2 text-center shrink-0">
              <button 
                onClick={() => navigate('/terms-and-conditions')}
                className="text-[10px] sm:text-xs text-slate-500 hover:text-brand-gold transition-colors font-medium underline cursor-pointer"
              >
                નિયમો અને શરતો / नियम और शर्तें (Terms & Conditions)
              </button>
            </div>
          )}
        </main>

        {/* Bottom Mobile Tab Bar */}
        {!hideNav && (
          <nav className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-brand-blue-navy/95 backdrop-blur-lg border-t border-brand-gold/10 flex items-center justify-around px-2 sm:px-6 z-40 shadow-inner">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <button
                  key={idx}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center justify-center w-16 sm:w-20 h-full transition-all duration-200"
                >
                  <Icon
                    className={`transition-colors duration-200 h-5 w-5 sm:h-6 sm:w-6 ${
                      active ? 'text-brand-gold stroke-[2.5]' : 'text-slate-400 stroke-[2]'
                    }`}
                  />
                  <span
                    className={`text-[9px] sm:text-[11px] mt-1 font-medium transition-all ${
                      active ? 'text-brand-gold font-bold scale-105' : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
};

export default MobileContainer;
