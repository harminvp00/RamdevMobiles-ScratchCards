import React from 'react';
import MobileContainer from '../components/MobileContainer';
import { MessageSquare, MapPin, Users } from 'lucide-react';

const Shop = () => {
  const shopAddress = 'New Ramdev Mobile, Near Balaji Medical, On Egal PUC, Shapar Main Road, Shapar:- 360024';

  return (
    <MobileContainer>
      <div className="flex flex-col space-y-5 pt-2 pb-6">
        
        {/* Shop Images Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden shadow-lg border border-brand-gold/20 relative">
            <img 
              src="/shop-img1.jpeg" 
              alt="New Ramdev Mobile Storefront" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden shadow-lg border border-brand-gold/20 relative">
            <img 
              src="/shop-img2.jpeg" 
              alt="New Ramdev Mobile Interior" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <a 
            href="https://wa.me/919638433729"
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-brand-blue-navy/50 rounded-2xl border border-brand-gold/10 text-brand-gold active:scale-95 transition-all text-center hover:bg-brand-blue-navy/80"
          >
            <MessageSquare className="stroke-[2.5] h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-[10px] sm:text-xs mt-1.5 font-bold uppercase tracking-wide">WhatsApp Chat</span>
          </a>

          <a 
            href="https://chat.whatsapp.com/DCYuaCjH2sPHPMRJ9tlb4N?mode=gi_t"
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-brand-blue-navy/50 rounded-2xl border border-brand-gold/10 text-brand-gold active:scale-95 transition-all text-center hover:bg-brand-blue-navy/80"
          >
            <Users className="stroke-[2.5] h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-[10px] sm:text-xs mt-1.5 font-bold uppercase tracking-wide">Join WhatsApp Group</span>
          </a>
        </div>

        {/* Shop Details Card */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center space-x-3 border-b border-brand-gold/10 pb-3">
            <img 
              src="/shop-logo.jpeg" 
              alt="New Ramdev Mobile Logo" 
              className="w-12 h-12 rounded-full object-cover border border-brand-gold/30"
            />
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                New Ramdev Mobile
              </h2>
              <p className="text-xs text-brand-gold font-semibold tracking-wider">
                Smartphones • Accessories • Repairs
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <div className="flex items-start space-x-2.5">
              <span className="font-semibold text-brand-gold w-20 shrink-0">Owner:</span>
              <span className="text-white font-medium">Raj Gujarati</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="font-semibold text-brand-gold w-20 shrink-0">Mobile:</span>
              <a href="tel:+919638433729" className="text-white hover:text-brand-gold underline font-medium">
                +91 9638433729
              </a>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="font-semibold text-brand-gold w-20 shrink-0 flex items-center space-x-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>Address:</span>
              </span>
              <span className="leading-relaxed text-slate-300">
                {shopAddress}
              </span>
            </div>
          </div>
        </div>

      </div>
    </MobileContainer>
  );
};

export default Shop;
