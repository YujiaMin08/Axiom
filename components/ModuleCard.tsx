import React, { useState, useRef, useEffect } from 'react';
import { Module, ModuleVersion, ContentJSON, updateModuleSize } from '../apiService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Resizable } from 're-resizable';
import RealtimeScenarioChat from './RealtimeScenarioChat';
import ComparisonTable from './ComparisonTable';

interface ModuleCardProps {
  module: Module;
  version: ModuleVersion;
  onEdit: (moduleId: string, prompt: string) => Promise<void>;
  onDelete?: (moduleId: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, version, onEdit, onDelete, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  // Animation State
  const [animationKey, setAnimationKey] = useState(0);
  
  // Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Handle refresh with visual feedback
  const handleRefresh = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onRefresh) {
      console.warn('onRefresh is not defined');
      return;
    }
    
    console.log('Refreshing module:', module.id);
    setIsRefreshing(true);
    
    try {
      await onRefresh();
      console.log('Module refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh module:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Keep spinner for a bit
    }
  };
  
  // Handle delete with confirmation
  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      await onDelete(module.id);
    } catch (error) {
      console.error('Failed to delete module:', error);
    }
  };

  const content = version.content_json;

  // 拖拽功能
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Trigger MathJax rendering
  const triggerMathJax = () => {
    setTimeout(() => {
      if ((window as any).MathJax && (window as any).MathJax.typesetPromise) {
        console.log('Triggering MathJax for module:', module.id);
        (window as any).MathJax.typesetPromise().catch((err: any) => {
          console.error('MathJax error:', err);
        });
      }
    }, 100);
  };
  
  // Trigger on content change
  useEffect(() => {
    triggerMathJax();
  }, [content]);
  
  // Trigger after drag end
  useEffect(() => {
    if (!isDragging) {
      triggerMathJax();
    }
  }, [isDragging]);

  const handleEdit = async () => {
    if (!editPrompt.trim()) return;

    setIsLoading(true);
    const userPrompt = editPrompt.trim();
    
    try {
      console.log('🔄 Editing module with prompt:', userPrompt);
      await onEdit(module.id, userPrompt);
      setEditPrompt('');
      setIsEditing(false);
      console.log('✅ Module edited successfully');
    } catch (error) {
      console.error('❌ 编辑失败:', error);
      alert('Failed to edit module. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Markdown to HTML converter with LaTeX support
  const markdownToHtml = (markdown: string): string => {
    // Process in order: code blocks, math, then other markdown
    let html = markdown;
    
    // 1. Protect code blocks first
    const codeBlocks: string[] = [];
    html = html.replace(/```([\s\S]*?)```/gim, (match, code) => {
      codeBlocks.push(code);
      return `__CODEBLOCK_${codeBlocks.length - 1}__`;
    });
    
    // 2. Process LaTeX math (before other replacements)
    // Block math: $$...$$
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
      return `<div class="my-6 text-center overflow-x-auto">\\[${formula.trim()}\\]</div>`;
    });
    
    // Inline math: $...$
    html = html.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
      return `\\(${formula.trim()}\\)`;
    });
    
    // 3. Process other Markdown
    html = html
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-serif italic text-stone-800 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-serif italic text-stone-800 mt-8 mb-4 border-b border-stone-200 pb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-serif italic text-stone-900 mt-8 mb-6">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-stone-900">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-stone-800">$1</em>')
      .replace(/`([^`]+)`/gim, '<code class="bg-stone-100 px-1.5 py-0.5 rounded text-sm font-mono text-stone-800">$1</code>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<div class="my-6"><img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-sm mx-auto" /></div>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-stone-600 underline hover:text-stone-900" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^\* (.*$)/gim, '<li class="ml-6 list-disc marker:text-stone-300 mb-1">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc marker:text-stone-300 mb-1">$1</li>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-stone-300 pl-4 my-4 italic text-stone-600">$1</blockquote>');
    
    // 4. Restore code blocks
    html = html.replace(/__CODEBLOCK_(\d+)__/g, (match, index) => {
      return `<pre class="bg-stone-50 border border-stone-200 p-4 rounded-lg text-sm overflow-x-auto my-4 font-mono text-stone-700"><code>${codeBlocks[parseInt(index)]}</code></pre>`;
    });
    
    // 5. Wrap paragraphs
    return html.split('\n\n')
      .map(p => {
         const trimmed = p.trim();
         if (!trimmed) return '';
         if (trimmed.startsWith('<h') || trimmed.startsWith('<li') || trimmed.startsWith('<pre') || trimmed.startsWith('<block') || trimmed.startsWith('<div')) return trimmed;
         return `<p class="mb-4 leading-relaxed text-stone-700">${trimmed}</p>`;
      })
      .join('');
  };

  const renderContent = (content: ContentJSON) => {
    switch (content.type) {
      case 'text':
        const htmlContent = markdownToHtml(content.body);
        return (
          <div className="h-full overflow-y-auto pr-4 custom-scrollbar">
            <div 
              className="prose prose-stone max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        );

      case 'video':
        if (!content.video_url || content.video_url === '') {
          return (
            <div className="h-full flex flex-col items-center justify-center bg-stone-50 rounded-lg border border-stone-200 border-dashed p-8">
              <div className="animate-spin w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full mb-6"></div>
              <p className="text-stone-700 font-serif italic text-lg mb-2">Filming scene...</p>
              <p className="text-stone-400 text-xs mb-6">The director is arranging the shot</p>
              
              <div className="w-full max-w-xs bg-white rounded-lg border border-stone-200 p-4">
                <div className="flex justify-between text-xs text-stone-500 mb-2">
                  <span>Progress</span>
                  <span>Est. 1-3 min</span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-stone-400 rounded-full animate-pulse" style={{width: '45%'}}></div>
                </div>
                <button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="mt-4 w-full text-xs text-stone-500 hover:text-stone-700 underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isRefreshing ? (
                    <>
                      <div className="w-3 h-3 border border-stone-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Checking...</span>
                    </>
                  ) : (
                    <span>Check status</span>
                  )}
                </button>
              </div>
            </div>
          );
        }
        
        return (
          <div className="h-full flex items-center justify-center bg-stone-50 rounded-lg">
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-sm">
              <video src={content.video_url} controls className="w-full h-full object-contain" poster={content.thumbnail_url}>
                Your browser does not support video playback.
              </video>
            </div>
          </div>
        );

      case 'image':
        if (!content.image_url && !content.image_data) {
          return (
            <div className="h-full flex flex-col items-center justify-center bg-stone-50 rounded-lg border border-stone-200 border-dashed p-8">
              <div className="animate-spin w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full mb-6"></div>
              <p className="text-stone-700 font-serif italic text-lg mb-2">Painting...</p>
              <p className="text-stone-400 text-xs mb-6">The artist is mixing colors</p>
              
              <div className="w-full max-w-xs bg-white rounded-lg border border-stone-200 p-4">
                <div className="flex justify-between text-xs text-stone-500 mb-2">
                  <span>Progress</span>
                  <span>Est. 10-20 sec</span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-stone-400 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
                <button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="mt-4 w-full text-xs text-stone-500 hover:text-stone-700 underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isRefreshing ? (
                    <>
                      <div className="w-3 h-3 border border-stone-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Checking...</span>
                    </>
                  ) : (
                    <span>Check status</span>
                  )}
                </button>
              </div>
            </div>
          );
        }
        
        const imageSrc = content.image_data || content.image_url || '';
        return (
          <div className="h-full flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-lg overflow-hidden flex items-center justify-center p-2 border border-stone-100 shadow-inner">
              <img src={imageSrc} alt={content.title} className="max-w-full max-h-full object-contain rounded" />
            </div>
          </div>
        );

      case 'html_animation':
        const htmlBlob = new Blob([content.html_content], { type: 'text/html' });
        const htmlUrl = URL.createObjectURL(htmlBlob);
        
        return (
          <div className="h-full flex flex-col relative group/anim">
            <div className="flex-1 bg-white rounded-lg overflow-hidden border border-stone-200 relative">
              <iframe 
                key={animationKey}
                src={htmlUrl} 
                className="w-full h-full border-0" 
                title={content.title} 
                sandbox="allow-scripts allow-same-origin" 
              />
              
              {/* Replay Button */}
              <button 
                onClick={() => setAnimationKey(k => k + 1)}
                className="absolute top-4 right-4 bg-white/80 backdrop-blur border border-stone-200 text-stone-600 px-3 py-1.5 rounded-lg shadow-sm hover:bg-white hover:text-stone-900 hover:border-stone-300 transition-all opacity-0 group-hover/anim:opacity-100 text-xs font-medium"
                title="Replay Animation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Replay
              </button>
            </div>
          </div>
        );

      case 'quiz':
        const currentQ = content.questions[quizIndex];
        const totalQ = content.questions.length;
        const hasAnswered = selectedAnswer !== null;
        
        return (
          <div className="h-full flex flex-col">
             {/* Question Card */}
             <div className="flex-1 p-6 flex flex-col">
               <p className="text-lg text-stone-800 font-serif italic leading-relaxed mb-8">
                 {currentQ.question}
               </p>

               <div className="space-y-3">
                 {currentQ.options.map((option, optIdx) => {
                   const isSelected = selectedAnswer === optIdx;
                   const isCorrect = optIdx === currentQ.answer_index;
                   const showResult = hasAnswered;
                   
                   let btnClass = "w-full text-left p-4 rounded-lg border transition-all duration-300 ";
                   
                   if (showResult) {
                     if (isCorrect) btnClass += "bg-stone-100 border-stone-400 text-stone-900";
                     else if (isSelected) btnClass += "bg-stone-50 border-stone-300 text-stone-500 line-through";
                     else btnClass += "bg-white border-stone-200 text-stone-400 opacity-50";
                   } else {
                     btnClass += "bg-white border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-700";
                   }

                   return (
                     <button
                       key={optIdx}
                       onClick={() => {
                         if (!hasAnswered) {
                           setSelectedAnswer(optIdx);
                         }
                       }}
                       disabled={hasAnswered}
                       className={btnClass}
                     >
                       <div className="flex items-start">
                         <span className="mr-3 font-mono text-xs mt-1 text-stone-400">{String.fromCharCode(65 + optIdx)}.</span>
                         <span className="text-sm">{option}</span>
                         {showResult && isCorrect && (
                           <span className="ml-auto text-stone-600">✓</span>
                         )}
                       </div>
                     </button>
                   );
                 })}
               </div>

               {hasAnswered && currentQ.explanation && (
                 <div className="mt-6 bg-stone-50 p-4 rounded-lg border border-stone-200 animate-in fade-in slide-in-from-bottom-2">
                   <p className="text-xs text-stone-600 leading-relaxed italic">{currentQ.explanation}</p>
                 </div>
               )}
             </div>

             {/* Navigation */}
             <div className="p-4 border-t border-stone-200">
               {/* Try Again Button (if answered) */}
               {hasAnswered && (
                 <div className="flex justify-center mb-3">
                   <button
                     onClick={() => setSelectedAnswer(null)}
                     className="text-xs text-stone-500 hover:text-stone-800 underline transition-colors"
                   >
                     Try again
                   </button>
                 </div>
               )}
               
               {/* Navigation Arrows */}
               <div className="flex justify-between items-center">
                 <button 
                   onClick={() => {
                     setQuizIndex(i => Math.max(0, i - 1));
                     setSelectedAnswer(null);
                   }}
                   disabled={quizIndex === 0}
                   className="text-stone-400 hover:text-stone-800 disabled:opacity-20 disabled:hover:text-stone-400 transition-colors"
                 >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
                 </button>
                 
                 <div className="flex items-center space-x-2">
                   <span className="text-xs font-mono text-stone-500">{quizIndex + 1}</span>
                   <span className="text-stone-300">/</span>
                   <span className="text-xs font-mono text-stone-400">{totalQ}</span>
                 </div>
                 
                 <button 
                   onClick={() => {
                     setQuizIndex(i => Math.min(totalQ - 1, i + 1));
                     setSelectedAnswer(null);
                   }}
                   disabled={quizIndex === totalQ - 1}
                   className="text-stone-400 hover:text-stone-800 disabled:opacity-20 disabled:hover:text-stone-400 transition-colors"
                 >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                 </button>
               </div>
            </div>
          </div>
        );

      case 'interactive_app':
        // Check if it's a Real-time Scenario
        if (content.app_data?.type === 'realtime_scenario') {
          return <RealtimeScenarioChat appData={content.app_data} />;
        }
        
        // Check if it's a Comparison Table
        if (content.app_data?.type === 'comparison_table') {
          return <ComparisonTable data={content.app_data} />;
        }
        
        // Check if has HTML content
        const appHtmlContent = content.html_content || (typeof content.app_data === 'string' ? content.app_data : null);
        
        if (appHtmlContent) {
          const appBlob = new Blob([appHtmlContent], { type: 'text/html' });
          const appUrl = URL.createObjectURL(appBlob);
          
          return (
            <div className="h-full flex flex-col">
              <div className="flex-1 bg-white rounded-lg overflow-hidden border border-stone-200">
                <iframe 
                  src={appUrl} 
                  className="w-full h-full border-0" 
                  title={content.title} 
                  sandbox="allow-scripts allow-same-origin allow-forms" 
                />
              </div>
            </div>
          );
        }
        
        // Fallback: show raw data
        return (
          <div className="h-full flex flex-col justify-center items-center p-8 bg-stone-50 rounded-lg border border-stone-200 border-dashed">
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-4">Interactive App</p>
            <pre className="text-[10px] text-stone-500 overflow-auto max-h-full w-full bg-white p-4 rounded border border-stone-200">
                {JSON.stringify(content.app_data, null, 2)}
              </pre>
          </div>
        );

      default:
        return (
          <div className="h-full overflow-y-auto p-4 bg-stone-50 rounded">
            <pre className="text-xs text-stone-500">{JSON.stringify(content, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="group relative inline-block"
      data-module-id={module.id}
        >
        <Resizable
          defaultSize={{
            width: module.width || 600,
          height: module.height || 'auto'
          }}
          minWidth={300}
          maxWidth={1400}
          minHeight={150}
          onResizeStop={(e, direction, ref, d) => {
            const newWidth = (module.width || 600) + d.width;
            const newHeight = (module.height || 400) + d.height;
            updateModuleSize(module.id, newWidth, newHeight);
          triggerMathJax();
          }}
        className="bg-white/70 backdrop-blur-sm border border-stone-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-500 flex flex-col"
          handleClasses={{
            bottomRight: "w-6 h-6 bottom-0 right-0 cursor-nwse-resize active:opacity-100 z-20"
          }}
          handleStyles={{
            bottomRight: {
              bottom: 0,
              right: 0,
              width: '24px',
              height: '24px',
              background: 'linear-gradient(135deg, transparent 70%, rgba(120, 113, 108, 0.15) 70%)',
            }
          }}
        >
          <div className="p-8 flex flex-col h-full relative">
            {/* 标题栏 */}
            <div className="flex items-start justify-between mb-6 flex-shrink-0">
              <div className="flex items-center space-x-4 flex-1">
                {/* 拖拽手柄 */}
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing text-stone-200 hover:text-stone-900 transition-colors flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M4 16h16" />
                  </svg>
                </div>
                
                <h3 
                className="serif text-2xl italic text-stone-900 cursor-pointer hover:text-stone-600 transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  {content.title}
                </h3>
            </div>

                {/* 删除按钮 */}
            {onDelete && (
                <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 -mr-2 -mt-1 text-stone-300 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-all duration-200"
                title="Delete module"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
            )}
            </div>

            {/* 内容区 */}
          <div className="flex-1 min-h-0 relative">
              {renderContent(content)}
            
            {/* 编辑加载覆盖层 */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-40 animate-in fade-in duration-300">
                <div className="animate-spin w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full mb-4"></div>
                <p className="text-stone-700 font-serif italic text-lg mb-1">Regenerating...</p>
                <p className="text-stone-400 text-xs">Applying your refinement</p>
              </div>
            )}
            </div>

          {/* 底部交互区 (编辑图标 & 输入框) */}
            <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col space-y-3">
              {!isEditing ? (
                <div className="flex items-center">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-stone-300 hover:text-stone-600 hover:bg-stone-50 rounded-lg"
                    title="Edit this module"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center space-x-3 bg-stone-50 rounded-xl px-4 py-2 border border-stone-200">
                    <input
                      ref={inputRef}
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="e.g. Make it simpler, add more examples..."
                    className="flex-1 bg-transparent py-1 text-sm serif italic focus:outline-none text-stone-800 placeholder:text-stone-300"
                      onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isLoading) handleEdit();
                        if (e.key === 'Escape') setIsEditing(false);
                      }}
                    disabled={isLoading}
                    />
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={handleEdit}
                        disabled={isLoading || !editPrompt.trim()}
                      className="text-stone-400 hover:text-stone-900 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                      {isLoading ? (
                        <div className="w-3 h-3 border border-stone-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        '↵'
                      )}
                      </button>
                      <div className="h-3 w-px bg-stone-200"></div>
                      <button 
                      onClick={() => {
                        if (!isLoading) {
                          setIsEditing(false);
                          setEditPrompt('');
                        }
                      }}
                      disabled={isLoading}
                      className="text-stone-300 hover:text-stone-600 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Resizable>
      
      {/* Delete Confirmation Dialog - Overlays the entire card */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4 animate-in zoom-in-95 duration-200">
            <h4 className="serif text-lg italic text-stone-900 mb-2">Delete this module?</h4>
            <p className="text-sm text-stone-500 mb-6">This action cannot be undone.</p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleDelete();
                }}
                className="flex-1 px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleCard;
