import React, { useRef, useEffect, useState } from 'react';

const ScratchCard = ({ rewardText, cardNumber, onRevealComplete }) => {
  const canvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set dynamic dimensions for mobile vs tablet
    const isTablet = window.matchMedia('(min-width: 640px)').matches;
    const width = isTablet ? 420 : 300;
    const height = isTablet ? 252 : 180;

    // Set high-DPI scaling for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // 1. Draw Gold Gradient Background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#aa7c11');
    grad.addColorStop(0.3, '#d4af37');
    grad.addColorStop(0.5, '#ffd700');
    grad.addColorStop(0.7, '#d4af37');
    grad.addColorStop(1, '#aa7c11');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Glitter Noise Effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    const numPoints = isTablet ? 600 : 400;
    for (let i = 0; i < numPoints; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const r = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw Shop Badge Logo Outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = isTablet ? 2 : 1.5;
    ctx.strokeRect(8, 8, width - 16, height - 16);
    ctx.strokeRect(12, 12, width - 24, height - 24);

    // 4. Draw Center Typography
    ctx.fillStyle = '#0b2447';
    ctx.font = `bold ${isTablet ? '26px' : '20px'} "Outfit", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH & WIN', width / 2, height / 2 - (isTablet ? 15 : 10));

    ctx.fillStyle = '#19376d';
    ctx.font = `500 ${isTablet ? '14px' : '11px'} "Inter", sans-serif`;
    ctx.fillText('New Ramdev Mobile Shapar', width / 2, height / 2 + (isTablet ? 20 : 18));

    ctx.fillStyle = '#0b2447';
    ctx.font = `600 ${isTablet ? '12px' : '10px'} "Inter", sans-serif`;
    ctx.fillText('USE FINGER TO REVEAL PRIZE', width / 2, height / 2 + (isTablet ? 45 : 38));

  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Support touch and mouse events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const draw = (e) => {
    if (!isDrawing || isRevealed) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    const isTablet = window.matchMedia('(min-width: 640px)').matches;
    const brushRadius = isTablet ? 22 : 16;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushRadius, 0, Math.PI * 2); // Dynamic brush radius
    ctx.fill();

    checkScratchPercentage();
  };

  const handleStart = (e) => {
    // Prevent default scroll behavior on mobile touch
    if (e.cancelable) e.preventDefault();
    setIsDrawing(true);
  };

  const handleMove = (e) => {
    if (e.cancelable) e.preventDefault();
    draw(e);
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Sample pixels to calculate scratch percentage
    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    let transparent = 0;
    
    // Step by 32 bytes (8 pixels) for optimized check
    for (let i = 3; i < pixels.length; i += 32) {
      if (pixels[i] === 0) {
        transparent++;
      }
    }
    
    const percentage = (transparent / (pixels.length / 32)) * 100;
    
    if (percentage > 45 && !isRevealed) {
      setIsRevealed(true);
      revealAll();
    }
  };

  const revealAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Smooth fade out transition
    canvas.style.transition = 'opacity 0.6s ease-out';
    canvas.style.opacity = '0';
    
    setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onRevealComplete();
    }, 600);
  };

  return (
    <div className="relative w-[300px] h-[180px] sm:w-[420px] sm:h-[252px] rounded-xl overflow-hidden shadow-2xl border-2 border-brand-gold/40 bg-gradient-to-br from-brand-blue-navy to-[#050b1e]">
      
      {/* Background Prize Layer (Underneath Canvas) */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 text-center z-0">
        <div className="text-[10px] sm:text-xs text-brand-gold/60 uppercase tracking-widest font-semibold mt-1">
          Lucky Scratch Card
        </div>

        <div className="flex flex-col items-center justify-center my-auto">
          <span className="text-xs sm:text-sm text-slate-400 font-medium">YOU HAVE WON</span>
          <span className="text-3xl sm:text-4xl font-extrabold tracking-wide text-brand-gold gold-shimmer font-sans my-1 drop-shadow-md">
            {rewardText}
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-500">Subject to Admin Verification</span>
        </div>

        <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-slate-400 border-t border-brand-gold/10 pt-2 sm:pt-3 font-mono">
          <span>CODE: {cardNumber}</span>
          <span className="text-brand-gold">RAMDEV MOBILE</span>
        </div>
      </div>

      {/* Front Scratch Canvas Overlay */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="absolute inset-0 z-10 cursor-crosshair scratch-canvas"
      />
    </div>
  );
};

export default ScratchCard;
