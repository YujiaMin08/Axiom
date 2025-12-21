import React, { useState, useEffect } from 'react';

interface RealtimeScenarioChatProps {
  appData: {
    type: 'realtime_scenario';
    topic: string;
    initial_setting: string;
  };
}

const RealtimeScenarioChat: React.FC<RealtimeScenarioChatProps> = ({ appData }) => {
  const { topic, initial_setting } = appData;
  
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);

  // Initialize chat on mount
  useEffect(() => {
    startChat();
  }, []);

  const startChat = async () => {
    try {
      setIsWaitingResponse(true);
      const response = await fetch('http://localhost:3001/api/scenario/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, setting: initial_setting })
      });
      
      if (!response.ok) throw new Error('Failed to start chat');
      
      const data = await response.json();
      setChatHistory([data]);
    } catch (error) {
      console.error('Failed to start chat:', error);
      setChatHistory([{
        npc_says: "Sorry, I couldn't start the conversation. Please try again.",
        your_options: [],
        situation_context: "Error loading scenario"
      }]);
    } finally {
      setIsWaitingResponse(false);
    }
  };

  const handleChoiceClick = async (optionIndex: number) => {
    const currentTurn = chatHistory[chatHistory.length - 1];
    if (!currentTurn || isWaitingResponse) return;
    
    try {
      setIsWaitingResponse(true);
      
      const response = await fetch('http://localhost:3001/api/scenario/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          conversation_history: chatHistory.slice(0, -1).map(turn => ({
            npc_says: turn.npc_says,
            user_choice: turn.user_choice
          })),
          user_choice_index: optionIndex,
          last_options: currentTurn.your_options
        })
      });
      
      if (!response.ok) throw new Error('Failed to continue chat');
      
      const data = await response.json();
      
      // Update last turn with user's choice
      const updatedHistory = [...chatHistory];
      updatedHistory[updatedHistory.length - 1] = {
        ...currentTurn,
        user_choice: currentTurn.your_options[optionIndex].text,
        user_choice_index: optionIndex
      };
      
      // Add new turn if not ending
      if (!data.is_conversation_ending) {
        updatedHistory.push(data);
      } else {
        updatedHistory[updatedHistory.length - 1].is_ended = true;
      }
      
      setChatHistory(updatedHistory);
      
    } catch (error) {
      console.error('Failed to continue chat:', error);
    } finally {
      setIsWaitingResponse(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-stone-50/30 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-stone-200/50">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-stone-400">Conversation</span>
          <span className="text-xs text-stone-400 font-mono">Turn {chatHistory.length}</span>
        </div>
        <p className="text-sm font-serif italic text-stone-600 mt-2">{initial_setting}</p>
      </div>
      
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {chatHistory.map((turn, idx) => (
          <div key={idx} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Situation Context */}
            {turn.situation_context && (
              <div className="border-l-2 border-stone-300 pl-4 py-2">
                <p className="text-xs text-stone-500 leading-relaxed">{turn.situation_context}</p>
              </div>
            )}
            
            {/* NPC Message */}
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
                <p className="text-sm text-stone-800 leading-relaxed">{turn.npc_says}</p>
              </div>
            </div>
            
            {/* User's Choice (if made) */}
            {turn.user_choice && (
              <div className="flex justify-end animate-in slide-in-from-right-4 duration-300">
                <div className="max-w-[80%] bg-stone-800 text-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm leading-relaxed">{turn.user_choice}</p>
                </div>
              </div>
            )}
            
            {/* Response Options (only for current turn) */}
            {!turn.user_choice && idx === chatHistory.length - 1 && turn.your_options && turn.your_options.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-3">Your Response</p>
                {turn.your_options.map((opt: any, optIdx: number) => (
                  <button
                    key={optIdx}
                    onClick={() => handleChoiceClick(optIdx)}
                    disabled={isWaitingResponse}
                    className="w-full text-left border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 rounded-lg p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-stone-800 leading-relaxed">{opt.text}</p>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400 mt-2">{opt.tone}</p>
                      </div>
                      <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Show if conversation ended */}
            {turn.is_ended && (
              <div className="border border-stone-300 bg-stone-50 p-4 rounded-lg text-center">
                <p className="text-sm text-stone-700 font-serif italic">Conversation completed</p>
              </div>
            )}
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isWaitingResponse && (
          <div className="flex items-center justify-center py-8 animate-in fade-in duration-300">
            <div className="animate-spin w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full mr-3"></div>
            <p className="text-sm text-stone-500 italic">thinking...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeScenarioChat;

