
import React from 'react';
import { LearningCategory } from '../types';

interface Props {
  category: LearningCategory;
}

const DynamicBackground: React.FC<Props> = ({ category }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden font-serif select-none">
      <style>{`
        @keyframes driftDeep {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(2%, 1%) rotate(1deg); }
          66% { transform: translate(-1%, 2%) rotate(-1deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes driftWide {
          0% { transform: translateX(-5%) translateY(0) scale(1); opacity: 0.4; }
          50% { transform: translateX(5%) translateY(-2%) scale(1.1); opacity: 0.6; }
          100% { transform: translateX(-5%) translateY(0) scale(1); opacity: 0.4; }
        }
        @keyframes pulseGlow {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 0.3; transform: scale(1); }
        }
      `}</style>

      {/* SHARED FILTERS for Fluid/Smoke Effects */}
      <svg width="0" height="0" className="absolute">
        <defs>
          {/* 
             The "Ink Flow" Filter: 
             Creates a complex, swirling distortion to mimic fluid dynamics or smoke.
             Higher scale on DisplacementMap = more distortion.
          */}
          <filter id="inkFlow" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="4" seed="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="80" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation="10" />
          </filter>

          {/* Softer Fog Filter for Science Mode */}
          <filter id="softFog" x="-50%" y="-50%" width="200%" height="200%">
             <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
          </filter>
        </defs>
      </svg>

      {/* 
        MODE 1: LANGUAGE
        Atmosphere: Darker "Ink" diffusing in water. 
        Color: Stone/Warm Grey tones to stand out against Ivory.
      */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          category === LearningCategory.LANGUAGE ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: '#FDFCF5' }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
           {/* Manuscript Baselines -> Replaced with Grid Paper */}
           <defs>
              <pattern id="grid-paper" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                 <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#78716C" strokeWidth="0.5" opacity="0.1" />
              </pattern>
           </defs>
           <rect width="100%" height="100%" fill="url(#grid-paper)" />

           {/* Semantic Traces (Larger & darker) */}
           <text x="-5%" y="30%" fontSize="800" fontFamily="Times New Roman, serif" fill="#57534E" opacity="0.04" fontWeight="bold">a</text>
           <text x="85%" y="90%" fontSize="600" fontFamily="Times New Roman, serif" fill="#57534E" opacity="0.04" fontStyle="italic">φ</text>
           <text x="60%" y="40%" fontSize="400" fontFamily="Garamond, serif" fill="#57534E" opacity="0.03" fontStyle="italic">&</text>
           {/* Red margin line removed */}

           {/* FLUID ATMOSPHERE LAYERS */}
           {/* Note: Using darker fill (#A8A29E) instead of white so it looks like ink shadows */}
           <g style={{ animation: 'driftDeep 20s infinite ease-in-out' }} filter="url(#inkFlow)">
             <path d="M -100 200 C 400 0, 800 600, 1600 200" stroke="#A8A29E" strokeWidth="120" fill="none" opacity="0.15" />
             <circle cx="20%" cy="80%" r="300" fill="#D6D3D1" opacity="0.2" />
             <circle cx="80%" cy="20%" r="400" fill="#E7E5E4" opacity="0.3" />
           </g>
           
           <g style={{ animation: 'driftWide 25s infinite ease-in-out' }} filter="url(#inkFlow)">
              <ellipse cx="50%" cy="50%" rx="60%" ry="40%" fill="#E7E5E4" opacity="0.2" />
           </g>
        </svg>
      </div>

      {/* 
        MODE 2: SCIENCE
        Atmosphere: Structured Light & Geometric Fog.
        Color: Cool Slate/Blueish tones.
      */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          category === LearningCategory.SCIENCE ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: '#F1F5F9' }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
           <defs>
             <pattern id="grid-science" width="100" height="100" patternUnits="userSpaceOnUse">
               <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#64748B" strokeWidth="0.5" opacity="0.1" />
             </pattern>
             <radialGradient id="radialGlow">
               <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
               <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
             </radialGradient>
           </defs>
           <rect width="100%" height="100%" fill="url(#grid-science)" />

           {/* Geometric Traces */}
           <text x="80%" y="50%" fontSize="600" fontFamily="Times New Roman, serif" fill="#334155" opacity="0.05" style={{ writingMode: 'vertical-rl' }}>∫</text>
           <g stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.08">
             <circle cx="40%" cy="50%" r="300" />
             <circle cx="60%" cy="50%" r="300" />
             <line x1="50%" y1="0" x2="50%" y2="100%" strokeDasharray="4 4" />
           </g>

           {/* ATMOSPHERE: Radial Light Beams */}
           {/* Stronger white glow to contrast with the slightly cooler #F1F5F9 background */}
           <g style={{ animation: 'pulseGlow 8s infinite ease-in-out', transformOrigin: '50% 50%' }}>
             <circle cx="50%" cy="50%" r="35%" fill="url(#radialGlow)" opacity="0.7" filter="url(#softFog)" />
             <circle cx="50%" cy="50%" r="55%" fill="#CBD5E1" opacity="0.15" filter="url(#softFog)" />
           </g>
        </svg>
      </div>

      {/* 
        MODE 3: LIBERAL ARTS
        Atmosphere: Heavy textured parchment, historical layers.
        Color: Antique/Warm Sepia tones.
      */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          category === LearningCategory.LIBERAL_ARTS ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: '#FAF7F2' }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
           {/* Textures */}
           <rect width="100%" height="100%" opacity="0.5">
             <filter id="noiseTexture">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
             </filter>
           </rect>

           {/* Traces */}
           <path d="M -100 200 Q 400 400 800 100 T 1600 300" fill="none" stroke="#A8A29E" strokeWidth="150" opacity="0.05" />
           
           {/* ATMOSPHERE: Heavy Organic Layers */}
           {/* Using Ink Flow filter for "cloudy" parchment stains */}
           <g style={{ animation: 'driftDeep 30s infinite ease-in-out' }} filter="url(#inkFlow)">
              <path d="M 0 0 C 300 300, 600 0, 1200 600" stroke="#D6D3D1" strokeWidth="200" fill="none" opacity="0.2" />
              <circle cx="90%" cy="10%" r="500" fill="#E7E5E4" opacity="0.4" />
              <circle cx="10%" cy="90%" r="400" fill="#D6D3D1" opacity="0.3" />
           </g>
        </svg>
      </div>
    </div>
  );
};

export default DynamicBackground;
