import React, { useState, useEffect } from 'react';
import { ShieldAlert, Zap, ArrowRight, CheckCircle2, Eye, HelpCircle } from 'lucide-react';
import { Task } from '../types';

interface PanicOverlayProps {
  tasks: Task[];
  isActive: boolean;
  onClose: () => void;
  onToggleTaskStatus: (id: string) => void;
  onAddBlackBoxLog: (action: string, reason: string, status: 'info' | 'success' | 'warning' | 'panic' | 'rescue') => void;
}

export default function PanicOverlay({ tasks, isActive, onClose, onToggleTaskStatus, onAddBlackBoxLog }: PanicOverlayProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Isolate a single MVP high priority pending task
  const mvpTask = React.useMemo(() => {
    return tasks.find(t => t.priority === 'high' && t.status !== 'completed' && t.status !== 'postponed') || tasks[0];
  }, [tasks]);

  // Countdown timer logic inside panic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isTimerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteMvp = () => {
    if (!mvpTask) return;
    onToggleTaskStatus(mvpTask.id);
    onAddBlackBoxLog('PANIC_MVP_COMPLETED', `Panicked user successfully completed MVP target task: "${mvpTask.title}".`, 'success');
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Red grid backdrop */}
      <div className="absolute inset-0 cyber-grid bg-red-950/10 pointer-events-none"></div>
      
      <div className="max-w-2xl w-full bg-[#0A0A0A] border border-[#FF4545]/30 p-6 md:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[460px] shadow-[0_0_50px_rgba(255,69,69,0.15)]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF4545]/10 text-[#FF4545] animate-pulse">
              <ShieldAlert size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-white uppercase tracking-wide">PANIC DEFENSE SEQUENCE ACTIVE</h2>
              <p className="text-[9px] text-[#FF4545] uppercase tracking-widest font-mono font-bold">Clutter suppression level: MAXIMUM</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#FF4545]/10 hover:bg-[#FF4545]/25 text-[#FF4545] text-xs font-mono font-black transition-all border border-[#FF4545]/20 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
          >
            <Eye size={12} className="stroke-[2.5]" />
            <span>DISENGAGE</span>
          </button>
        </div>

        {/* Content Body */}
        {mvpTask ? (
          <div className="my-6 space-y-6">
            <div className="text-center space-y-1.5 max-w-lg mx-auto">
              <span className="px-2.5 py-0.5 rounded bg-[#FF4545]/10 text-[#FF4545] border border-[#FF4545]/20 font-mono text-[9px] uppercase font-black tracking-widest">
                Current Isolated MVP Target
              </span>
              <h3 className="text-xl md:text-2xl font-display font-black text-white tracking-tight leading-snug">
                {mvpTask.title}
              </h3>
              <p className="text-xs text-gray-400 italic">"No distractions. No secondary backlogs. Just close this single objective."</p>
            </div>

            {/* Simulated Minimalistic Countdown Clock */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="font-mono text-5xl font-black italic tracking-widest text-[#FF4545] bg-[#FF4545]/5 px-8 py-4 rounded-2xl border border-[#FF4545]/20 shadow-[0_0_15px_rgba(255,69,69,0.05)]">
                {formatTime(timeLeft)}
              </div>
              <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-bold">SUPPRESSED FOCUS TIMER</p>
            </div>

            {/* Checklist of Subtasks */}
            {mvpTask.subtasks && mvpTask.subtasks.length > 0 && (
              <div className="max-w-md mx-auto space-y-1.5">
                <p className="text-[9px] font-mono text-gray-500 uppercase tracking-wider text-center font-bold">MVP Subtask Milestones</p>
                <div className="space-y-1.5 bg-black/40 border border-white/5 p-3 rounded-2xl max-h-[110px] overflow-y-auto">
                  {mvpTask.subtasks.map((sub, idx) => {
                    const isCompleted = mvpTask.completedSubtasks?.includes(sub);
                    return (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                        <CheckCircle2 size={12} className={isCompleted ? 'text-[#00FF66]' : 'text-gray-600'} />
                        <span className={isCompleted ? 'line-through text-gray-500' : ''}>{sub}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 space-y-2">
            <CheckCircle2 size={36} className="text-[#00FF66] mx-auto" />
            <h4 className="font-display font-black text-base text-white">ALL OBJECTIVES SATISFIED</h4>
            <p className="text-xs">No active high-priority objectives remain in the backlog index.</p>
          </div>
        )}

        {/* Bottom controls */}
        {mvpTask && (
          <div className="border-t border-white/5 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-[9px] text-gray-500 font-mono font-bold uppercase tracking-wider max-w-sm leading-normal">
              <HelpCircle size={12} className="shrink-0" />
              <span>ENGAGING THIS PROTOCOL IS DESIGNED TO REDUCE COGNITIVE STRESS IN INDIVIDUAL SPRINT CYCLES.</span>
            </div>

            <button
              onClick={handleCompleteMvp}
              className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-[#FF4545] hover:bg-[#FF4545]/90 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,69,69,0.35)] hover:scale-[1.01] cursor-pointer"
            >
              <CheckCircle2 size={14} className="stroke-[3]" />
              <span>Finalize MVP Task</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
