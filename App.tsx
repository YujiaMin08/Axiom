import React, { useState, useEffect } from 'react';
import { LearningCategory } from './types';
import DynamicBackground from './components/DynamicBackground';
import CanvasPage from './components/CanvasPage';
import { createCanvas } from './apiService';
import NotebookSidebar from './components/NotebookSidebar';
import { getContentLanguage } from './utils/languageSettings';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<LearningCategory>(LearningCategory.LANGUAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Canvas 模式状态
  const [canvasMode, setCanvasMode] = useState(false);
  const [canvasId, setCanvasId] = useState<string | null>(null);
  
  // Sidebar 状态
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 重置输入框高度当分类改变时
  useEffect(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
    }
  }, [category]);

  // 检查 URL 参数，支持直接跳转到指定 Canvas
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const canvasParam = params.get('canvas');
    
    if (canvasParam) {
      console.log('🔗 检测到 Canvas ID:', canvasParam);
      setCanvasId(canvasParam);
      setCanvasMode(true);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      // 使用 Canvas 模式
      const domainMap: Record<LearningCategory, string> = {
        [LearningCategory.LANGUAGE]: 'LANGUAGE',
        [LearningCategory.SCIENCE]: 'SCIENCE',
        [LearningCategory.LIBERAL_ARTS]: 'LIBERAL_ARTS',
        [LearningCategory.DIALOGUE]: 'LIBERAL_ARTS'
      };
      
      const domain = domainMap[category];
      const language = getContentLanguage(domain);
      
      const canvasData = await createCanvas(topic, domain, language);
      setCanvasId(canvasData.canvas.id);
      setCanvasMode(true);
    } catch (err: any) {
      console.error('创建 Canvas 失败:', err);
      const errorMessage = err?.response?.data?.details || err?.message || 'Unknown error';
      setError(`The Oracle encountered an error: ${errorMessage}. Please try another query.`);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setTopic('');
    setCanvasMode(false);
    setCanvasId(null);
  };

  return (
    <div className="min-h-screen relative selection:bg-stone-900 selection:text-stone-100">
      <DynamicBackground category={category} />
      
      {/* 笔记本侧边栏 */}
      <NotebookSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentCanvasId={canvasId}
        onSelectCanvas={(id) => {
          setCanvasId(id);
          setCanvasMode(true);
          setIsSidebarOpen(false);
        }}
      />
      
      {/* 全局导航栏 - 统一且极简 */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-12 py-8 flex justify-between items-center pointer-events-none transition-opacity duration-500 ${
        isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <div className="flex items-center space-x-6 pointer-events-auto">
          {/* 菜单按钮 - 只在侧边栏关闭时显示 */}
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-white/50 rounded-full transition-colors group"
              title="Open Library"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-stone-600 group-hover:text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
          )}

          {/* axiom 标题 - 只在侧边栏关闭时显示 */}
          {!isSidebarOpen && (
            <div 
              className="cursor-pointer group" 
              onClick={reset}
            >
              <span className="text-3xl font-bold tracking-tighter playfair text-stone-900/80 group-hover:text-stone-900 transition-colors">axiom</span>
            </div>
          )}
        </div>

        {/* 只有在 Canvas 模式下才显示的辅助操作 */}
        {canvasMode && (
          <div className="animate-in fade-in slide-in-from-right-2 duration-500 pointer-events-auto">
            <button 
              onClick={reset}
              className="text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors py-2 px-4 border border-transparent hover:border-stone-200 rounded-full"
            >
              ← Start New Exploration
            </button>
          </div>
        )}
      </nav>

      <main className="pt-24 min-h-screen z-10 relative">
        {canvasMode && canvasId ? (
          /* Canvas Mode */
          <CanvasPage 
            canvasId={canvasId} 
            onReset={reset} 
            onCanvasChange={setCanvasId}
          />
        ) : (
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
                  <textarea
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      // Auto-resize
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                    }}
                    placeholder={
                      category === LearningCategory.LANGUAGE 
                        ? "Try: Learn the word 'serendipity'"
                        : category === LearningCategory.SCIENCE
                        ? "Try: Understand Newton's first law"
                        : "Try: Explore the Renaissance movement"
                    }
                    rows={1}
                    className="w-full bg-transparent border-b border-stone-300 py-4 px-2 pr-12 text-2xl serif italic focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-300 text-center resize-none overflow-hidden min-h-[56px]"
                    style={{ lineHeight: '1.4' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSearch(e);
                      }
                    }}
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
        )}
      </main>

    </div>
  );
};

export default App;