
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

interface Props {
  topic: string;
  onClose: () => void;
}

// Audio Encoding & Decoding Helpers
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const SocraticMentor: React.FC<Props> = ({ topic, onClose }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState<{ user: string; model: string }>({ user: '', model: '' });
  const [history, setHistory] = useState<string[]>([]);
  
  const aiRef = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY || '' }));
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);

  useEffect(() => {
    const startSession = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextsRef.current = { input: inputAudioContext, output: outputAudioContext };

        const sessionPromise = aiRef.current.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } },
            },
            systemInstruction: `You are the Spirit of the Axiom, a Socratic mentor. The user has been studying "${topic}". Engage them in a deep, philosophical dialogue. Use the Socratic method: ask probing questions that lead them to their own conclusions. Be concise, elegant, and wise. Do not give direct answers unless they are stuck.`,
            outputAudioTranscription: {},
            inputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => {
              setIsConnecting(false);
              const source = inputAudioContext.createMediaStreamSource(stream);
              const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) {
                  int16[i] = inputData[i] * 32768;
                }
                const pcmBlob = {
                  data: encode(new Uint8Array(int16.buffer)),
                  mimeType: 'audio/pcm;rate=16000',
                };
                
                sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              // Handle Transcription
              if (message.serverContent?.outputTranscription) {
                setTranscription(prev => ({ ...prev, model: prev.model + message.serverContent!.outputTranscription!.text }));
              } else if (message.serverContent?.inputTranscription) {
                setTranscription(prev => ({ ...prev, user: prev.user + message.serverContent!.inputTranscription!.text }));
              }

              if (message.serverContent?.turnComplete) {
                setTranscription(prev => {
                    if (prev.user || prev.model) {
                        setHistory(h => [...h, prev.user || "...", prev.model || "..."].slice(-6));
                    }
                    return { user: '', model: '' };
                });
              }

              // Handle Audio Output
              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio) {
                setIsSpeaking(true);
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                const source = outputAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContext.destination);
                source.onended = () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) setIsSpeaking(false);
                };
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              }

              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setIsSpeaking(false);
              }
            },
            onclose: () => console.log("Session closed"),
            onerror: (e) => console.error("Session error", e),
          }
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error("Failed to start Socratic Dialogue", err);
      }
    };

    startSession();

    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextsRef.current) {
        audioContextsRef.current.input.close();
        audioContextsRef.current.output.close();
      }
    };
  }, [topic]);

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900 text-stone-100 flex flex-col items-center justify-center animate-in fade-in duration-700">
      <div className="absolute top-12 left-12">
        <button onClick={onClose} className="text-[10px] uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-opacity">
          Exit Dialogue
        </button>
      </div>

      <div className="flex flex-col items-center space-y-12 max-w-2xl px-8 text-center">
        {/* The Axiom Core Visual */}
        <div className="relative flex items-center justify-center w-64 h-64">
           {/* Outer Pulsing Rings */}
           <div className={`absolute inset-0 rounded-full border border-stone-800 transition-all duration-1000 ${isSpeaking ? 'scale-150 opacity-0' : 'scale-100 opacity-20 animate-ping'}`}></div>
           <div className={`absolute inset-0 rounded-full border border-stone-700 transition-all duration-700 ${isSpeaking ? 'scale-125 opacity-20' : 'scale-100 opacity-10'}`}></div>
           
           {/* Inner Euclidean Geometric Form */}
           <svg viewBox="0 0 100 100" className={`w-48 h-48 transition-transform duration-1000 ${isSpeaking ? 'rotate-90' : 'rotate-0'}`}>
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1 2" />
              <path d="M 50 2 L 98 50 L 50 98 L 2 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-40" />
              <circle cx="50" cy="50" r={isSpeaking ? "10" : "4"} fill="currentColor" className="transition-all duration-300" />
           </svg>
           
           <div className="absolute -bottom-16">
              <span className="text-[10px] uppercase tracking-[0.5em] text-stone-500">
                {isConnecting ? 'Aligning with the Void...' : isSpeaking ? 'The Oracle Speaks' : 'Listening...'}
              </span>
           </div>
        </div>

        {/* Transcriptions */}
        <div className="space-y-6 min-h-[120px]">
           <p className="serif text-3xl italic font-light leading-relaxed opacity-90 animate-in fade-in slide-in-from-bottom-4">
             {transcription.model || (transcription.user ? "Thinking..." : history[history.length - 1] || "Speak, and the Truth shall manifest.")}
           </p>
           {transcription.user && (
             <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
               Your Inquiry: {transcription.user}
             </p>
           )}
        </div>

        {/* History Ticker */}
        <div className="mt-12 space-y-2 opacity-20">
           {history.slice(0, -1).map((line, i) => (
             <p key={i} className="text-[10px] uppercase tracking-widest truncate max-w-md">{line}</p>
           ))}
        </div>
      </div>
    </div>
  );
};

export default SocraticMentor;
