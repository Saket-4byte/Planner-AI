import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Zap, 
  Sliders, 
  Terminal, 
  Settings as SettingsIcon, 
  AlertTriangle, 
  RefreshCw, 
  ShieldAlert, 
  Clock, 
  Sparkles,
  Bot,
  X
} from 'lucide-react';

import { Task, BlackBoxLog, LearningLog, CapacityStats, Priority, TaskCategory } from './types';
import { INITIAL_TASKS, INITIAL_BLACK_BOX_LOGS, INITIAL_LEARNING_LOGS } from './data/initialData';

// Subcomponents
import Dashboard from './components/Dashboard';
import FocusHub from './components/FocusHub';
import OutcomeSimulator from './components/OutcomeSimulator';
import DeveloperHUD from './components/DeveloperHUD';
import Settings from './components/Settings';
import PanicOverlay from './components/PanicOverlay';
import RescueOverlay from './components/RescueOverlay';
import NavigatorCoach from './components/NavigatorCoach';

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'focus' | 'simulator' | 'hud' | 'settings'>('dashboard');

  // Core States
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [blackBoxLogs, setBlackBoxLogs] = useState<BlackBoxLog[]>(INITIAL_BLACK_BOX_LOGS);
  const [learningLogs, setLearningLogs] = useState<LearningLog[]>(INITIAL_LEARNING_LOGS);
  const [focusBudget, setFocusBudget] = useState(8.0); // Daily Focus Hours budget

  // Overlays / Protocols
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [isRescueActive, setIsRescueActive] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(true);

  // UTC Live Clock
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute stats on workload capacity and stress dynamically
  const stats = useMemo<CapacityStats>(() => {
    const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'postponed');
    const remainingHours = pendingTasks.reduce((acc, t) => acc + t.duration, 0);
    
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const completedHours = completedTasks.reduce((acc, t) => acc + (t.actualDuration || t.duration), 0);

    // Stress calculation index based on pending workload vs budget hours
    let stressLevel = 0;
    if (remainingHours > 0) {
      const ratio = remainingHours / focusBudget;
      stressLevel = Math.min(100, Math.round(ratio * 50 + 20)); // Base scaling
    }

    return {
      focusBudget,
      remainingHours: parseFloat(remainingHours.toFixed(1)),
      completedHours: parseFloat(completedHours.toFixed(1)),
      stressLevel
    };
  }, [tasks, focusBudget]);

  // Log handler
  const handleAddBlackBoxLog = (action: string, reason: string, status: 'info' | 'success' | 'warning' | 'panic' | 'rescue') => {
    const newLog: BlackBoxLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      reason,
      status
    };
    setBlackBoxLogs(prev => [newLog, ...prev]);
  };

  // Add Task manually or from AI Coach
  const handleAddTask = (newTaskData: { title: string; duration: number; priority: Priority; category: string; subtasks: string[] }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskData.title,
      duration: newTaskData.duration,
      priority: newTaskData.priority,
      category: newTaskData.category as TaskCategory,
      status: 'backlog',
      subtasks: newTaskData.subtasks,
      completedSubtasks: [],
      deadline: 'Tomorrow'
    };

    setTasks(prev => [newTask, ...prev]);
    handleAddBlackBoxLog('TASK_INDEXED', `Task "${newTaskData.title}" registered in scheduling queue.`, 'info');
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;
    
    setTasks(prev => prev.filter(t => t.id !== id));
    handleAddBlackBoxLog('TASK_PRUNED', `Task "${taskToDelete.title}" deleted from backlog index.`, 'warning');
  };

  // Toggle Subtask Completion in Focus mode
  const handleToggleSubtask = (taskId: string, subtask: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const completed = t.completedSubtasks || [];
        const updatedCompleted = completed.includes(subtask)
          ? completed.filter(s => s !== subtask)
          : [...completed, subtask];
        return {
          ...t,
          completedSubtasks: updatedCompleted
        };
      }
      return t;
    }));
    handleAddBlackBoxLog('SUBTASK_STATUS_CHANGED', `Subtask completion status toggled on task id ${taskId}.`, 'info');
  };

  // Set general Task status (In Progress, Completed, etc.)
  const handleSetTaskStatus = (taskId: string, status: 'in_progress' | 'completed' | 'backlog') => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: status
        };
      }
      return t;
    }));
  };

  // Toggle Task Checklist Completed checkbox on Dashboard
  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const isCurrentlyCompleted = t.status === 'completed';
        const updatedStatus = isCurrentlyCompleted ? 'backlog' : 'completed';
        
        if (updatedStatus === 'completed') {
          // Log standard performance entry
          const actual = t.duration; // Default actual equals estimated if completed on dashboard
          handleLogCompletedTask(t.title, t.duration, actual);
        }

        return {
          ...t,
          status: updatedStatus,
          completedSubtasks: updatedStatus === 'completed' ? t.subtasks : []
        };
      }
      return t;
    }));
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const changedTo = task.status === 'completed' ? 'pending' : 'completed';
      handleAddBlackBoxLog('TASK_QUEUE_SHIFT', `Task "${task.title}" status shifted to ${changedTo}.`, 'info');
    }
  };

  // Log completed task to learning ledger
  const handleLogCompletedTask = (taskTitle: string, predicted: number, actual: number) => {
    const errorPercentage = parseFloat((((actual - predicted) / predicted) * 100).toFixed(1));
    const newLog: LearningLog = {
      id: `l-${Date.now()}`,
      taskTitle,
      predicted,
      actual,
      errorPercentage,
      timestamp: new Date().toISOString()
    };
    setLearningLogs(prev => [newLog, ...prev]);
  };

  // Execute AI Rescue protocol modifications
  const handleExecuteRescue = (postponedIds: string[], durationTrims: Record<string, number>) => {
    setTasks(prev => prev.map(t => {
      if (postponedIds.includes(t.id)) {
        return { ...t, status: 'postponed', postponedAt: new Date().toISOString() };
      }
      if (durationTrims[t.id] !== undefined) {
        return { ...t, duration: durationTrims[t.id] };
      }
      return t;
    }));
  };

  // Reset Core database
  const handleResetTasks = () => {
    setTasks(INITIAL_TASKS);
    setLearningLogs(INITIAL_LEARNING_LOGS);
    setBlackBoxLogs(INITIAL_BLACK_BOX_LOGS);
  };

  const handleClearLogs = () => {
    setBlackBoxLogs([]);
    setLearningLogs([]);
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-100 font-sans flex relative overflow-hidden flex-col md:flex-row">
      
      {/* Visual background Grid effects */}
      <div className="absolute inset-0 cyber-grid z-0 pointer-events-none"></div>
      <div className="absolute inset-0 scanline z-0 pointer-events-none opacity-20"></div>

      {/* LEFT NAVIGATION COLUMN */}
      <aside className="w-full md:w-[250px] bg-black/60 border-r border-white/5 flex flex-col justify-between shrink-0 z-10 p-4">
        <div className="space-y-6">
          {/* Logo Brand - Clickable to toggle Navigator Coach */}
          <button 
            onClick={() => {
              setIsCoachOpen(prev => !prev);
              handleAddBlackBoxLog('COACH_TOGGLED', `User ${!isCoachOpen ? 'activated' : 'deactivated'} Navigator Coach view from Brand Logo interaction.`, 'info');
            }}
            className="flex items-center gap-3 px-1 mt-2 text-left group w-full cursor-pointer hover:opacity-90 transition-all focus:outline-none"
            title="Toggle Navigator Coach AI"
          >
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00F0FF] to-[#7000FF] flex items-center justify-center glow-purple shrink-0 relative overflow-hidden transition-all duration-300 ${isCoachOpen ? 'scale-105 shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'group-hover:scale-105 group-hover:shadow-[0_0_10px_rgba(112,0,255,0.35)]'}`}>
              <div className="absolute inset-[1.5px] bg-black rounded-[14px]"></div>
              <span className="text-lg font-black italic text-white z-10 font-display">S</span>
              {/* Pulsing indicator when coach is open */}
              {isCoachOpen && (
                <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#00F0FF] border border-black z-20 animate-pulse"></span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono bg-white/10 px-1.5 py-0.1 rounded text-[#00F0FF] font-bold">v2.4.0</span>
                <span className={`text-[8px] font-mono px-1 py-0.1 rounded font-bold uppercase transition-all duration-300 ${isCoachOpen ? 'bg-[#00FF66]/10 text-[#00FF66]' : 'bg-white/5 text-gray-400'}`}>
                  {isCoachOpen ? 'Coach ON' : 'Coach OFF'}
                </span>
              </div>
              <h1 className="text-xl font-black italic tracking-tighter text-white font-display group-hover:text-white transition-colors">
                SAVER<span className="text-[#00F0FF]">.AI</span>
              </h1>
            </div>
          </button>

          {/* Clock & Status */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 text-center space-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#00F0FF] to-[#7000FF]"></div>
            <p className="text-[9px] text-gray-500 font-mono tracking-[0.2em] font-bold uppercase">OS System Time</p>
            <h2 className="text-2xl font-mono font-black text-white tracking-widest">{currentTime || '00:00:00'}</h2>
            <div className="flex items-center justify-center gap-1.5 pt-1.5 text-[9px] text-emerald-400 font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>NOMINAL_ACTIVE_RUN</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'focus', label: 'Focus Hub', icon: Zap },
              { id: 'simulator', label: 'Time Simulator', icon: Sliders },
              { id: 'hud', label: 'Developer HUD', icon: Terminal },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 py-3 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white/5 text-[#00F0FF] font-black border-l-[3px] border-l-[#00F0FF] pl-[11px] rounded-r-xl font-display'
                      : 'text-[#666] hover:text-white hover:bg-white/5 border-l-[3px] border-l-transparent pl-[11px] font-sans font-semibold'
                  }`}
                >
                  <Icon size={14} className={activeTab === tab.id ? 'text-[#00F0FF]' : 'text-[#444] group-hover:text-gray-200'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Emergency striking controls */}
        <div className="space-y-2 mt-6">
          <button
            onClick={() => {
              setIsPanicActive(true);
              handleAddBlackBoxLog('PANIC_PROTOCOL_DEPLOYED', 'User triggered Manual Panic override checklist suppression.', 'panic');
            }}
            className="w-full py-3 rounded-xl bg-[#FF4545]/10 text-[#FF4545] border border-[#FF4545]/20 text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#FF4545]/15 hover:scale-[1.01]"
          >
            <AlertTriangle size={13} className="animate-pulse" />
            <span>Engage Panic Mode</span>
          </button>

          <button
            onClick={() => {
              setIsRescueActive(true);
              handleAddBlackBoxLog('RESCUE_SEQUENCE_DEPLOYED', 'User triggered Emergency AI Timeline Rescue protocol compiling.', 'warning');
            }}
            className="w-full py-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-amber-500/15 hover:scale-[1.01]"
          >
            <RefreshCw size={12} className="animate-spin [animation-duration:8s]" />
            <span>Timeline Rescue</span>
          </button>
        </div>
      </aside>

      {/* CENTRAL ACTIVE VIEW PANEL */}
      <main className="flex-1 min-w-0 flex flex-col z-10 p-4 md:p-6 overflow-y-auto h-screen scrollbar-none">
        
        {/* Dynamic Nav Header Bar */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 px-2.5 py-0.5 rounded uppercase font-bold tracking-wider">
              NODE_01
            </span>
            <p className="text-xs text-gray-400 font-mono">System Integrity Index: <span className="text-[#00FF66] font-semibold">100% SECURE</span></p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#111] border border-white/5 rounded-xl">
              <Sparkles size={11} className="text-[#00F0FF]" />
              <span className="text-[10px] font-mono text-gray-300">STRESS_FACTOR: <span className="text-white font-bold">{stats.stressLevel}%</span></span>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/10 bg-[#00F0FF] text-black flex items-center justify-center text-[10px] font-mono font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]">
              OP
            </div>
          </div>
        </header>

        {/* View render transitions */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  tasks={tasks} 
                  stats={stats} 
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                  onToggleTaskStatus={handleToggleTaskStatus}
                />
              )}
              {activeTab === 'focus' && (
                <FocusHub 
                  tasks={tasks}
                  onToggleSubtask={handleToggleSubtask}
                  onSetTaskStatus={handleSetTaskStatus}
                  onAddBlackBoxLog={handleAddBlackBoxLog}
                  onLogCompletedTask={handleLogCompletedTask}
                />
              )}
              {activeTab === 'simulator' && (
                <OutcomeSimulator 
                  tasks={tasks}
                  focusBudget={focusBudget}
                  onSetFocusBudget={setFocusBudget}
                  onAddBlackBoxLog={handleAddBlackBoxLog}
                />
              )}
              {activeTab === 'hud' && (
                <DeveloperHUD 
                  blackBoxLogs={blackBoxLogs}
                  learningLogs={learningLogs}
                  onClearLogs={handleClearLogs}
                  onAddBlackBoxLog={handleAddBlackBoxLog}
                />
              )}
              {activeTab === 'settings' && (
                <Settings 
                  focusBudget={focusBudget}
                  onSetFocusBudget={setFocusBudget}
                  onResetTasks={handleResetTasks}
                  onClearLogs={handleClearLogs}
                  onTriggerPanic={() => {
                    setIsPanicActive(true);
                    handleAddBlackBoxLog('PANIC_PROTOCOL_DEPLOYED', 'User triggered Manual Panic override checklist suppression.', 'panic');
                  }}
                  onTriggerRescue={() => {
                    setIsRescueActive(true);
                    handleAddBlackBoxLog('RESCUE_SEQUENCE_DEPLOYED', 'User triggered Emergency AI Timeline Rescue protocol compiling.', 'warning');
                  }}
                  onAddBlackBoxLog={handleAddBlackBoxLog}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* RIGHT CHATBOT SIDEBAR - TOGGLEABLE NAVIGATOR COACH */}
      <AnimatePresence>
        {isCoachOpen && (
          <motion.section 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full md:w-[320px] h-screen shrink-0 z-10 bg-black/40 overflow-hidden flex flex-col border-l border-white/5"
          >
            <div className="w-[320px] h-full flex flex-col">
              <NavigatorCoach 
                tasks={tasks}
                onAddTask={handleAddTask}
                onAddBlackBoxLog={handleAddBlackBoxLog}
                onClose={() => setIsCoachOpen(false)}
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* FLOATING LOGO BUTTON TO OPEN COACH - Visible when coach is closed */}
      <AnimatePresence>
        {!isCoachOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => {
              setIsCoachOpen(true);
              handleAddBlackBoxLog('COACH_TOGGLED', 'User activated Navigator Coach view from floating AI Logo.', 'info');
            }}
            className="fixed bottom-6 right-6 z-40 bg-black/90 hover:bg-black text-white p-3.5 rounded-2xl border border-[#00F0FF]/30 hover:border-[#00F0FF]/60 flex items-center gap-2.5 shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_25px_rgba(0,240,255,0.45)] cursor-pointer transition-all duration-300 group hover:scale-[1.05]"
            title="Open Navigator Coach AI"
          >
            <div className="relative">
              <div className="p-1.5 rounded-xl bg-gradient-to-tr from-[#00F0FF] to-[#7000FF] text-white">
                <Bot size={18} className="animate-bounce [animation-duration:3s]" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00FF66] rounded-full border-2 border-black animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00FF66] rounded-full border-2 border-black"></span>
            </div>
            <div className="text-left font-mono pr-1">
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">NAVIGATOR CORE</p>
              <p className="text-xs font-black text-white flex items-center gap-1 group-hover:text-[#00F0FF] transition-colors">
                ASK COACH AI <Sparkles size={11} className="text-[#00F0FF] animate-pulse" />
              </p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* OVERLAY & INTERACTION PROTOCOLS */}
      <PanicOverlay 
        tasks={tasks}
        isActive={isPanicActive}
        onClose={() => setIsPanicActive(false)}
        onToggleTaskStatus={handleToggleTaskStatus}
        onAddBlackBoxLog={handleAddBlackBoxLog}
      />

      <RescueOverlay 
        tasks={tasks}
        isActive={isRescueActive}
        onClose={() => setIsRescueActive(false)}
        onExecuteRescue={handleExecuteRescue}
        onAddBlackBoxLog={handleAddBlackBoxLog}
      />

    </div>
  );
}
