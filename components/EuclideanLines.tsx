
import React from 'react';

const EuclideanLines: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-10 z-0">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#1A1A1A" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Artistic Geometric Constructions */}
        <circle cx="20%" cy="30%" r="200" fill="none" stroke="#1A1A1A" strokeWidth="0.3" />
        <circle cx="20%" cy="30%" r="100" fill="none" stroke="#1A1A1A" strokeWidth="0.1" />
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="#1A1A1A" strokeWidth="0.2" />
        <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#1A1A1A" strokeWidth="0.2" />
        
        <circle cx="85%" cy="75%" r="300" fill="none" stroke="#1A1A1A" strokeWidth="0.2" />
        <path d="M 85% 75% L 70% 50% L 90% 40% Z" fill="none" stroke="#1A1A1A" strokeWidth="0.3" />
      </svg>
    </div>
  );
};

export default EuclideanLines;
