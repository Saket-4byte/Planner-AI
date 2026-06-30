import React from 'react';
import { Terminal, Cpu, Award, Zap, AlertTriangle, Play, RefreshCw, BarChart } from 'lucide-react';
import { BlackBoxLog, LearningLog } from '../types';

interface DeveloperHUDProps {
  blackBoxLogs: BlackBoxLog[];
  learningLogs: LearningLog[];
  onClearLogs: () => void;
  onAddBlackBoxLog: (action: string, reason: string, status: 'info' | 'success' | 'warning' | 'panic' | 'rescue') => void;
}

export default function DeveloperHUD({ blackBoxLogs, learningLogs, onClearLogs, onAddBlackBoxLog }: DeveloperHUDProps) {
  const [terminalFilter, setTerminalFilter] = React.useState<'all' | 'warning' | 'rescue'>('all');

  // Filter logs
  const filteredLogs = React.useMemo(() => {
    if (terminalFilter === 'all') return blackBoxLogs;
    if (terminalFilter === 'warning') return blackBoxLogs.filter(l => l.status === 'warning' || l.status === 'panic');
    return blackBoxLogs.filter(l => l.status === 'rescue');
  }, [blackBoxLogs, terminalFilter]);

  // Calculate average prediction error
  const averageError = React.useMemo(() => {
    if (learningLogs.length === 0) return 0;
    const sum = learningLogs.reduce((acc, log) => acc + Math.abs(log.errorPercentage), 0);
    return Math.round(sum / learningLogs.length);
  }, [learningLogs]);

  const handleSelfTest = () => {
    onAddBlackBoxLog('SYSTEM_SELF_TEST', 'Executing diagnostic cycle. Core neural nodes, timeline calculators, and API routers nominal.', 'info');
  };

  return (
    <div className="space-y-6 p-1">
      {/* Title */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-display font-black text-xl text-white italic tracking-tight">Developer HUD & Learning Ledger</h3>
          <p className="text-xs text-gray-400">Examine cognitive telemetry, inspect decision logic parameters, and view circadian learning records.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSelfTest}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs border border-white/10 text-white font-mono font-black tracking-wider transition-all cursor-pointer"
          >
            <Cpu size={12} className="text-[#00F0FF]" />
            <span>DIAGNOSTIC_RUN</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Logs ledger */}
        <div className="bg-[#111] border border-[#222] p-5 rounded-3xl flex flex-col justify-between h-[520px]">
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <div>
              <h4 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart size={16} className="text-[#00F0FF]" />
                <span>Cognitive Learning Ledger</span>
              </h4>
              <p className="text-xs text-gray-400 mt-1">Estimations vs. completed actual durations used to adjust AI planning coefficients.</p>
            </div>

            {/* Average Error Index */}
            <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#1A1A1A] flex items-center justify-between">
              <div>
                <p className="text-[9px] text-[#555] font-mono uppercase font-bold tracking-wider">Deviation Delta Index</p>
                <h5 className="text-3xl font-display font-black italic text-[#00F0FF] mt-1">{averageError}%</h5>
                <p className="text-[10px] text-gray-500 mt-0.5">Average estimation discrepancy</p>
              </div>
              <div className="p-2.5 bg-[#00F0FF]/10 text-[#00F0FF] rounded-xl border border-[#00F0FF]/20">
                <Award size={18} />
              </div>
            </div>

            {/* Logs List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mt-2">
              {learningLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-20 text-gray-500 space-y-2">
                  <Terminal size={20} className="text-gray-600" />
                  <p className="text-xs font-mono font-bold tracking-wider uppercase">LEARNING LEDGER EMPTY</p>
                </div>
              ) : (
                learningLogs.map(log => (
                  <div key={log.id} className="p-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl space-y-1.5">
                    <p className="text-xs font-display font-bold text-gray-200 line-clamp-1">{log.taskTitle}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-gray-500 font-medium">Est: {log.predicted}h</span>
                      <span className="text-gray-500 font-medium">Act: {log.actual}h</span>
                      <span className={`px-2 py-0.5 rounded font-black ${log.errorPercentage >= 0 ? 'bg-[#FF4545]/10 text-[#FF4545]' : 'bg-[#00FF66]/10 text-[#00FF66]'}`}>
                        {log.errorPercentage >= 0 ? `+${log.errorPercentage}%` : `${log.errorPercentage}%`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Black Box logs terminal ledger */}
        <div className="bg-[#111] border border-[#222] p-5 rounded-3xl lg:col-span-2 flex flex-col justify-between h-[520px]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h4 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal size={16} className="text-[#00F0FF] animate-pulse" />
                <span>Black Box Telemetry Ledger</span>
              </h4>
              <p className="text-xs text-gray-400 mt-1">Real-time log of systemic AI actions, protocol routing decisions, and stress metrics.</p>
            </div>

            {/* Filters */}
            <div className="flex gap-1 bg-black/60 p-0.5 border border-white/5 rounded-xl text-xs font-mono font-bold">
              <button 
                onClick={() => setTerminalFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${terminalFilter === 'all' ? 'bg-[#00F0FF] text-black font-black' : 'text-gray-400 hover:text-white'}`}
              >
                ALL
              </button>
              <button 
                onClick={() => setTerminalFilter('warning')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${terminalFilter === 'warning' ? 'bg-[#FF4545] text-black font-black' : 'text-gray-400 hover:text-white'}`}
              >
                WARNINGS
              </button>
              <button 
                onClick={() => setTerminalFilter('rescue')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${terminalFilter === 'rescue' ? 'bg-[#FFB800] text-black font-black' : 'text-gray-400 hover:text-white'}`}
              >
                RESCUES
              </button>
            </div>
          </div>

          {/* Terminal Console */}
          <div className="flex-1 bg-black/85 border border-[#1A1A1A] rounded-2xl p-4 my-4 font-mono text-[11px] text-[#00F0FF] overflow-y-auto space-y-3 scrollbar-none shadow-inner">
            {filteredLogs.length === 0 ? (
              <p className="text-gray-600 italic text-center py-20 font-bold uppercase tracking-wider">[SYSTEM LEDGER NULL: NO ACTIVE RECORDS MATCHING FILTER]</p>
            ) : (
              filteredLogs.map(log => {
                const getStatusStyle = (status: string) => {
                  if (status === 'success') return 'text-[#00FF66] font-bold';
                  if (status === 'warning') return 'text-[#FFB800] font-bold';
                  if (status === 'panic') return 'text-[#FF4545] font-black animate-pulse';
                  if (status === 'rescue') return 'text-[#00F0FF] font-bold';
                  return 'text-cyan-400 font-medium';
                };
                return (
                  <div key={log.id} className="border-b border-[#1A1A1A] pb-2.5 last:border-0">
                    <div className="flex items-center gap-2 text-gray-500">
                      <span>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className="text-[#00F0FF] font-black">{log.action}</span>
                      <span>•</span>
                      <span className={getStatusStyle(log.status)}>{log.status.toUpperCase()}</span>
                    </div>
                    <p className="text-gray-300 mt-1 leading-relaxed pl-2 border-l border-[#00F0FF]/20 font-sans text-xs">{log.reason}</p>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-[9px] font-mono text-[#555] font-bold tracking-wider uppercase">SYS TELEMETRY CORE: ONLINE</span>
            <button 
              onClick={onClearLogs}
              className="text-[10px] font-mono font-bold text-[#FF4545] hover:text-[#FF4545]/80 hover:underline transition-all cursor-pointer uppercase tracking-wider"
            >
              Flush Blackbox Memory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
