import React, { useState, useEffect } from 'react';
import { Terminal, RefreshCw, Zap, ShieldAlert, CheckSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { Task } from '../types';

interface RescueOverlayProps {
  tasks: Task[];
  isActive: boolean;
  onClose: () => void;
  onExecuteRescue: (postponedIds: string[], durationTrims: Record<string, number>) => void;
  onAddBlackBoxLog: (action: string, reason: string, status: 'info' | 'success' | 'warning' | 'panic' | 'rescue') => void;
}

export default function RescueOverlay({ tasks, isActive, onClose, onExecuteRescue, onAddBlackBoxLog }: RescueOverlayProps) {
  const [step, setStep] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const pendingTasks = React.useMemo(() => {
    return tasks.filter(t => t.status !== 'completed' && t.status !== 'postponed');
  }, [tasks]);

  // Determine low/med priority tasks to postpone, and high priority to trim
  const rescueCalculations = React.useMemo(() => {
    const toPostpone = pendingTasks.filter(t => t.priority === 'low' || (t.priority === 'medium' && t.duration > 2));
    const toTrim = pendingTasks.filter(t => t.priority === 'high');
    
    const postponedIds = toPostpone.map(t => t.id);
    const durationTrims: Record<string, number> = {};
    toTrim.forEach(t => {
      // Trim task durations by 25% (Scope reduction!)
      durationTrims[t.id] = parseFloat((t.duration * 0.75).toFixed(1));
    });

    return { postponedIds, durationTrims, toPostpone, toTrim };
  }, [pendingTasks]);

  // Build sequential terminal animations
  useEffect(() => {
    if (!isActive) {
      setStep(0);
      setTerminalLogs([]);
      setProgress(0);
      return;
    }

    const logs = [
      '⚡ INITIATING THERMODYNAMIC TIMELINE DEFENSE CORE...',
      '🔍 SCANNING ACTIVE BACKLOG QUEUES FOR CAPACITY BOTTLENECKS...',
      `⚠️ DETECTED COGNITIVE OVERRUN: ${pendingTasks.reduce((acc, t) => acc + t.duration, 0)} hours pending vs focus budget.`,
      '🚨 RESOLVING CHRONO-CONGESTION: ENGAGING TIMELINE SHRED PROTOCOL...',
      `📦 POSTPONING LOWER PRIORITY ASSETS FOR DEFERRED SPRINT SESSIONS: ${
        rescueCalculations.toPostpone.length > 0 
          ? rescueCalculations.toPostpone.map(t => `"${t.title}"`).join(', ') 
          : 'None'
      }`,
      `✂️ PRUNING CRITICAL SCOPE COEFFECIENTS. COMPACTING REMAINING HIGH-PRIORITY HOURS BY -25%: ${
        rescueCalculations.toTrim.map(t => `"${t.title}" (Trimmed to ${(t.duration * 0.75).toFixed(1)}h)`).join(', ')
      }`,
      '🌀 ALIGNING REMAINING OBJECTIVES TO CIRCADIAN COGNITIVE ENERGY PEAKS...',
      '📈 TIMELINE OPTIMIZATION REBUILD COMPLETE. NOMINAL SCHEDULING SAFEGUARDS RESTORED.',
      '✅ PROTOCOL CONCLUDED. PREPARED FOR BACKLOG TIMELINE SYNC.'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < logs.length) {
        setTerminalLogs(prev => [...prev, logs[currentStep]]);
        currentStep++;
        setStep(currentStep);
        setProgress(Math.round((currentStep / logs.length) * 100));
      } else {
        clearInterval(interval);
      }
    }, 900);

    return () => clearInterval(interval);
  }, [isActive, pendingTasks, rescueCalculations]);

  const handleSyncTimeline = () => {
    onExecuteRescue(rescueCalculations.postponedIds, rescueCalculations.durationTrims);
    onAddBlackBoxLog(
      'EMERGENCY_RESCUE_EXECUTED',
      `Executed Emergency Rescue Protocol. Postponed ${rescueCalculations.toPostpone.length} low-priority tasks and trimmed high-priority scopes by 25%. Timeline safety indices verified.`,
      'rescue'
    );
    onClose();
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Amber scanlines grid backdrop */}
      <div className="absolute inset-0 cyber-grid bg-amber-950/10 pointer-events-none"></div>
      
      <div className="max-w-2xl w-full bg-[#0A0A0A] border border-[#FFB800]/30 p-6 md:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[480px] shadow-[0_0_50px_rgba(255,184,0,0.15)]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFB800]/10 text-[#FFB800] animate-spin [animation-duration:12s]">
              <RefreshCw size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-white uppercase tracking-wide">EMERGENCY RESCUE SEQUENCE</h2>
              <p className="text-[9px] text-[#FFB800] uppercase tracking-widest font-mono font-bold font-mono">timeline simulation and complexity compaction active</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[10px] font-mono font-black text-[#FF4545] hover:text-[#FF4545]/80 hover:underline uppercase transition-all tracking-widest cursor-pointer"
          >
            Abort
          </button>
        </div>

        {/* Console Box */}
        <div className="my-6 bg-black/85 border border-[#1A1A1A] rounded-2xl p-5 font-mono text-[#FFB800] text-[11px] leading-relaxed space-y-2.5 h-[240px] overflow-y-auto scrollbar-none shadow-inner">
          {terminalLogs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-[#FFB800]/45 shrink-0">~ $</span>
              <p className={log.startsWith('✅') || log.startsWith('📈') ? 'text-[#00FF66] font-bold' : ''}>{log}</p>
            </div>
          ))}
          {step < 9 && (
            <div className="flex gap-2 items-center text-amber-500/60 animate-pulse">
              <span>~ $</span>
              <span>COMPUTING_SCHEDULER_REORDER...</span>
              <span className="inline-block w-1.5 h-3 bg-[#FFB800] rounded-sm"></span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-[9px] font-mono text-gray-500 font-bold uppercase tracking-wider">
            <span>OS REBUILD PROGRESS</span>
            <span className="text-[#FFB800] font-black">{progress}%</span>
          </div>
          <div className="w-full bg-white/5 border border-white/5 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#FFB800] h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(255,184,0,0.4)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Bottom Confirmation Area */}
        <div className="border-t border-white/5 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[9px] text-gray-500 font-mono leading-normal max-w-sm font-bold uppercase tracking-wider">
            CONFIRMING THIS OPERATION SYNC WILL PERMANENTLY ADJUST BACKLOG TASK DURATION ESTIMATIONS BY -25% AND POSTPONE EXTRANEOUS LOW-PRIORITY TASKS.
          </p>

          <button
            onClick={handleSyncTimeline}
            disabled={step < 9}
            className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-[#FFB800] hover:bg-[#FFB800]/90 disabled:opacity-40 text-xs font-black uppercase text-black tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,184,0,0.35)] hover:scale-[1.01] cursor-pointer"
          >
            <CheckCircle2 size={14} className="stroke-[3]" />
            <span>Apply Reordered Timeline</span>
          </button>
        </div>

      </div>
    </div>
  );
}
