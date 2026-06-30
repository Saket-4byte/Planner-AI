import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Zap, ShieldAlert, CheckCircle2, ChevronRight, Wind } from 'lucide-react';
import { Task, Priority } from '../types';

interface FocusHubProps {
  tasks: Task[];
  onToggleSubtask: (taskId: string, subtask: string) => void;
  onSetTaskStatus: (taskId: string, status: 'in_progress' | 'completed' | 'backlog') => void;
  onAddBlackBoxLog: (action: string, reason: string, status: 'info' | 'success' | 'warning' | 'panic' | 'rescue') => void;
  onLogCompletedTask: (taskTitle: string, predicted: number, actual: number) => void;
}

export default function FocusHub({ tasks, onToggleSubtask, onSetTaskStatus, onAddBlackBoxLog, onLogCompletedTask }: FocusHubProps) {
  const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'postponed');
  
  const [selectedTaskId, setSelectedTaskId] = useState<string>(pendingTasks[0]?.id || '');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // default 25 min
  const [isActive, setIsActive] = useState(false);
  const [timerType, setTimerType] = useState<'pomodoro' | 'sprint'>('pomodoro');
  const [actualHoursSpent, setActualHoursSpent] = useState(1);

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || pendingTasks[0];

  // Set initial selected task if none
  useEffect(() => {
    if (!selectedTaskId && pendingTasks.length > 0) {
      setSelectedTaskId(pendingTasks[0].id);
    }
  }, [tasks, pendingTasks, selectedTaskId]);

  // Countdown clock core
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      onAddBlackBoxLog('FOCUS_TIMER_EXPIRED', `Focus sprint completed successfully for: "${selectedTask?.title}".`, 'success');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, selectedTask]);

  const toggleTimer = () => {
    if (!selectedTask) return;
    setIsActive(!isActive);
    if (!isActive && selectedTask.status !== 'in_progress') {
      onSetTaskStatus(selectedTask.id, 'in_progress');
      onAddBlackBoxLog('TASK_SPRINT_INITIATED', `Engaged Active Focus State on task: "${selectedTask.title}".`, 'info');
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(timerType === 'pomodoro' ? 25 * 60 : 50 * 60);
  };

  const handleTimerTypeChange = (type: 'pomodoro' | 'sprint') => {
    setTimerType(type);
    setIsActive(false);
    setTimeLeft(type === 'pomodoro' ? 25 * 60 : 50 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Complete task entirely
  const handleCompleteTask = () => {
    if (!selectedTask) return;
    onSetTaskStatus(selectedTask.id, 'completed');
    onAddBlackBoxLog('TASK_MANUALLY_CLOSED', `User finalized and closed task: "${selectedTask.title}". actual duration logged: ${actualHoursSpent}h.`, 'success');
    
    // Log performance metrics
    onLogCompletedTask(selectedTask.title, selectedTask.duration, actualHoursSpent);
    setIsActive(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1">
      {/* Task Selector Rail */}
      <div className="glassmorphism p-5 rounded-2xl flex flex-col h-[520px]">
        <h3 className="font-display font-bold text-base text-white">Focus Targets Queue</h3>
        <p className="text-xs text-gray-400 mt-1">Select an active backlog index to engage timeline clocks.</p>

        <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
          {pendingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 text-gray-500 space-y-2">
              <CheckCircle size={24} className="text-emerald-500" />
              <p className="text-xs font-mono">ALL CHANNELS COMPLETED</p>
            </div>
          ) : (
            pendingTasks.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTaskId(t.id);
                  setIsActive(false);
                  resetTimer();
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  selectedTaskId === t.id
                    ? 'bg-[#00F0FF]/10 border-[#00F0FF]/30 shadow-inner'
                    : 'bg-[#0F0F0F] border-white/5 hover:bg-white/5 text-gray-300'
                }`}
              >
                <div className="min-w-0 mr-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${t.status === 'in_progress' ? 'bg-[#FF4545] animate-pulse' : 'bg-gray-600'}`}></span>
                    <p className={`font-display font-bold text-xs truncate ${selectedTaskId === t.id ? 'text-[#00F0FF]' : 'text-gray-300'}`}>
                      {t.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400 font-mono">
                    <span className="bg-white/5 px-1.5 py-0.2 rounded">{t.category}</span>
                    <span>•</span>
                    <span>Est: {t.duration}h</span>
                  </div>
                </div>
                <ChevronRight size={14} className={selectedTaskId === t.id ? 'text-[#00F0FF]' : 'text-gray-500'} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Sprint Dashboard */}
      <div className="glassmorphism p-5 rounded-2xl lg:col-span-2 flex flex-col justify-between h-[520px] relative overflow-hidden">
        {/* Visual background ambient grids */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl -z-10"></div>

        {selectedTask ? (
          <>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 pb-4">
              <div className="text-center md:text-left min-w-0 flex-1">
                <span className="px-2.5 py-0.5 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 font-mono text-[9px] uppercase font-bold tracking-wider">
                  {selectedTask.category} • {selectedTask.priority} Priority
                </span>
                <h4 className="font-display font-extrabold text-lg text-white mt-1.5 truncate">
                  {selectedTask.title}
                </h4>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5 justify-center md:justify-start font-mono">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  {isActive ? 'Sprint Core Running' : 'Standby Mode'}
                </p>
              </div>

              {/* Timer Controls Selection */}
              <div className="flex p-0.5 rounded-xl bg-[#0A0A0A] border border-white/5 shrink-0">
                <button
                  onClick={() => handleTimerTypeChange('pomodoro')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black font-mono transition-all cursor-pointer ${
                    timerType === 'pomodoro' ? 'bg-[#00F0FF] text-black shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  POMODORO
                </button>
                <button
                  onClick={() => handleTimerTypeChange('sprint')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black font-mono transition-all cursor-pointer ${
                    timerType === 'sprint' ? 'bg-[#00F0FF] text-black shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  50M SPRINT
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto py-4">
              {/* Massive clock widget */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative w-44 h-44 flex items-center justify-center rounded-full border border-white/10 bg-black/40 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
                  {/* Rotating progress wheel */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90 scale-95" viewBox="0 0 36 36">
                    <path
                      className="text-white/5"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#00F0FF] transition-all duration-300"
                      strokeWidth="1.5"
                      strokeDasharray={`${(timeLeft / (timerType === 'pomodoro' ? 25 * 60 : 50 * 60)) * 100}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="text-center space-y-1">
                    <span className="text-4xl font-mono font-black text-white tracking-widest">{formatTime(timeLeft)}</span>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono font-bold">REMAINING</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={toggleTimer}
                    className="p-3 rounded-full bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black transition-all shadow-[0_0_15px_rgba(0,240,255,0.35)] flex items-center justify-center cursor-pointer hover:scale-[1.05]"
                  >
                    {isActive ? <Pause size={16} className="stroke-[3]" /> : <Play size={16} className="stroke-[3]" />}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/10 flex items-center justify-center cursor-pointer"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>

              {/* Subtask micro checklists */}
              <div className="flex flex-col justify-between">
                <div>
                  <h5 className="text-[10px] uppercase font-mono tracking-widest text-[#555] font-bold mb-2.5">Subtask Decomposition</h5>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {selectedTask.subtasks && selectedTask.subtasks.length > 0 ? (
                      selectedTask.subtasks.map((sub, idx) => {
                        const isCompleted = selectedTask.completedSubtasks?.includes(sub);
                        return (
                          <button
                            key={idx}
                            onClick={() => onToggleSubtask(selectedTask.id, sub)}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
                              isCompleted
                                ? 'bg-emerald-500/5 border-emerald-500/10 text-gray-400'
                                : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                            }`}
                          >
                            <CheckCircle2 size={14} className={isCompleted ? 'text-emerald-500' : 'text-gray-600'} />
                            <span className={isCompleted ? 'line-through text-gray-500' : ''}>{sub}</span>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-xs text-gray-500 italic">No subtasks found. Ask Navigator Coach to decompose this task!</p>
                    )}
                  </div>
                </div>

                {/* Breather sync animation */}
                <div className="mt-4 bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 animate-spin [animation-duration:8s]">
                    <Wind size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">Circadian Breather</p>
                    <p className="text-xs text-gray-400 truncate">Sync breath: inhale as circle expands, exhale as it contracts.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Task closure controls */}
            <div className="border-t border-white/10 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-mono uppercase font-bold">Logged Workhours:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={actualHoursSpent}
                    onChange={e => setActualHoursSpent(parseFloat(e.target.value) || 1)}
                    className="w-14 bg-black/40 border border-white/10 rounded-lg p-1.5 text-center text-xs font-semibold text-white font-mono focus:outline-none"
                  />
                  <span className="text-xs text-gray-400 font-mono">Hours</span>
                </div>
              </div>

              <button
                onClick={handleCompleteTask}
                className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:scale-[1.01] cursor-pointer"
              >
                <CheckCircle2 size={14} className="stroke-[3]" />
                <span>Close Task out of OS</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 space-y-3">
            <CheckCircle2 size={32} className="text-emerald-500 animate-pulse" />
            <h4 className="font-display font-semibold text-base text-white">OS BACKLOG VOID</h4>
            <p className="text-xs max-w-[280px]">All registered tasks have been processed! Add tasks or ask the Navigator Coach for new ideas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
