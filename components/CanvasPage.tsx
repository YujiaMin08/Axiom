import React, { useState, useEffect } from 'react';
import { getCanvas, editModule, interact, reorderModules, deleteModule, CanvasResponse } from '../apiService';
import ModuleCard from './ModuleCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

interface CanvasPageProps {
  canvasId: string;
  onReset: () => void;
  onCanvasChange: (newId: string) => void;
}

const CanvasPage: React.FC<CanvasPageProps> = ({ canvasId, onReset, onCanvasChange }) => {
  const [canvasData, setCanvasData] = useState<CanvasResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 交互状态
  const [prompt, setPrompt] = useState('');
  const [isInteracting, setIsInteracting] = useState(false);

  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 加载 Canvas 数据
  useEffect(() => {
    loadCanvas();
  }, [canvasId]);

  const loadCanvas = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);
      const data = await getCanvas(canvasId);
      setCanvasData(data);
    } catch (err) {
      console.error('加载 Canvas 失败:', err);
      if (!silent) setError('加载失败，请重试');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // 编辑单个模块
  const handleEditModule = async (moduleId: string, prompt: string) => {
    try {
      const updatedModule = await editModule(moduleId, prompt);
      
      // 局部更新：只更新对应的模块
      setCanvasData((prev) => {
        if (!prev) return prev;
        
        return {
          ...prev,
          modules: prev.modules.map((m) =>
            m.module.id === moduleId ? updatedModule : m
          ),
        };
      });
    } catch (err) {
      console.error('编辑模块失败:', err);
      throw err;
    }
  };

  // 删除模块
  const handleDeleteModule = async (moduleId: string) => {
    try {
      await deleteModule(moduleId);
      
      // 从本地状态中移除
      setCanvasData((prev) => {
        if (!prev) return prev;
        
        return {
          ...prev,
          modules: prev.modules.filter((m) => m.module.id !== moduleId),
        };
      });
    } catch (err) {
      console.error('删除模块失败:', err);
      alert('删除失败，请重试');
    }
  };

  // 统一交互处理
  const handleInteract = async () => {
    if (!prompt.trim()) return;

    try {
      setIsInteracting(true);
      const result = await interact(canvasId, prompt);
      
      if (result.action === 'NEW_CANVAS') {
        // 如果是新 Canvas，通知父组件切换
        onCanvasChange(result.data.canvas.id);
      } else {
        // 如果是扩展，更新当前数据
        setCanvasData(result.data);
      }
      
      setPrompt('');
    } catch (err) {
      console.error('交互失败:', err);
      alert('AI 思考遇到阻碍，请重试');
    } finally {
      setIsInteracting(false);
    }
  };

  // 处理拖拽结束
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !canvasData) {
      return;
    }

    const oldIndex = canvasData.modules.findIndex((m) => m.module.id === active.id);
    const newIndex = canvasData.modules.findIndex((m) => m.module.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // 先更新本地状态（乐观更新）
    const newModules = arrayMove(canvasData.modules, oldIndex, newIndex);
    setCanvasData({
      ...canvasData,
      modules: newModules,
    });

    // 然后同步到后端
    try {
      const moduleOrders = newModules.map((m, index) => ({
        id: m.module.id,
        order_index: index,
      }));
      await reorderModules(moduleOrders);
    } catch (err) {
      console.error('更新模块顺序失败:', err);
      // 如果失败，重新加载数据
      loadCanvas();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-2 border-stone-900 border-t-transparent rounded-full mx-auto"></div>
          <p className="serif italic text-stone-500">正在构建学习空间...</p>
        </div>
      </div>
    );
  }

  if (error || !canvasData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error || '加载失败'}</p>
          <button
            onClick={() => loadCanvas()}
            className="text-xs uppercase tracking-widest px-6 py-2 border border-stone-900 hover:bg-stone-900 hover:text-white transition-all"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  const { canvas, modules } = canvasData;

  return (
    <div className="min-h-screen relative notebook-grid">
      <div className="max-w-[1400px] mx-auto px-12 pt-32 pb-64">
        {/* 笔记手稿式标题区域 */}
        <header className="mb-12 animate-in fade-in slide-in-from-left-4 duration-1000">
          <h1 className="serif text-3xl md:text-4xl italic text-stone-900 tracking-tight leading-snug max-w-full">
            {canvas.title}
          </h1>
        </header>

        {/* 模块区域 - 自由拖拽布局 */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={modules.map((m) => m.module.id)}
            strategy={rectSortingStrategy}
          >
            <div className="flex flex-wrap items-start gap-8 pb-24">
              {modules.map(({ module, current_version }) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  version={current_version}
                  onEdit={handleEditModule}
                  onDelete={handleDeleteModule}
                  onRefresh={async () => await loadCanvas(true)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* 底部悬浮交互区 - 极简轻盈设计 */}
      <div className="fixed bottom-10 left-0 right-0 z-40 px-6 flex justify-center pointer-events-none">
        <div className="w-full max-w-xl pointer-events-auto relative group">
          {/* 输入框容器 */}
          <div className={`
            bg-white/40 backdrop-blur-md border border-stone-200/50 shadow-sm rounded-3xl p-1
            transition-all duration-500 ease-out
            ${isInteracting ? 'scale-[0.98] opacity-100' : 'opacity-60 hover:opacity-100 hover:bg-white/60 hover:shadow-md'}
          `}>
            <div className="relative flex items-end">
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  // Auto-resize
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                placeholder="Expand, explain, or discover..."
                className="w-full bg-transparent border-none py-2.5 pl-6 pr-14 text-sm text-stone-800 placeholder:text-stone-400 placeholder:serif placeholder:italic focus:ring-0 focus:outline-none resize-none overflow-y-auto max-h-[120px]"
                disabled={isInteracting}
                rows={1}
                style={{ minHeight: '44px', lineHeight: '1.5' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleInteract();
                  }
                }}
              />
              
              {/* 发送按钮 */}
              <button
                onClick={handleInteract}
                disabled={!prompt.trim() || isInteracting}
                className={`
                  absolute right-2 bottom-2 p-2.5 rounded-full transition-all duration-300 flex-shrink-0
                  ${prompt.trim() && !isInteracting 
                    ? 'bg-stone-900 text-white shadow-sm hover:bg-stone-800' 
                    : 'bg-transparent text-stone-300 cursor-not-allowed'}
                `}
              >
                {isInteracting ? (
                  <div className="w-4 h-4 border-2 border-stone-300 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasPage;
