
import React, { useState } from 'react';
import { ScienceData } from '../types';

interface Props {
  data: ScienceData;
}

const ScienceModule: React.FC<Props> = ({ data }) => {
  const [variables, setVariables] = useState(data.variables);

  const updateVar = (index: number, val: number) => {
    const newVars = [...variables];
    newVars[index].current = val;
    setVariables(newVars);
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 space-y-20">
      {/* Intro */}
      <header className="flex flex-col md:flex-row gap-12 items-baseline border-b border-stone-200 pb-16">
        <div className="flex-1 space-y-4">
          <span className="uppercase tracking-[0.4em] text-[10px] text-stone-400 font-bold">Concept Diagram</span>
          <h1 className="serif text-6xl md:text-8xl tracking-tight leading-none text-stone-900">{data.concept}</h1>
          <p className="serif text-2xl italic text-stone-500 max-w-xl">{data.intuition}</p>
        </div>
        <div className="md:w-1/3 p-8 thin-border bg-stone-50 flex flex-col justify-center items-center">
            <span className="uppercase tracking-widest text-[10px] text-stone-400 mb-4">Mathematical Notation</span>
            <div className="text-3xl font-light text-stone-800 font-serif">
              {data.formula}
            </div>
        </div>
      </header>

      {/* Main Exploration */}
      <div className="grid lg:grid-cols-5 gap-16">
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-8">
             <h3 className="serif text-2xl italic border-l-2 border-stone-900 pl-4">Variables of Observation</h3>
             {variables.map((v, i) => (
               <div key={i} className="space-y-4 p-6 bg-stone-50/50 thin-border">
                 <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold tracking-wide text-stone-600">{v.label}</label>
                    <span className="text-stone-900 font-mono text-sm">{v.current.toFixed(1)} {v.unit}</span>
                 </div>
                 <input 
                   type="range" 
                   min={v.min} 
                   max={v.max} 
                   step="0.1"
                   value={v.current}
                   onChange={(e) => updateVar(i, parseFloat(e.target.value))}
                   className="w-full h-1 bg-stone-200 appearance-none rounded-full accent-stone-800"
                 />
                 <div className="flex justify-between text-[10px] text-stone-400 uppercase tracking-widest">
                   <span>Min</span>
                   <span>Max</span>
                 </div>
               </div>
             ))}
          </div>

          <div className="p-8 bg-stone-900 text-stone-100 space-y-4">
            <h4 className="uppercase text-[10px] tracking-widest opacity-50">Scientific Implication</h4>
            <p className="text-sm leading-relaxed opacity-90">
              Observing the change in variables reveals the underlying structure of {data.concept}. 
              In classical mechanics, the interplay between these values dictates the evolution of the system.
            </p>
          </div>
        </div>

        {/* Right: Dynamic Visualization (SVG) */}
        <div className="lg:col-span-3 space-y-8">
           <div className="aspect-square w-full thin-border bg-white flex items-center justify-center relative overflow-hidden">
             {/* Simulating a dynamic Euclidean diagram */}
             <svg width="100%" height="100%" viewBox="0 0 400 400" className="opacity-80">
                <circle cx="200" cy="200" r={variables[0].current * 2} fill="none" stroke="#1A1A1A" strokeWidth="0.5" />
                <line x1="200" y1="200" x2={200 + variables[1]?.current * 2 || 300} y2="200" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="4" />
                <text x="210" y="190" className="text-[10px] font-mono fill-stone-400">R = {variables[0].current.toFixed(1)}</text>
                
                <path d="M 50 350 L 350 350 L 200 50 Z" fill="none" stroke="#1A1A1A" strokeWidth="0.2" />
                
                {/* Labels */}
                <circle cx="200" cy="200" r="2" fill="#1A1A1A" />
                <text x="205" y="215" className="text-[8px] tracking-widest uppercase fill-stone-500">Origin Point</text>
             </svg>
             
             {/* Marble effect overlay subtle */}
             <div className="absolute inset-0 marble-bg pointer-events-none"></div>
             
             <div className="absolute bottom-8 left-8 right-8 p-4 bg-white/80 backdrop-blur-sm thin-border flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest font-bold">Real-time Result</span>
                <span className="font-mono text-xl">
                  {((variables[0].current * (variables[1]?.current || 1)) / 10).toFixed(4)} Φ
                </span>
             </div>
           </div>

           <div className="space-y-6">
              <h3 className="serif text-3xl font-light">Philosophical Explanation</h3>
              <p className="text-stone-600 leading-relaxed text-lg font-light text-justify">
                {data.explanation}
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {data.scenarios?.map((s, idx) => (
                  <div key={idx} className="p-4 thin-border border-dashed hover:border-solid hover:bg-stone-50 transition-all cursor-pointer">
                    <span className="text-[10px] uppercase text-stone-400 mb-2 block">Experimental Path 0{idx+1}</span>
                    <p className="text-stone-800 text-sm italic">{s}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ScienceModule;
