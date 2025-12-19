import React, { useState, useEffect } from 'react';
import { generateEducationalContent } from './geminiService';
import { LearningCategory } from './types';
import DynamicBackground from './components/DynamicBackground';
import LanguageModule from './components/LanguageModule';
import ScienceModule from './components/ScienceModule';
import SocraticMentor from './components/SocraticMentor';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<LearningCategory>(LearningCategory.LANGUAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await generateEducationalContent(topic, category);
      setContent(result);
    } catch (err) {
      console.error(err);
      setError("The Oracle encountered an error in deduction. Please try another query.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setContent(null);
    setTopic('');
    setIsDialogueOpen(false);
  };

  return (
    <div className="min-h-screen relative selection:bg-stone-900 selection:text-stone-100">
      <DynamicBackground category={category} />
      
      {/* Dialogue Mode Modal */}
      {isDialogueOpen && (
        <SocraticMentor 
          topic={content?.word || content?.concept || content?.title || topic} 
          onClose={() => setIsDialogueOpen(false)} 
        />
      )}

      {/* Navigation Header - Only visible on Landing Page, continuously blends in */}
      {!content && (
        <nav className="fixed top-0 left-0 right-0 z-40 px-12 py-6 flex justify-between items-center">
          <div className="cursor-pointer" onClick={reset}>
            <span className="text-3xl font-bold tracking-tighter playfair">axiom</span>
          </div>
        </nav>
      )}

      <main className="pt-24 min-h-screen z-10 relative">
        {!content ? (
          /* Landing State */
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
            <div className="max-w-3xl space-y-12 w-full">
              <div className="space-y-6">
                <h2 className="serif text-5xl md:text-7xl italic font-light leading-tight text-stone-800">
                  What realm of knowledge <br /> shall we manifest today?
                </h2>
                <p className="text-stone-500 font-medium tracking-[0.2em] uppercase text-xs">
                  Pose a question, a word, or a principle.
                </p>
              </div>

              <div className="space-y-10 max-w-xl mx-auto w-full">
                <form onSubmit={handleSearch} className="relative group w-full">
                  <input 
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Entropy, Renaissance, or Apple..."
                    className="w-full bg-transparent border-b border-stone-300 py-4 px-2 text-2xl serif italic focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-300 text-center"
                  />
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-0 bottom-4 text-stone-400 hover:text-stone-900 transition-colors disabled:opacity-50"
                  >
                    {!isLoading && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    )}
                  </button>
                </form>

                {/* Lightweight Category Selection */}
                <div className="flex justify-center items-center space-x-10 animate-in fade-in slide-in-from-top-2 duration-700">
                  {[
                    { id: LearningCategory.LANGUAGE, label: 'Language' },
                    { id: LearningCategory.SCIENCE, label: 'Science' },
                    { id: LearningCategory.LIBERAL_ARTS, label: 'Liberal Arts' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`text-[10px] uppercase tracking-[0.25em] py-1 transition-all duration-300 ${
                        category === cat.id
                          ? 'text-stone-900 border-b border-stone-900 font-medium'
                          : 'text-stone-400 hover:text-stone-600 border-b border-transparent'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {isLoading && (
                <div className="animate-pulse -mt-4">
                   <p className="serif italic text-stone-400">Synthesizing the manuscript...</p>
                </div>
              )}

              {error && (
                <p className="text-red-800 text-xs uppercase tracking-widest">{error}</p>
              )}
            </div>
          </div>
        ) : (
          /* Active Session State */
          <div className="animate-in fade-in duration-1000">
            <div className="flex flex-col items-center mb-12 space-y-4">
               <div className="flex space-x-8">
                 <button 
                  onClick={reset}
                  className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors border-b border-stone-200 py-1"
                 >
                   ← New Exploration
                 </button>
                 <button 
                  onClick={() => setIsDialogueOpen(true)}
                  className="text-[10px] uppercase tracking-widest text-stone-900 font-bold border-b-2 border-stone-900 py-1 animate-pulse"
                 >
                   Consult the Oracle →
                 </button>
               </div>
            </div>

            {category === LearningCategory.LANGUAGE && <LanguageModule data={content} />}
            {category === LearningCategory.SCIENCE && <ScienceModule data={content} />}
            {category === LearningCategory.LIBERAL_ARTS && (
              <div className="max-w-4xl mx-auto p-12 thin-border bg-white/50 backdrop-blur-md">
                 <h1 className="serif text-6xl italic mb-8">{content.title}</h1>
                 <p className="text-xl leading-relaxed text-stone-700 mb-12 text-justify">{content.abstract}</p>
                 <div className="grid md:grid-cols-2 gap-8">
                   {content.perspectives?.map((p: any, i: number) => (
                     <div key={i} className="p-8 thin-border">
                        <span className="uppercase text-[10px] tracking-widest text-stone-400 block mb-4">{p.field} Perspective</span>
                        <p className="serif italic text-lg">{p.insight}</p>
                     </div>
                   ))}
                 </div>
              </div>
            )}
            
            {/* Footer Marble Decoration - Removed top border for continuity */}
            <div className="h-64 w-full marble-bg mt-32"></div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => content && setIsDialogueOpen(true)}
          className="w-12 h-12 rounded-full border border-stone-900 flex items-center justify-center bg-[#FDFCF5] hover:bg-stone-900 hover:text-white transition-all duration-500 shadow-xl hover:rotate-90 group"
        >
          <span className="playfair text-xl group-hover:hidden">?</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 hidden group-hover:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default App;