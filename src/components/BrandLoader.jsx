import React from 'react';
import { Heart } from 'lucide-react';

export function BrandLoader({ message = "Loading SehatAI..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 gap-6 animate-in fade-in duration-500">
      <div className="relative">
        {/* Outer Glow Ring */}
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
        
        {/* Rotating border */}
        <div className="size-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        
        {/* Heart Pulse in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart 
            className="text-primary animate-[pulse_1s_infinite_ease-in-out]" 
            size={28} 
            fill="currentColor" 
          />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">{message}</p>
        <div className="flex gap-1">
          <div className="size-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="size-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="size-1 bg-primary/40 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}

export function BrandOverlay({ message }) {
  return (
    <div className="fixed inset-0 bg-background-light/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <BrandLoader message={message} />
    </div>
  );
}
