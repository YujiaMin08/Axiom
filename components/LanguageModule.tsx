
import React from 'react';
import { WordData } from '../types';

interface Props {
  data: any;
}

const LanguageModule: React.FC<Props> = ({ data }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-16 py-12">
      {/* Header Section */}
      <section className="text-center space-y-4">
        <h1 className="text-8xl serif italic font-light tracking-tighter text-stone-900">
          {data.word}
        </h1>
        <div className="flex items-center justify-center space-x-4 text-stone-500 font-medium tracking-widest uppercase text-xs">
          <span>{data.phonetic}</span>
          <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
          <span>Noun / Verb</span>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Left Column: Definition & Usage */}
        <div className="space-y-8">
          <div className="thin-border p-8 bg-white/50 backdrop-blur-sm">
            <h3 className="serif text-2xl mb-4 italic">Definition</h3>
            <p className="text-stone-700 leading-relaxed text-lg">
              {data.definition}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="uppercase tracking-widest text-xs font-semibold text-stone-400">Usage & Examples</h3>
            <ul className="space-y-4">
              {data.usage?.map((u: string, i: number) => (
                <li key={i} className="flex space-x-4 items-start group">
                  <span className="text-stone-300 text-sm mt-1">0{i + 1}</span>
                  <p className="text-stone-800 italic group-hover:text-black transition-colors">{u}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Visual & Etymology */}
        <div className="space-y-8">
           <div className="aspect-[4/5] overflow-hidden thin-border bg-stone-200 relative group">
              <img 
                src={`https://picsum.photos/seed/${data.word}/800/1000`} 
                alt={data.word}
                className="w-full h-full object-cover filter grayscale sepia brightness-90 contrast-110"
              />
              <div className="absolute inset-0 bg-stone-900/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity"></div>
           </div>

           <div className="p-8 border-l border-stone-200">
             <h3 className="serif text-xl mb-3">Origin / Etymology</h3>
             <p className="text-stone-600 text-sm leading-relaxed font-light">
               {data.etymology}
             </p>
           </div>
        </div>
      </div>

      {/* Narrative Section */}
      <section className="bg-stone-900 text-stone-100 p-12 md:p-20 space-y-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <span className="uppercase tracking-[0.3em] text-[10px] opacity-50 block text-center">Contextual Narrative</span>
          <h2 className="serif text-4xl md:text-5xl text-center italic font-light">
            {data.word?.charAt(0).toUpperCase() + data.word?.slice(1)} in context
          </h2>
          <p className="text-stone-400 leading-loose text-lg font-light text-justify first-letter:text-5xl first-letter:float-left first-letter:mr-4 first-letter:serif first-letter:mt-2">
            {data.story}
          </p>
          <div className="pt-8 border-t border-stone-800 flex flex-col items-center space-y-2">
             <p className="text-stone-200 font-medium italic text-xl">"{data.keySentence}"</p>
             <span className="text-stone-500 text-xs">Primary Key Phrase</span>
          </div>
        </div>
      </section>

      {/* Quiz Section */}
      <section className="py-20 max-w-2xl mx-auto space-y-12">
        <h3 className="serif text-3xl text-center font-light">Verification of Understanding</h3>
        {data.quizzes?.map((q: any, i: number) => (
          <div key={i} className="space-y-6 p-10 thin-border hover:shadow-2xl transition-all duration-700">
            <p className="text-xl font-medium">{q.question}</p>
            <div className="grid grid-cols-1 gap-3">
              {q.options.map((opt: string, idx: number) => (
                <button 
                  key={idx}
                  className="px-6 py-4 text-left thin-border hover:bg-stone-900 hover:text-white transition-all duration-300 flex justify-between items-center group"
                >
                  <span className="text-sm opacity-50 group-hover:opacity-100">{String.fromCharCode(65 + idx)}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default LanguageModule;
