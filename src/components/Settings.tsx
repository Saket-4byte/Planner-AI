import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, RotateCcw, AlertTriangle, ShieldAlert, Cpu, Bot, CheckCircle, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface SettingsProps {
  focusBudget: number;
  onSetFocusBudget: (hours: number) => void;
  onResetTasks: () => void;
  onClearLogs: () => void;
  onTriggerPanic: () => void;
  onTriggerRescue: () => void;
  onAddBlackBoxLog: (action: string, reason: string, status: 'info' | 'success' | 'warning' | 'panic' | 'rescue') => void;
}

export default function Settings({
  focusBudget,
  onSetFocusBudget,
  onResetTasks,
  onClearLogs,
  onTriggerPanic,
  onTriggerRescue,
  onAddBlackBoxLog
}: SettingsProps) {
  
  const [apiStatus, setApiStatus] = useState<'active' | 'offline' | 'checking'>('checking');
  const [activeModel, setActiveModel] = useState<string>('none');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/api-status');
        if (response.ok) {
          const data = await response.json();
          setApiStatus(data.status);
          setActiveModel(data.model);
        } else {
          setApiStatus('offline');
        }
      } catch (e) {
        setApiStatus('offline');
      }
    };
    fetchStatus();
  }, []);

  const handleReset = () => {
    onResetTasks();
    onAddBlackBoxLog('SYSTEM_COGNITIVE_RESET', 'Initiated hard application database reset to default initial assets.', 'success');
  };

  const handleClearLogs = () => {
    onClearLogs();
    onAddBlackBoxLog('SYSTEM_TELEMETRY_FLUSH', 'Flushed all historic Blackbox event registers.', 'info');
  };

  return (
    <div className="space-y-6 p-1">
      {/* Title */}
      <div>
        <h3 className="font-display font-black text-xl text-white italic tracking-tight">System Settings & OS Controls</h3>
        <p className="text-xs text-gray-400">Configure core logical constraints, trigger diagnostic overrides, and control telemetry parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Constraints Card */}
        <div className="bg-[#111] border border-[#222] p-5 rounded-3xl space-y-4">
          <h4 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu size={16} className="text-[#00F0FF]" />
            <span>Capacity Constraint Parameters</span>
          </h4>

          {/* Daily Focus Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-400 font-semibold">Daily Focus Capacity Budget</span>
              <span className="text-[#00F0FF] font-black">{focusBudget} Hours</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="0.5"
              value={focusBudget}
              onChange={e => onSetFocusBudget(parseFloat(e.target.value))}
              className="w-full accent-[#00F0FF] bg-white/5 rounded-lg h-2 cursor-pointer"
            />
            <p className="text-[10px] text-gray-500 italic">Declares the absolute limit of deep work available for scheduler calculations today.</p>
          </div>
        </div>

        {/* Emergency Overrides Card */}
        <div className="bg-[#111] border border-[#222] p-5 rounded-3xl space-y-4">
          <h4 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert size={16} className="text-[#FF4545]" />
            <span>Manual Emergency Overrides</span>
          </h4>
          <p className="text-xs text-gray-400">Force trigger defensive UI protocols instantly to evaluate safety layouts.</p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onTriggerPanic}
              className="px-4 py-3 rounded-xl bg-[#FF4545]/10 hover:bg-[#FF4545]/15 text-[#FF4545] border border-[#FF4545]/20 text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01]"
            >
              <AlertTriangle size={13} className="animate-pulse" />
              <span>Force Panic Mode</span>
            </button>

            <button
              onClick={onTriggerRescue}
              className="px-4 py-3 rounded-xl bg-[#FFB800]/10 hover:bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/20 text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01]"
            >
              <Cpu size={13} />
              <span>Force Rescue Mode</span>
            </button>
          </div>
        </div>

        {/* Gemini AI Core Integration Card */}
        <div className="bg-[#111] border border-[#222] p-6 rounded-3xl lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="space-y-1">
              <h4 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-[#00F0FF]" />
                <span>Cognitive AI Core Status</span>
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Check whether Saver.AI's server-side autonomous Gemini engine is fully linked and active.
              </p>
            </div>
            <div>
              {apiStatus === 'checking' && (
                <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-400 flex items-center gap-1.5">
                  <RefreshCw size={12} className="animate-spin" />
                  <span>CHECKING_CORE...</span>
                </span>
              )}
              {apiStatus === 'active' && (
                <span className="px-3 py-1.5 rounded-xl bg-[#00FF66]/10 border border-[#00FF66]/20 text-xs font-mono text-[#00FF66] font-bold flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
                  <span>INTEGRATED & ACTIVE ({activeModel.toUpperCase()})</span>
                </span>
              )}
              {apiStatus === 'offline' && (
                <span className="px-3 py-1.5 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/20 text-xs font-mono text-[#FFB800] font-bold flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-[#FFB800]" />
                  <span>OFFLINE_MOCK_FALLBACK</span>
                </span>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-400 leading-relaxed space-y-2">
            <p>
              Autonomous capabilities are executed entirely on the server-side to hide API credentials safely from browser inspector packages.
            </p>
            {apiStatus === 'offline' ? (
              <div className="p-3.5 bg-[#FFB800]/5 border border-[#FFB800]/10 rounded-2xl flex gap-3 text-gray-300">
                <AlertCircle size={18} className="text-[#FFB800] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-mono text-[10px] text-[#FFB800] uppercase font-bold tracking-wider">Secrets panel configuration required</p>
                  <p className="text-[11px] text-gray-400">
                    To link the live Gemini AI engine, navigate to the <strong className="text-white">Settings &gt; Secrets</strong> tab in the sidebar of the AI Studio development environment and input your <strong className="text-white">GEMINI_API_KEY</strong>. The server will hot-reload and connect dynamically.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-[#00FF66]/5 border border-[#00FF66]/10 rounded-2xl flex gap-3 text-gray-300">
                <CheckCircle size={18} className="text-[#00FF66] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-mono text-[10px] text-[#00FF66] uppercase font-bold tracking-wider">Cognitive pipeline synced</p>
                  <p className="text-[11px] text-gray-400">
                    The cognitive core is actively routing logical subtask layouts, circadian energy evaluations, and scheduling recommendations using the real-time server-side Gemini client.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hard System Reset overrides */}
        <div className="bg-[#111] border border-[#222] p-6 rounded-3xl lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <RotateCcw size={16} className="text-[#00F0FF]" />
              <span>Database hard resets</span>
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Flush task databases and log stores entirely, restoring original Saver.AI default structures.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center my-auto w-full">
            <button
              onClick={handleClearLogs}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-wider text-gray-300 border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer hover:text-white"
            >
              Flush Telemetry Logs
            </button>

            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FF4545] hover:bg-[#FF4545]/90 text-xs font-black uppercase tracking-wider text-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(255,69,69,0.35)] hover:scale-[1.01]"
            >
              <RotateCcw size={13} className="stroke-[3]" />
              <span>Reset Core OS Database</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
