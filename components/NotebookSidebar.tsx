import React, { useEffect, useState } from 'react';
import { getAllCanvases, Canvas } from '../apiService';
import SettingsModal from './SettingsModal';

interface NotebookSidebarProps {
  currentCanvasId: string | null;
  onSelectCanvas: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NotebookSidebar: React.FC<NotebookSidebarProps> = ({ 
  currentCanvasId, 
  onSelectCanvas, 
  isOpen,
  onClose
}) => {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Group canvases by domain
  const groupedCanvases = canvases.reduce((acc, canvas) => {
    const domain = canvas.domain || 'OTHER';
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(canvas);
    return acc;
  }, {} as Record<string, Canvas[]>);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  // 关闭用户菜单当点击外部时
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };
    
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getAllCanvases();
      // Sort by created_at desc
      setCanvases(data.sort((a, b) => b.created_at - a.created_at));
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const domainLabels: Record<string, string> = {
    LANGUAGE: 'Language Arts',
    SCIENCE: 'Natural Sciences',
    LIBERAL_ARTS: 'Liberal Arts',
    OTHER: 'General Notes'
  };

  return (
    <>
      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-[90] transition-opacity duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`fixed top-0 left-0 bottom-0 w-80 bg-[#FDFCF5] border-r border-stone-200 shadow-2xl z-[100] transform transition-transform duration-500 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-8 pt-12 border-b border-stone-100 flex justify-between items-start">
            <div>
              <h2 className="serif text-3xl italic text-stone-900 mb-2">Library</h2>
              <p className="text-[10px] text-stone-400 uppercase tracking-[0.2em]">Your Knowledge Collection</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 -mt-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin w-6 h-6 border-2 border-stone-200 border-t-stone-400 rounded-full"></div>
              </div>
            ) : canvases.length === 0 ? (
              <p className="text-center text-stone-400 text-sm italic py-10">No notes yet. Start exploring!</p>
            ) : (
              Object.entries(groupedCanvases).map(([domain, items]) => (
                <div key={domain} className="space-y-3">
                  <h3 className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-2">
                    {domainLabels[domain] || domain}
                  </h3>
                  <div className="space-y-1">
                    {items.map(canvas => (
                      <button
                        key={canvas.id}
                        onClick={() => {
                          onSelectCanvas(canvas.id);
                          onClose();
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-all group ${
                          currentCanvasId === canvas.id 
                            ? 'bg-stone-100 text-stone-900 shadow-sm' 
                            : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium truncate pr-2 ${currentCanvasId === canvas.id ? 'font-semibold' : ''}`}>
                            {canvas.title.replace(/^\[TEST\]\s*/, '')}
                          </span>
                          {currentCanvasId === canvas.id && (
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-900"></span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1 font-mono group-hover:text-stone-500">
                          {new Date(canvas.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* User Info & Settings */}
          <div className="border-t border-stone-100 bg-stone-50/50 relative">
            {/* User Info Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
              }}
              className="w-full p-4 hover:bg-stone-100/50 transition-colors flex items-center space-x-3 group"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-stone-600 to-stone-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                YM
              </div>
              {/* User Info */}
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-medium text-stone-900 truncate">Yohji Min</p>
                <p className="text-[10px] text-stone-400 truncate">@axiom_user</p>
              </div>
              {/* More Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-stone-400 group-hover:text-stone-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {/* Popup Menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-2xl border border-stone-200 py-2 z-[110] animate-in fade-in slide-in-from-bottom-2 duration-200">
                <button 
                  onClick={() => {
                    setShowSettings(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 transition-colors flex items-center space-x-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </button>
                
                <button className="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 transition-colors flex items-center space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Help</span>
                </button>

                <div className="border-t border-stone-100 my-1"></div>

                <div className="px-4 py-2">
                  <div className="flex items-center space-x-2 text-stone-400 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    <span>{canvases.length} Manuscripts</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotebookSidebar;

