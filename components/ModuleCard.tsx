import React, { useState, useRef, useEffect } from 'react';
import { Module, ModuleVersion, ContentJSON, updateModuleSize } from '../apiService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Resizable } from 're-resizable';

interface ModuleCardProps {
  module: Module;
  version: ModuleVersion;
  onEdit: (moduleId: string, prompt: string) => Promise<void>;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, version, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleEdit = async () => {
    if (!editPrompt.trim()) return;

    setIsLoading(true);
    try {
      await onEdit(module.id, editPrompt);
      setEditPrompt('');
      setIsEditing(false);
    } catch (error) {
      console.error('编辑失败:', error);
      alert('编辑失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (content: ContentJSON) => {
    switch (content.type) {
      case 'text':
        return (
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
            {content.subtitle && (
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">
                {content.subtitle}
              </p>
            )}
            <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
              {content.body}
            </p>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-4 h-full overflow-y-auto pr-2 custom-scrollbar">
            {content.questions.map((q, idx) => (
              <div key={idx} className="space-y-2">
                <p className="font-medium text-stone-800">{q.question}</p>
                <div className="space-y-1">
                  {q.options.map((option, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-2 rounded text-sm ${
                        optIdx === q.answer_index
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-stone-50'
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'interactive_app':
        return (
          <div className="h-full flex flex-col">
            {content.description && (
              <p className="text-stone-600 mb-4 text-sm">{content.description}</p>
            )}
            <div className="flex-1 bg-stone-100 p-4 rounded text-center text-stone-500 flex flex-col justify-center">
              <span className="text-xs font-medium uppercase tracking-widest mb-2">[交互模拟]</span>
              <pre className="text-[10px] text-left overflow-auto bg-white/50 p-2 rounded">
                {JSON.stringify(content.app_data, null, 2)}
              </pre>
            </div>
          </div>
        );

      default:
        return <div className="h-full overflow-y-auto">{JSON.stringify(content)}</div>;
    }
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="group relative inline-block"
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
          </div>

          {/* 内容区 */}
          <div className="flex-1 min-h-0">
            {renderContent(content)}
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
                    placeholder="Refine this module..."
                    className="flex-1 bg-transparent py-1 text-sm serif italic focus:outline-none text-stone-800"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEdit();
                      if (e.key === 'Escape') setIsEditing(false);
                    }}
                  />
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleEdit}
                      disabled={isLoading || !editPrompt.trim()}
                      className="text-stone-400 hover:text-stone-900 transition-colors text-sm"
                    >
                      {isLoading ? '...' : '↵'}
                    </button>
                    <div className="h-3 w-px bg-stone-200"></div>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="text-stone-300 hover:text-stone-600 p-1"
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
    </div>
  );
};

export default ModuleCard;
