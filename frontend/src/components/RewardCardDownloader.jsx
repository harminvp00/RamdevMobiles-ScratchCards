import React, { useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, ShieldCheck } from 'lucide-react';

const RewardCardDownloader = ({ userName, cardNumber, rewardText, isRedeemed, token }) => {
  const canvasRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAndDownload = async () => {
    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Dimensions for high-res PNG (800x1200)
      const w = 800;
      const h = 1200;
      canvas.width = w;
      canvas.height = h;

      // 1. Draw Deep Royal Blue Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#03001e');
      bgGrad.addColorStop(0.5, '#070e26');
      bgGrad.addColorStop(1, '#0b2447');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Draw Premium Gold Double Borders
      ctx.strokeStyle = '#d4af37';
      
      // Outer border
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, w - 60, h - 60);

      // Inner thin border
      ctx.lineWidth = 2;
      ctx.strokeRect(42, 42, w - 84, h - 84);

      // Corner ornaments (dots/circles)
      ctx.fillStyle = '#ffd700';
      const corners = [
        [42, 42],
        [w - 42, 42],
        [42, h - 42],
        [w - 42, h - 42]
      ];
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Header Shop Info
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 36px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NEW RAMDEV MOBILE', w / 2, 130);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 18px "Inter", sans-serif';
      ctx.fillText('LUCKY SCRATCH & WIN PROMOTION', w / 2, 175);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '500 16px "Inter", sans-serif';
      ctx.fillText('Shapar, Rajkot, Gujarat', w / 2, 205);

      // Decorative divider
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, 240);
      ctx.lineTo(w - 100, 240);
      ctx.stroke();

      // 4. Ticket Cutout visual circles on sides
      ctx.fillStyle = '#0c0a1a'; // Match body background
      ctx.beginPath();
      ctx.arc(0, h / 2, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w, h / 2, 45, 0, Math.PI * 2);
      ctx.fill();

      // Draw dotted dash line across ticket cutout
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 15]);
      ctx.beginPath();
      ctx.moveTo(80, h / 2);
      ctx.lineTo(w - 80, h / 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // 5. Customer Details Section (Top half)
      ctx.fillStyle = '#ffffff';
      ctx.font = '300 22px "Inter", sans-serif';
      ctx.fillText('CONGRATULATIONS', w / 2, 310);

      ctx.fillStyle = '#f3e5ab';
      ctx.font = '800 48px "Outfit", sans-serif';
      ctx.fillText(userName.toUpperCase(), w / 2, 370);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Inter", sans-serif';
      ctx.fillText(`CARD NUMBER: ${cardNumber}`, w / 2, 430);

      // 6. Reward Section (Bottom half)
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '500 20px "Inter", sans-serif';
      ctx.fillText('REDEEMABLE REWARD', w / 2, 630);

      // Draw Reward text
      ctx.fillStyle = '#ffd700';
      ctx.font = '800 68px "Outfit", sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.fillText(rewardText, w / 2, 720);
      ctx.shadowBlur = 0; // Reset shadow

      // 7. QR Code Generation for Verification
      // URL contains the verification redirect link
      const origin = window.location.origin;
      const qrData = `${origin}/admin/dashboard?token=${token || cardNumber}`;
      
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        margin: 2,
        width: 220,
        color: {
          dark: '#0b2447', // Dark navy
          light: '#ffffff' // White bg
        }
      });

      // Load and draw QR Code Image on Canvas
      const qrImage = new Image();
      qrImage.src = qrDataUrl;
      await new Promise((resolve) => {
        qrImage.onload = () => {
          // Centered horizontally, vertically at 800
          ctx.drawImage(qrImage, w / 2 - 110, 800, 220, 220);
          resolve();
        };
      });

      // Draw small frame around QR code
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      ctx.strokeRect(w / 2 - 112, 798, 224, 224);

      // 8. Footer Instructions
      ctx.fillStyle = '#a1a1aa';
      ctx.font = 'italic 16px "Inter", sans-serif';
      ctx.fillText('Scan QR code at shop counter to verify and redeem.', w / 2, 1070);

      ctx.fillStyle = '#ffd700';
      ctx.font = '600 16px "Inter", sans-serif';
      ctx.fillText('VALID FOR PHYSICAL REDEMPTION ONLY', w / 2, 1100);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '14px "Inter", sans-serif';
      ctx.fillText(`Issued: ${new Date().toLocaleDateString('en-IN')}`, w / 2, 1135);

      // 9. Trigger download link
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `RamdevMobile_Reward_${cardNumber}.png`;
      link.href = dataUrl;
      link.click();

    } catch (error) {
      console.error('Error generating image:', error);
      alert('Could not download image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Preview Card */}
      <div className="w-full bg-brand-blue-navy/60 rounded-2xl p-6 border border-brand-gold/25 relative overflow-hidden shadow-xl text-center mb-6">
        
        {/* Ticket Dotted edge divider visual */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 border-t border-dashed border-brand-gold/20 -translate-y-1/2"></div>
        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#070e26] rounded-full border border-brand-gold/20 -translate-y-1/2"></div>
        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#070e26] rounded-full border border-brand-gold/20 -translate-y-1/2"></div>

        {/* Top Section */}
        <div className="pb-6">
          <div className="text-xs text-brand-gold/70 uppercase tracking-widest font-bold mb-1">
            Reward Voucher
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">
            {userName}
          </h3>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            CODE: {cardNumber}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">
            Your Reward
          </span>
          <span className="text-2xl font-extrabold text-brand-gold gold-shimmer block mb-3 font-sans">
            {rewardText}
          </span>
          
          <div className="flex items-center justify-center space-x-2 text-[10px] py-1 px-3 bg-brand-blue-deep/50 rounded-full border border-brand-blue-light/30 w-fit mx-auto">
            <ShieldCheck size={12} className={isRedeemed ? "text-emerald-400" : "text-brand-gold"} />
            <span className={isRedeemed ? "text-emerald-400 font-semibold" : "text-slate-300 font-semibold"}>
              {isRedeemed ? 'Redeemed at Shop' : 'Active - Ready to Claim'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={generateAndDownload}
        disabled={isGenerating}
        className="w-full bg-gradient-to-r from-brand-gold-dark via-brand-gold to-brand-gold-dark text-brand-blue-deep font-bold py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center space-x-2.5 transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed hover:shadow-brand-gold/20 hover:shadow-xl"
      >
        <Download size={18} />
        <span>{isGenerating ? 'Generating Voucher...' : 'Download Voucher (PNG)'}</span>
      </button>

      {/* Hidden Canvas used for high-res rendering */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default RewardCardDownloader;
