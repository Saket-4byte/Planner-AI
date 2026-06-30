import React from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from 'recharts';
import { 
  ShieldAlert, 
  Zap, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Activity, 
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { Task, CapacityStats, TaskCategory, Priority } from '../types';
import { ENERGY_HOURLY_DATA } from '../data/initialData';

interface DashboardProps {
  tasks: Task[];
  stats: CapacityStats;
  onAddTask: (task: { title: string; duration: number; priority: Priority; category: TaskCategory; subtasks: string[] }) => void;
  onDeleteTask: (id: string) => void;
  onToggleTaskStatus: (id: string) => void;
}

export default function Dashboard({ tasks, stats, onAddTask, onDeleteTask, onToggleTaskStatus }: DashboardProps) {
  // Local task creation states
  const [newTitle, setNewTitle] = React.useState('');
  const [newDuration, setNewDuration] = React.useState(2);
  const [newPriority, setNewPriority] = React.useState<Priority>('medium');
  const [newCategory, setNewCategory] = React.useState<TaskCategory>('Code');

  // Compute dynamic category distribution for the Radar Chart
  const categoryHours = React.useMemo(() => {
    const map: Record<TaskCategory, number> = {
      'Code': 0,
      'Research': 0,
      'Writing': 0,
      'Exam Prep': 0,
      'Design': 0
    };
    
    tasks.forEach(t => {
      if (t.status !== 'completed' && t.status !== 'postponed') {
        map[t.category] += t.duration;
      }
    });

    return Object.entries(map).map(([subject, hours]) => ({
      subject,
      hours: parseFloat(hours.toFixed(1)),
      fullMark: 10
    }));
  }, [tasks]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle,
      duration: newDuration,
      priority: newPriority,
      category: newCategory,
      subtasks: [
        'Analyze system scope requirements',
        'Deconstruct implementation details',
        'Execute validation and testing parameters'
      ]
    });

    setNewTitle('');
    setNewDuration(2);
    setNewPriority('medium');
    setNewCategory('Code');
  };

  const successProbability = React.useMemo(() => {
    if (stats.remainingHours === 0) return 100;
    const ratio = stats.focusBudget / stats.remainingHours;
    if (ratio >= 1.5) return 99;
    if (ratio >= 1.0) {
      return Math.round(75 + (ratio - 1.0) * 48);
    }
    if (ratio >= 0.5) {
      return Math.round(15 + (ratio - 0.5) * 120);
    }
    return Math.max(2, Math.round(ratio * 30));
  }, [stats.focusBudget, stats.remainingHours]);

  return (
    <div className="space-y-6 p-1">
      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Big Stat: Stress Meter */}
        <div className="lg:col-span-2 bg-[#111] rounded-3xl border border-[#222] p-6 md:p-8 flex flex-col justify-between min-h-[340px] relative overflow-hidden">
          <div>
            <h2 className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-[#555] mb-2 font-mono">Workload Stress Meter</h2>
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mt-2">
              <span className="text-[90px] sm:text-[120px] leading-none font-black italic tracking-tighter text-white">
                {stats.stressLevel}
                <span className="text-3xl font-normal not-italic text-[#444]">%</span>
              </span>
              <div className="mb-4 sm:mb-6">
                <p className={`text-xs font-bold uppercase ${
                  stats.stressLevel < 40 ? 'text-emerald-400' : stats.stressLevel < 75 ? 'text-[#00F0FF]' : 'text-[#FF4545]'
                }`}>
                  {stats.stressLevel < 40 ? 'Nominal State' : stats.stressLevel < 75 ? 'Elevated State' : 'Critical Threat State'}
                </p>
                <p className="text-[10px] text-[#666] w-full sm:w-56 mt-1 leading-normal">
                  {stats.stressLevel < 40 
                    ? 'Stress is well below threshold limits. Safe focus indicators detected in your active sprint.' 
                    : stats.stressLevel < 75 
                    ? 'Workload parameters are elevated. Saver AI recommends postponing secondary tasks to restore full baseline flow.' 
                    : 'System overrun breach! Extreme attention bottleneck identified. Activate PANIC suppression mode.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Energy Flux Tracker */}
          <div className="h-32 bg-[#0A0A0A] rounded-2xl border border-[#1A1A1A] relative overflow-hidden flex items-center px-6 mt-4">
             {/* Energy Level Chart Pattern Overlay */}
             <div className="absolute inset-0 flex items-end opacity-20 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-t from-[#00F0FF] to-transparent" style={{ clipPath: 'polygon(0 80%, 15% 70%, 30% 90%, 45% 40%, 60% 60%, 75% 20%, 90% 50%, 100% 30%, 100% 100%, 0 100%)' }}></div>
             </div>
             <div className="relative z-10 w-full flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-[#666] uppercase font-mono">Hourly Energy Flux</p>
                  <p className="text-xl font-bold text-white">92.4 <span className="text-xs text-[#00FF66] font-mono">↑ High Peak</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#666] uppercase font-mono">Outcome Forecast</p>
                  <p className="text-xl font-bold text-white">98.2% <span className="text-xs text-[#888] font-mono">Confidence</span></p>
                </div>
             </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#111] rounded-3xl border border-[#222] p-6 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-4 font-mono">Capacity Budget</h3>
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold font-mono">
                    <span className="text-gray-400">FOCUS HOURS USED</span>
                    <span className="text-white">{stats.remainingHours} / {stats.focusBudget}</span>
                  </div>
                  <div className="h-2 w-full bg-[#1A1A1A] rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-[#00F0FF] rounded-full shadow-[0_0_10px_#00F0FF80] transition-all duration-500"
                      style={{ width: `${Math.min(100, (stats.remainingHours / stats.focusBudget) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold font-mono">
                    <span className="text-gray-400">COGNITIVE LOAD</span>
                    <span className="text-white">
                      {stats.stressLevel < 40 ? 'LOW' : stats.stressLevel < 75 ? 'MEDIUM' : 'CRITICAL'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#1A1A1A] rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,69,69,0.5)] ${
                        stats.stressLevel < 40 ? 'bg-emerald-500' : stats.stressLevel < 75 ? 'bg-amber-400' : 'bg-[#FF4545]'
                      }`}
                      style={{ width: `${stats.stressLevel}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Backlog Priorities List */}
            <div className="mt-6 border-t border-[#222] pt-4">
               <p className="text-[10px] font-bold uppercase text-[#444] mb-2.5 font-mono">Backlog Priority Target</p>
               <div className="space-y-2">
                  {tasks.filter(t => t.status !== 'completed').slice(0, 2).map((t, index) => (
                    <div key={t.id} className="bg-[#1A1A1A] p-2.5 rounded-xl flex items-center justify-between border border-[#222] hover:border-gray-700 transition-colors">
                      <span className="text-[11px] font-semibold text-gray-200 truncate pr-2 max-w-[130px]">{t.title}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                        t.priority === 'high' 
                          ? 'bg-[#FF454520] text-[#FF4545]' 
                          : t.priority === 'medium' 
                          ? 'bg-amber-500/20 text-amber-400' 
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        P{index + 1}
                      </span>
                    </div>
                  ))}
                  {tasks.filter(t => t.status !== 'completed').length === 0 && (
                     <p className="text-[10px] text-gray-600 font-mono italic">Backlog queue is fully resolved.</p>
                  )}
               </div>
            </div>
          </div>

          {/* Outcome Simulator success projection card */}
          <div className="bg-[#00F0FF] text-[#050505] rounded-3xl p-5 h-32 flex flex-col justify-center items-center text-center shadow-[0_0_20px_rgba(0,240,255,0.25)] relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20"></div>
            <p className="text-[10px] font-black uppercase tracking-widest font-mono text-black/60">Outcome Simulator</p>
            <h4 className="text-lg font-black italic leading-none text-black tracking-tight uppercase">SUCCESS LIKELIHOOD</h4>
            <p className="text-4xl font-black mt-1 text-black tracking-tighter">{successProbability}%</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Workload Radar Chart */}
        <div className="glassmorphism p-5 rounded-2xl flex flex-col justify-between min-h-[360px]">
          <div>
            <h3 className="font-display font-bold text-lg text-white">Workload Radar Distribution</h3>
            <p className="text-xs text-gray-400 mt-1">Real-time allocation of pending hours across strategic vectors.</p>
          </div>
          <div className="flex-1 min-h-[260px] flex items-center justify-center mt-2">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryHours}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.05)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 10]} 
                  stroke="rgba(255, 255, 255, 0.1)" 
                  tick={{ fill: '#4b5563', fontSize: 10 }}
                />
                <Radar 
                  name="Backlog Hours" 
                  dataKey="hours" 
                  stroke="#00F0FF" 
                  fill="#00F0FF" 
                  fillOpacity={0.15} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy Projections & Focus Area Chart */}
        <div className="glassmorphism p-5 rounded-2xl flex flex-col justify-between min-h-[360px]">
          <div>
            <h3 className="font-display font-bold text-lg text-white">Circadian Cognitive Energy Logs</h3>
            <p className="text-xs text-gray-400 mt-1">Projected energy peaks vs focus capability mapping across diurnal shifts.</p>
          </div>
          <div className="flex-1 min-h-[260px] mt-2">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={ENERGY_HOURLY_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#4b5563" fontSize={10} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#9ca3af', fontSize: '11px', fontFamily: 'monospace' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                <Area type="monotone" dataKey="level" name="Energy Reserves" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#colorEnergy)" />
                <Area type="monotone" dataKey="focus" name="Cognitive Capacity" stroke="#FFFFFF" strokeWidth={1.5} fillOpacity={1} fill="url(#colorFocus)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Task Creation & List Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Task Builder */}
        <div className="glassmorphism p-5 rounded-2xl h-fit">
          <h3 className="font-display font-bold text-base text-white">Manual Core Registry</h3>
          <p className="text-xs text-gray-400 mt-1">Append structured task profiles manually to index into timeline calculations.</p>
          
          <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
            <div>
              <label className="text-[10px] uppercase font-mono tracking-widest text-gray-400">Task Title</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Optimize SQL indexing" 
                className="w-full mt-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] focus:outline-none rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 transition-all font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-mono tracking-widest text-gray-400">Duration (h)</label>
                <input 
                  type="number" 
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={newDuration}
                  onChange={e => setNewDuration(parseFloat(e.target.value) || 1)}
                  className="w-full mt-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] focus:outline-none rounded-xl px-3 py-2 text-xs text-white transition-all font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-mono tracking-widest text-gray-400">Priority</label>
                <select 
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as Priority)}
                  className="w-full mt-1 bg-[#0A0A0A] border border-white/10 focus:border-[#00F0FF] focus:outline-none rounded-xl px-2 py-2 text-xs text-white transition-all"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono tracking-widest text-gray-400">Work Category</label>
              <select 
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as TaskCategory)}
                className="w-full mt-1 bg-[#0A0A0A] border border-white/10 focus:border-[#00F0FF] focus:outline-none rounded-xl px-2 py-2 text-xs text-white transition-all"
              >
                <option value="Code">Code</option>
                <option value="Research">Research</option>
                <option value="Writing">Writing</option>
                <option value="Exam Prep">Exam Prep</option>
                <option value="Design">Design</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={!newTitle.trim()}
              className="w-full py-3.5 rounded-xl bg-[#00F0FF] hover:bg-[#00F0FF]/90 disabled:opacity-30 text-xs font-black text-black tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.35)] hover:scale-[1.01]"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>Index Task</span>
            </button>
          </form>
        </div>

        {/* Task Backlog Status Grid */}
        <div className="glassmorphism p-5 rounded-2xl lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-white">System Backlog Queue</h3>
            <p className="text-xs text-gray-400 mt-1">Active backlog catalog tracked inside Saver.AI's scheduling calculations.</p>
          </div>

          <div className="flex-1 mt-4 overflow-y-auto max-h-[290px] space-y-2.5 pr-1">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 text-gray-500 space-y-2">
                <AlertCircle size={24} />
                <p className="text-xs font-mono">BACKLOG COMPILING VOID: 0 RECORDS ACTIVE</p>
              </div>
            ) : (
              tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    task.status === 'completed'
                      ? 'bg-emerald-500/5 border-emerald-500/15 text-gray-400'
                      : task.status === 'postponed'
                      ? 'bg-amber-500/5 border-amber-500/10 text-gray-400 opacity-60'
                      : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                    <input 
                      type="checkbox" 
                      checked={task.status === 'completed'}
                      onChange={() => onToggleTaskStatus(task.id)}
                      className="w-4 h-4 rounded border-gray-600 text-[#00F0FF] checked:bg-[#00F0FF] focus:ring-[#00F0FF] bg-black/40 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-display font-semibold text-xs truncate ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                          {task.title}
                        </p>
                        <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] uppercase font-semibold shrink-0 ${
                          task.priority === 'high' 
                            ? 'bg-[#FF454520] text-[#FF4545]' 
                            : task.priority === 'medium'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-mono">
                        <span className="bg-white/5 px-1.5 py-0.2 rounded text-gray-400">{task.category}</span>
                        <span>•</span>
                        <span>Estimated: {task.duration}h</span>
                        {task.status === 'postponed' && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 uppercase font-semibold">Postponed</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-[#FF4545] hover:bg-[#FF454510] transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
