import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Sliders, HelpCircle, Shield, AlertTriangle, Play, Sparkles } from 'lucide-react';
import { Task } from '../types';

interface OutcomeSimulatorProps {
  tasks: Task[];
  focusBudget: number;
  onSetFocusBudget: (hours: number) => void;
  onAddBlackBoxLog: (action: string, reason: string, status: 'info' | 'success' | 'warning' | 'panic' | 'rescue') => void;
}

export default function OutcomeSimulator({ tasks, focusBudget, onSetFocusBudget, onAddBlackBoxLog }: OutcomeSimulatorProps) {
  const [complexityMultiplier, setComplexityMultiplier] = useState(1.0);
  const [simulationCycles, setSimulationCycles] = useState(5);

  const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'postponed');
  
  // Calculate raw workload hours
  const rawWorkload = useMemo(() => {
    return pendingTasks.reduce((acc, t) => acc + t.duration, 0);
  }, [pendingTasks]);

  // Adjusted workload based on complexity multiplier
  const adjustedWorkload = useMemo(() => {
    return parseFloat((rawWorkload * complexityMultiplier).toFixed(1));
  }, [rawWorkload, complexityMultiplier]);

  // Live statistical calculation of Success Probability
  const successProbability = useMemo(() => {
    if (adjustedWorkload === 0) return 100;
    
    // Simple heuristic CDF-like calculation
    const ratio = focusBudget / adjustedWorkload;
    if (ratio >= 1.5) return 99;
    if (ratio >= 1.0) {
      // Linear scaling between 1.0 and 1.5 (from 75% to 99%)
      return Math.round(75 + (ratio - 1.0) * 48);
    }
    // Linear scaling between 0.5 and 1.0 (from 15% to 75%)
    if (ratio >= 0.5) {
      return Math.round(15 + (ratio - 0.5) * 120);
    }
    return Math.max(2, Math.round(ratio * 30));
  }, [focusBudget, adjustedWorkload]);

  // Stress projection index
  const projectedStress = useMemo(() => {
    if (adjustedWorkload === 0) return 0;
    const ratio = adjustedWorkload / focusBudget;
    return Math.min(100, Math.round(ratio * 50 + 20));
  }, [adjustedWorkload, focusBudget]);

  // Generate simulated timeline trial data paths for Recharts
  const simulatedTrials = useMemo(() => {
    const trials = [];
    // Generate consecutive daily paths representing a week of schedule execution under disturbances
    for (let day = 1; day <= 7; day++) {
      // Simulate random fluctuations in focus efficiency (-20% to +30%)
      const noise = 1 + (Math.sin(day * 2) * 0.15 + (Math.cos(day * 5) * 0.1));
      const dailySimulatedConsumption = parseFloat((adjustedWorkload * (day / 7) * noise).toFixed(1));
      const dailySimulatedCapacity = parseFloat((focusBudget * (day / 7)).toFixed(1));

      trials.push({
        day: `Day ${day}`,
        simulatedWorkload: dailySimulatedConsumption,
        availableCapacity: dailySimulatedCapacity
      });
    }
    return trials;
  }, [adjustedWorkload, focusBudget]);

  const handleSimulate = () => {
    onAddBlackBoxLog(
      'TIMELINE_SIMULATION_RUN',
      `Triggered timeline simulation: focus limit ${focusBudget}h, complexity multiplier ${complexityMultiplier}x. projected success rating: ${successProbability}%.`,
      successProbability < 40 ? 'warning' : 'success'
    );
  };

  return (
    <div className="space-y-6 p-1">
      {/* Title */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-display font-black text-xl text-white italic tracking-tight">Quantum Time Outcome Simulator</h3>
          <p className="text-xs text-gray-400">Modulate schedule conditions and parameters to isolate failure points before they manifest.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/20 text-[9px] text-[#00F0FF] font-mono font-bold tracking-wider">
          <Sparkles size={11} className="animate-pulse" />
          <span>REAL-TIME PREDICTION ENGINE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Container Card */}
        <div className="bg-[#111] border border-[#222] p-6 rounded-3xl flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <h4 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders size={16} className="text-[#00F0FF]" />
              <span>Scheduler Modulators</span>
            </h4>

            {/* Slider 1: Focus Budget */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400 font-semibold">Attention Limit Budget</span>
                <span className="text-[#00F0FF] font-black">{focusBudget}h / Day</span>
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
              <p className="text-[10px] text-gray-500 italic">Total allocation of high-focus capacity available for sprints daily.</p>
            </div>

            {/* Slider 2: Complexity Multiplier */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400 font-semibold">Task Fatigue Multiplier</span>
                <span className="text-[#FFB800] font-black">{complexityMultiplier}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={complexityMultiplier}
                onChange={e => setComplexityMultiplier(parseFloat(e.target.value))}
                className="w-full accent-[#FFB800] bg-white/5 rounded-lg h-2 cursor-pointer"
              />
              <p className="text-[10px] text-gray-500 italic">Simulate friction: fatigue, scope creep, or unexpected bugs.</p>
            </div>
          </div>

          <button
            onClick={handleSimulate}
            className="w-full py-3.5 rounded-xl bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.35)] hover:scale-[1.01] cursor-pointer"
          >
            <Play size={12} className="fill-current stroke-[3]" />
            <span>Launch Timeline Trial</span>
          </button>
        </div>

        {/* Statistical Outputs */}
        <div className="bg-[#111] border border-[#222] p-6 rounded-3xl lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Success probability indicator */}
          <div className="flex flex-col justify-between">
            <div>
              <h5 className="text-[10px] uppercase font-mono tracking-widest text-[#555] font-bold">Estimated Timeline Success</h5>
              <div className="mt-4 flex items-baseline gap-2">
                <span className={`text-6xl md:text-7xl font-display font-black italic tracking-tighter ${
                  successProbability >= 75 ? 'text-[#00FF66]' : successProbability >= 45 ? 'text-[#FFB800]' : 'text-[#FF4545]'
                }`}>
                  {successProbability}%
                </span>
                <span className="text-xs text-gray-500 font-mono font-bold uppercase">prob</span>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-[#0A0A0A] border border-[#1A1A1A] flex items-start gap-3">
              {successProbability >= 75 ? (
                <Shield size={18} className="text-[#00FF66] shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={18} className="text-[#FF4545] shrink-0 mt-0.5 animate-pulse" />
              )}
              <div className="text-xs">
                <p className="font-bold text-gray-200 uppercase font-mono tracking-wider text-[11px]">
                  {successProbability >= 75 ? 'Nominal Timeline Confirmed' : 'Friction Breach Risk Elevated'}
                </p>
                <p className="text-gray-400 mt-1.5 leading-relaxed">
                  {successProbability >= 75 
                    ? 'Workload parameters are safe within capacity budgets. Ensure Pomodoro pacing is maintained.' 
                    : 'The fatigue modifier creates overload thresholds. Lower complexity or launch Panic Button mode immediately.'}
                </p>
              </div>
            </div>
          </div>

          {/* Metric breakdowns */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl">
                <p className="text-[9px] text-gray-500 font-mono uppercase font-bold tracking-wider">Workload hours</p>
                <p className="text-2xl font-display font-black text-white mt-1">{adjustedWorkload}h</p>
                <p className="text-[9px] text-[#00F0FF] font-mono mt-0.5">Adjusted pending</p>
              </div>

              <div className="p-3.5 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl">
                <p className="text-[9px] text-gray-500 font-mono uppercase font-bold tracking-wider">Projected Stress</p>
                <p className={`text-2xl font-display font-black mt-1 ${
                  projectedStress < 40 ? 'text-[#00FF66]' : projectedStress < 75 ? 'text-[#FFB800]' : 'text-[#FF4545]'
                }`}>{projectedStress}%</p>
                <p className="text-[9px] text-gray-400 font-mono mt-0.5">{complexityMultiplier}x Fatigue</p>
              </div>
            </div>

            <div className="p-4 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl space-y-2">
              <p className="text-[9px] text-gray-500 font-mono uppercase font-bold tracking-wider">OS Timeline Evaluation</p>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  successProbability >= 75 ? 'bg-[#00FF66]' : successProbability >= 45 ? 'bg-[#FFB800]' : 'bg-[#FF4545]'
                }`}></div>
                <p className="text-xs font-black text-white uppercase tracking-wider font-mono">
                  {successProbability >= 75 ? 'OPTIMAL PROTOCOL' : successProbability >= 45 ? 'CONGESTED TIMELINE' : 'SYSTEM BREACH TIMELINE'}
                </p>
              </div>
              <p className="text-[11px] text-gray-400 leading-normal">
                Backlog total: {pendingTasks.length} tasks. Multiplier increases nominal timeline durations by {Math.round((complexityMultiplier - 1.0) * 100)}%.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trial visualizer Area Chart */}
      <div className="glassmorphism p-5 rounded-3xl flex flex-col justify-between min-h-[300px]">
        <div>
          <h4 className="font-display font-black text-sm text-white uppercase tracking-wider">Trial Simulation: Cumulative Backlog Burnout Path</h4>
          <p className="text-xs text-gray-400 mt-1">Stochastic projections showing the timeline intersection of attention limit budget vs simulated workload exhaustion over a 7-day cycle.</p>
        </div>

        <div className="flex-1 min-h-[220px] mt-4">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={simulatedTrials} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="simWorkload" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4545" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#FF4545" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="simCapacity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#4b5563" fontSize={10} tickLine={false} />
              <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}
                labelStyle={{ color: '#9ca3af', fontSize: '11px', fontFamily: 'monospace' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="simulatedWorkload" name="Simulated Exhaustion Path" stroke="#FF4545" strokeWidth={1.5} fillOpacity={1} fill="url(#simWorkload)" />
              <Area type="monotone" dataKey="availableCapacity" name="Attention Budget Ceiling" stroke="#00F0FF" strokeWidth={1.5} fillOpacity={1} fill="url(#simCapacity)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
