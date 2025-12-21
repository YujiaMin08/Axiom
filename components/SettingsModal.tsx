import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'about'>('general');
  const [language, setLanguage] = useState<'en' | 'zh'>(
    () => (localStorage.getItem('axiom_language') as 'en' | 'zh') || 'en'
  );

  const handleSave = () => {
    localStorage.setItem('axiom_language', language);
    onClose();
    window.location.reload(); // 重新加载以应用语言设置
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[110] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
        <div 
          className="bg-[#FDFCF5] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h2 className="serif text-2xl italic text-stone-900">Settings</h2>
              <p className="text-xs text-stone-400 uppercase tracking-[0.2em] mt-1">Preferences & Configuration</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="px-8 pt-6 flex space-x-6 border-b border-stone-100">
            {[
              { id: 'general', label: 'General' },
              { id: 'about', label: 'About' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-sm transition-all relative ${
                  activeTab === tab.id
                    ? 'text-stone-900 font-medium'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900"></div>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(80vh-180px)] custom-scrollbar">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Username</label>
                  <input 
                    type="text"
                    defaultValue="Yohji Min"
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">User ID</label>
                  <input 
                    type="text"
                    defaultValue="@axiom_user"
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Default Learning Domain</label>
                  <select className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 transition-all">
                    <option>Language Arts</option>
                    <option>Natural Sciences</option>
                    <option>Liberal Arts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Content Language</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 transition-all"
                  >
                    <option value="en">English (Default)</option>
                    <option value="zh">简体中文 (Simplified Chinese)</option>
                  </select>
                  <p className="text-xs text-stone-400 mt-2">
                    • Language Arts: Always bilingual (EN + ZH)<br/>
                    • Science/Liberal Arts: Uses selected language
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <p className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">Enable Animations</p>
                      <p className="text-xs text-stone-400 mt-1">Disable to improve performance</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-stone-900/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="inline-block">
                    <span className="text-5xl font-bold tracking-tighter playfair text-stone-900">axiom</span>
                    <p className="text-xs text-stone-400 uppercase tracking-[0.3em] mt-2">Where Understanding Takes Form</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-stone-600">
                  <div className="flex justify-between py-3 border-b border-stone-100">
                    <span className="text-stone-400">Version</span>
                    <span className="font-medium">1.0.0 Beta</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-stone-100">
                    <span className="text-stone-400">Build Date</span>
                    <span className="font-medium">Dec 22, 2024</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-stone-100">
                    <span className="text-stone-400">Tech Stack</span>
                    <span className="font-medium">React + TypeScript + Gemini</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-200">
                  <p className="text-xs text-stone-400 text-center leading-relaxed">
                    Crafted with precision to transform the way you explore knowledge.
                    <br />
                    © 2024 Axiom. All rights reserved.
                  </p>
                </div>

                <div className="flex justify-center space-x-4 pt-4">
                  <button className="text-xs text-stone-400 hover:text-stone-900 transition-colors underline underline-offset-2">
                    Documentation
                  </button>
                  <span className="text-stone-300">·</span>
                  <button className="text-xs text-stone-400 hover:text-stone-900 transition-colors underline underline-offset-2">
                    Feedback
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-4 border-t border-stone-200 flex justify-end space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;

