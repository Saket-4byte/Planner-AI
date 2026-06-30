import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, AlertTriangle, ListChecks, ArrowRight, Zap, X } from 'lucide-react';
import { Task, NavigatorResponse } from '../types';

interface NavigatorCoachProps {
  tasks: Task[];
  onAddTask: (task: { title: string; duration: number; priority: 'high' | 'medium' | 'low'; category: string; subtasks: string[] }) => void;
  onAddBlackBoxLog: (action: string, reason: string, status: 'info' | 'success' | 'warning' | 'panic' | 'rescue') => void;
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'navigator';
  text: string;
  timestamp: string;
  intent?: string;
  data?: any;
}

export default function NavigatorCoach({ tasks, onAddTask, onAddBlackBoxLog, onClose }: NavigatorCoachProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'navigator',
      text: "System initialized. I am the Navigator AI Coach. I monitor task complexity, risk safety, and schedule feasibility.\n\nTry commands like:\n• 'Create task Physics Lab for 3 hours high priority'\n• 'Check patent review task' (Evaluating risk)\n• 'Summarize my day'",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'active' | 'offline'>('active');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check initial API status from server
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('/api/api-status');
        if (response.ok) {
          const data = await response.json();
          setApiKeyStatus(data.status);
        } else {
          setApiKeyStatus('offline');
        }
      } catch (err) {
        setApiKeyStatus('offline');
      }
    };
    checkApiStatus();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageText = input;
    setInput('');
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessageText,
          tasks: tasks
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data: NavigatorResponse = await response.json();

      // Detect if response contains offline notice indicators
      if (data.reply.includes('[OFFLINE OS]')) {
        setApiKeyStatus('offline');
      } else {
        setApiKeyStatus('active');
      }

      const navigatorMsg: ChatMessage = {
        id: `nav-${Date.now()}`,
        sender: 'navigator',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent,
        data: data
      };

      // Perform state action based on Intent
      if (data.intent === 'CREATE' && data.task) {
        const generatedSubtasks = data.subtasks || ['Refine project scoping', 'Establish milestone milestones', 'Verify quality metrics'];
        const priority = data.task.priority || 'medium';
        const category = data.task.category || 'Code';

        onAddTask({
          title: data.task.title,
          duration: data.task.duration,
          priority: priority,
          category: category,
          subtasks: generatedSubtasks
        });

        onAddBlackBoxLog(
          'AUTONOMOUS_TASK_CREATION',
          `Autonomous agent created: "${data.task.title}" (${data.task.duration}h) prioritized as ${priority}.`,
          'success'
        );
      } else if (data.intent === 'EVALUATE' && data.riskEvaluation) {
        onAddBlackBoxLog(
          'COG_RISK_EVALUATION',
          `Evaluated task health: Risk determined as [${data.riskEvaluation.riskLevel.toUpperCase()}]. Recommendation generated.`,
          data.riskEvaluation.riskLevel === 'high' ? 'warning' : 'info'
        );
      } else if (data.intent === 'SUMMARY') {
        onAddBlackBoxLog(
          'BACKLOG_SUMMARY',
          `Calculated daily progress trajectory metrics. Delivered status report.`,
          'info'
        );
      }

      setMessages(prev => [...prev, navigatorMsg]);
    } catch (err) {
      console.error(err);
      setApiKeyStatus('offline');
      
      // Complete offline manual fallback in case of connection failure
      const fallbackMsg: ChatMessage = {
        id: `nav-error-${Date.now()}`,
        sender: 'navigator',
        text: "[CRITICAL DISCONNECT] AI model server timed out. Engaging local heuristic parser.\n\nNavigator Recommendation: Standby, or check your local setup. System functions remain fully functional.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full glassmorphism border-l border-white/10 text-white rounded-r-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm tracking-wide">NAVIGATOR COCH AI</h3>
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${apiKeyStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              {apiKeyStatus === 'active' ? 'COGNITIVE CORE ACTIVE' : 'LOCAL HEURISTICS MODE'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400">
            <Sparkles size={10} className="text-[#00F0FF]" />
            <span>v3.5 Flash</span>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center border border-white/5 hover:border-white/10"
              title="Hide Coach"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-gray-500 mb-1 px-1">{msg.timestamp}</span>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-violet-600 text-white rounded-tr-sm glow-purple' 
                : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-sm'
            }`}>
              {msg.text}

              {/* Dynamic Intent Renderers */}
              {msg.intent === 'CREATE' && msg.data?.task && (
                <div className="mt-3 pt-3 border-t border-white/10 bg-black/30 p-2.5 rounded-xl space-y-1.5 text-xs text-violet-300">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white flex items-center gap-1">
                      <Zap size={12} className="text-amber-400 fill-amber-400" /> Task Created
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 font-mono text-[10px] uppercase">
                      {msg.data.task.priority} Priority
                    </span>
                  </div>
                  <p className="text-gray-200 font-display font-medium text-sm">{msg.data.task.title}</p>
                  <p className="text-[11px] text-gray-400">Duration Allocation: <span className="text-white font-semibold font-mono">{msg.data.task.duration} Hours</span></p>
                  {msg.data.subtasks && msg.data.subtasks.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-white/5 pt-2">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Scheduled Checklist:</p>
                      {msg.data.subtasks.map((sub: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-300">
                          <span className="text-violet-400 font-mono font-bold">{idx + 1}.</span>
                          <span>{sub}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {msg.intent === 'EVALUATE' && msg.data?.riskEvaluation && (
                <div className="mt-3 pt-3 border-t border-white/10 bg-black/30 p-2.5 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white flex items-center gap-1">
                      <AlertTriangle size={12} className={msg.data.riskEvaluation.riskLevel === 'high' ? 'text-rose-500' : 'text-amber-500'} /> Cognitive Health Risk
                    </span>
                    <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] uppercase font-semibold ${
                      msg.data.riskEvaluation.riskLevel === 'high' 
                        ? 'bg-rose-500/20 text-rose-400' 
                        : msg.data.riskEvaluation.riskLevel === 'medium'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {msg.data.riskEvaluation.riskLevel}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-[11px] text-gray-300 leading-normal italic">
                    "{msg.data.riskEvaluation.recommendation}"
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-gray-500 mb-1 px-1">Analyzing...</span>
            <div className="bg-white/5 text-gray-400 border border-white/5 rounded-2xl rounded-tl-sm p-3 flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
              <span className="text-xs font-mono text-violet-400">NAVIGATOR THINKING...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type instruction (e.g. 'add task', 'evaluate...')"
          className="flex-1 bg-white/5 hover:bg-white/10 focus:bg-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none border border-white/5 focus:border-violet-500/50 transition-all placeholder-gray-500 font-sans"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-all flex items-center justify-center shrink-0 shadow-lg cursor-pointer"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
