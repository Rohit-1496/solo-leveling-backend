"use client";

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Sword, 
  Zap, 
  Flame, 
  Calendar, 
  Lock, 
  ChevronRight,
  CheckCircle2,
  Loader2,
  Trophy,
  PlusCircle,
  X,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './globals.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PLAYER_ID = 1;

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
} as const;

const itemVariants = {
  hidden: { x: -30, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 200, damping: 20 } 
  }
} as const;

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 1.1, y: 20 }
} as const;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showDamageFlash, setShowDamageFlash] = useState(false);
  const [showHealFlash, setShowHealFlash] = useState(false);
  const [showRecoveredBanner, setShowRecoveredBanner] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuest, setNewQuest] = useState({ title: "", is_fixed: false, is_tomorrow: false });

  const [player, setPlayer] = useState({
    username: "Sung Jinwoo",
    level: 1, xp: 0, hp: 100, streak_days: 0
  });

  const [todayQuests, setTodayQuests] = useState([]);
  const [tomorrowQuests, setTomorrowQuests] = useState([]);

  // DYNAMIC STYLING BASED ON HP
  const isDanger = player.hp < 50;
  const isDead = player.hp === 0;
  const accentColor = isDanger ? "text-red-500" : "text-cyan-400";
  const glowShadow = isDanger ? "shadow-[0_0_20px_rgba(239,68,68,0.5)]" : "shadow-[0_0_20px_rgba(34,211,238,0.5)]";
  const progressBg = isDanger ? "bg-red-500" : "bg-gradient-to-r from-cyan-500 to-blue-500";
  const borderFocus = isDanger ? "border-red-500/40" : "border-cyan-500/30";

  useEffect(() => {
    async function syncSystem() {
      try {
        const response = await fetch(`${API_BASE}/api/system/status/${PLAYER_ID}`);
        if (!response.ok) throw new Error("Connection Interrupted");
        const data = await response.json();
        setPlayer(data.player);
        setTodayQuests(data.tasks.filter(t => !t.is_tomorrow));
        setTomorrowQuests(data.tasks.filter(t => t.is_tomorrow));
      } catch (err) {
        console.error("System Desync:", err);
      } finally {
        setLoading(false);
      }
    }
    syncSystem();
  }, []);

  const toggleTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${taskId}/toggle`, { method: "PUT" });
      const newPlayerState = await response.json();
      if (newPlayerState.level > player.level) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3500);
      }
      setPlayer(newPlayerState);
      setTodayQuests(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: !t.is_completed } : t));
    } catch (err) {
      console.error("Link Expired:", err);
    }
  };

  const handleAddQuest = async (e) => {
    e.preventDefault();
    if (!newQuest.title.trim()) return;
    try {
      const response = await fetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newQuest, player_id: PLAYER_ID })
      });
      const createdTask = await response.json();
      if (createdTask.is_tomorrow) {
        setTomorrowQuests(prev => [...prev, createdTask]);
      } else {
        setTodayQuests(prev => [...prev, createdTask]);
      }
      setShowAddModal(false);
      setNewQuest({ title: "", is_fixed: false, is_tomorrow: false });
    } catch (err) {
      console.error("Summoning Failed:", err);
    }
  };

  const handleCompleteDay = async () => {
    if (!confirm("Atomic Process: End your day and promote plans?")) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/system/complete_day/${PLAYER_ID}`, { method: "POST" });
      const result = await response.json();
      
      if (result.success) {
        if (result.penalty_triggered) {
          setShowDamageFlash(true);
          setTimeout(() => setShowDamageFlash(false), 2000);
        }
        setPlayer(result.player_state);
        const tStatusRes = await fetch(`${API_BASE}/api/system/status/${PLAYER_ID}`);
        const tStatusData = await tStatusRes.json();
        setTodayQuests(tStatusData.tasks.filter(t => !t.is_tomorrow));
        setTomorrowQuests(tStatusData.tasks.filter(t => t.is_tomorrow));
      }
    } catch (err) {
      console.error("System Failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleHeal = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/system/heal/${PLAYER_ID}`, { method: "POST" });
      const newPlayerState = await response.json();
      
      setShowHealFlash(true);
      setShowRecoveredBanner(true);
      setTimeout(() => setShowHealFlash(false), 1500);
      setTimeout(() => setShowRecoveredBanner(false), 4000);
      
      setPlayer(newPlayerState);
    } catch (err) {
      console.error("Healing Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-400 font-orbitron">
      <Loader2 className="animate-spin mb-4" size={48} />
      <div className="text-xl tracking-[0.3em] animate-pulse uppercase">[ Synchronizing with System... ]</div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-200 font-sans transition-colors duration-700 ${isDanger ? 'bg-red-950/20' : ''}`}>
      
      {/* 🩸 DAMAGE FLASH OVERLAY */}
      <AnimatePresence>
        {showDamageFlash && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.5, repeat: 2 }}
            className="fixed inset-0 z-[200] bg-red-600/40 pointer-events-none mix-blend-overlay" />
        )}
      </AnimatePresence>

      {/* ✨ HEALING FLASH OVERLAY */}
      <AnimatePresence>
        {showHealFlash && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[200] bg-cyan-400/30 pointer-events-none mix-blend-screen" />
        )}
      </AnimatePresence>

      {/* ⚠️ CRITICAL BANNER */}
      {isDead && (
        <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="bg-red-600 text-white font-black py-2 text-center text-xs tracking-[0.4em] font-orbitron animate-pulse z-[70] relative">
          ⚠️ SURVIVAL THREATENED: ENTER THE PENALTY ZONE ⚠️
        </motion.div>
      )}

      {/* 🩹 RECOVERY BANNER */}
      <AnimatePresence>
        {showRecoveredBanner && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-cyan-500 text-slate-950 px-8 py-3 rounded-full font-black tracking-[0.5em] font-orbitron shadow-[0_0_30px_rgba(34,211,238,0.5)]">
            [ STATUS RECOVERED ]
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUMMON QUEST MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="relative w-full max-w-md backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="mb-8">
                <h2 className={`text-2xl font-black italic uppercase tracking-tighter ${accentColor} mb-1`}>Summon Quest</h2>
                <div className={`h-0.5 w-12 ${isDanger ? 'bg-red-500' : 'bg-cyan-500'}`} />
              </div>
              <form onSubmit={handleAddQuest} className="space-y-6">
                <input autoFocus required type="text" value={newQuest.title} onChange={(e) => setNewQuest({...newQuest, title: e.target.value})} placeholder="Quest Name..." className={`w-full bg-slate-950/50 border border-white/5 rounded-xl px-5 py-4 focus:outline-none transition-all ${borderFocus}`} />
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setNewQuest({...newQuest, is_fixed: !newQuest.is_fixed})}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${newQuest.is_fixed ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                    <Lock size={20} /> <span className="text-[10px] font-black font-orbitron">Fixed</span>
                  </button>
                  <button type="button" onClick={() => setNewQuest({...newQuest, is_tomorrow: !newQuest.is_tomorrow})}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${newQuest.is_tomorrow ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                    <Calendar size={20} /> <span className="text-[10px] font-black font-orbitron">Tomorrow</span>
                  </button>
                </div>
                <button type="submit" className={`w-full font-black py-5 rounded-xl transition-all uppercase tracking-[0.3em] font-orbitron text-white ${isDanger ? 'bg-red-600 hover:bg-red-500 shadow-red-900/40' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40'} shadow-lg`}>Confirm Summoning</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEVEL UP NOTIFICATION */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }} className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-cyan-950/20 backdrop-blur-sm" />
            <div className="relative text-center">
              <motion.h2 animate={{ textShadow: ["0 0 10px #22d3ee", "0 0 40px #a855f7", "0 0 10px #22d3ee"], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-8xl font-black italic tracking-tighter text-white">LEVEL UP</motion.h2>
              <div className="text-2xl font-orbitron text-cyan-400 mt-4 tracking-[0.6em] animate-pulse">[ RANK ASCENSION: LEVEL {player.level} ]</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] blur-[120px] rounded-full ${isDanger ? 'bg-red-900/20' : 'bg-purple-900/10'}`} />
        <div className={`absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] blur-[120px] rounded-full animate-pulse ${isDanger ? 'bg-orange-900/10' : 'bg-cyan-900/10'}`} />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 lg:py-16">
        
        {/* PLAYER STATUS HEADER */}
        <header className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="md:col-span-2 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">[ {player.username.toUpperCase()} ]</h1>
                <div className="flex items-center gap-4 mt-2">
                  <p className={`text-xs font-bold tracking-widest leading-none ${accentColor}`}>RANK: {isDanger ? 'VULNERABLE' : 'S-RANK HUNTER'}</p>
                  <button onClick={() => setShowAddModal(true)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-orbitron transition-all bg-white/5 border border-white/10 ${accentColor} hover:bg-white/10`}><PlusCircle size={14} /> Summon Quest</button>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-500 block mb-1 uppercase tracking-tighter">Level</span>
                <motion.span key={player.level} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="text-6xl font-black italic text-white drop-shadow-2xl">{player.level}</motion.span>
              </div>
            </div>
            <div className="space-y-2">
              <div className={`flex justify-between text-xs font-bold tracking-widest opacity-80 ${accentColor}`}><span>XP PROGRESSION</span><span>{player.xp} / 100 XP</span></div>
              <div className="h-3 w-full bg-slate-900 rounded-full border border-white/5 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${player.xp}%` }} transition={{ type: "spring", stiffness: 40, damping: 12 }} className={`h-full ${progressBg} ${glowShadow}`} />
              </div>
            </div>
          </motion.div>

          <div className="grid grid-rows-2 gap-4">
            <motion.div animate={isDanger ? { scale: [1, 1.02, 1] } : {}} transition={{ repeat: Infinity, duration: 2 }} className={`backdrop-blur-md bg-white/5 border rounded-2xl p-6 flex flex-col justify-between transition-colors duration-500 ${isDanger ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-red-500/20'}`}>
              <div className="flex justify-between items-center text-xs font-bold text-red-500 tracking-widest"><span>HP (HEALTH) {isDanger && ' - LOW'}</span><Shield size={16} /></div>
              <div className="flex items-baseline gap-2 mt-2"><span className={`text-4xl font-black ${isDanger ? 'text-red-500' : 'text-red-400 font-orbitron animate-pulse shadow-sm shadow-red-500/50'}`}>{player.hp}</span><span className="text-slate-600 font-bold uppercase tracking-tighter font-orbitron opacity-40">/ 100</span></div>
              <div className="h-2 w-full bg-slate-900 rounded-full mt-2 overflow-hidden"><motion.div animate={{ width: `${player.hp}%` }} className="h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]" /></div>
            </motion.div>
            <motion.div className="backdrop-blur-md bg-white/5 border border-orange-500/20 rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs font-bold text-orange-500 tracking-widest"><span>ACTIVE STREAK</span><Flame size={16} /></div>
              <div className="flex items-baseline gap-2 mt-2"><span className="text-4xl font-black text-orange-400">{player.streak_days}</span><span className="text-slate-600 font-bold uppercase tracking-tighter font-orbitron italic opacity-40">Days</span></div>
            </motion.div>
          </div>
        </header>

        {/* QUESTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.section variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <div className="flex items-center gap-3 mb-2"><Sword className={accentColor} size={24} /><h2 className="text-2xl font-black tracking-tight italic uppercase">Active Quests</h2></div>
            <div className="space-y-3 min-h-[100px]">
              <AnimatePresence mode="popLayout" initial={false}>
                {todayQuests.map((quest) => (
                  <motion.div layout key={quest.id} variants={itemVariants} className={`group relative flex items-center p-5 rounded-xl border transition-all duration-300 ${quest.is_completed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                    <label className="mr-5 relative cursor-pointer"><input type="checkbox" checked={quest.is_completed} onChange={() => toggleTask(quest.id)} className={`w-7 h-7 rounded border-2 bg-slate-900 appearance-none transition-all cursor-pointer ${quest.is_completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'}`} />{quest.is_completed && <CheckCircle2 className="absolute top-0 left-0 text-white pointer-events-none" size={28} />}</label>
                    <div className="flex-1"><h3 className={`font-black tracking-tight transition-all ${quest.is_completed ? 'text-emerald-400 line-through opacity-40' : 'text-slate-100'}`}>{quest.title}</h3></div>
                    {quest.is_fixed && <Lock size={16} className="text-slate-600" />}
                  </motion.div>
                ))}
              </AnimatePresence>
              {todayQuests.length === 0 && <div className="text-slate-600 italic p-8 text-center border-2 border-dashed border-white/5 rounded-2xl">No active quests.</div>}
            </div>
          </motion.section>

          <motion.section variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 opacity-80">
            <div className="flex items-center gap-3 mb-2 opacity-50"><Calendar className="text-purple-400" size={24} /><h2 className="text-2xl font-black tracking-tight italic uppercase">Future Planning</h2></div>
            
            {/* 🩹 PENALTY HEAL BUTTON */}
            <AnimatePresence>
              {isDanger && (
                <motion.button initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileHover={{ scale: 1.02 }} onClick={handleHeal}
                  className="w-full mb-4 p-6 rounded-2xl bg-red-600/20 border-2 border-red-500/50 flex flex-col items-center gap-2 group relative overflow-hidden">
                  <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-red-600 pointer-events-none" />
                  <div className="relative z-10 flex flex-col items-center">
                    <Heart className="text-red-500 animate-pulse mb-1" size={32} />
                    <span className="text-xs font-black text-red-500 tracking-[0.2em] font-orbitron uppercase">🩸 Accept Penalty Quest</span>
                    <span className="text-lg font-black text-white italic tracking-tighter">100 PUSHUPS (RESTORE HP)</span>
                  </div>
                </motion.button>
              )}
            </AnimatePresence>

            <div className="space-y-3 min-h-[100px]">
              <AnimatePresence mode="popLayout">
                {tomorrowQuests.map((quest) => (
                  <motion.div layout key={quest.id} variants={itemVariants} className="flex items-center p-5 rounded-xl border border-white/5 bg-slate-900/50 opacity-60"><div className="w-7 h-7 mr-5 rounded border-2 border-slate-800" /><h3 className="font-bold tracking-tight text-slate-400">{quest.title}</h3>{quest.is_fixed && <Lock size={16} className="ml-auto text-slate-700" />}</motion.div>
                ))}
              </AnimatePresence>
              <button onClick={() => { setNewQuest({ ...newQuest, is_tomorrow: true }); setShowAddModal(true); }} className="w-full py-5 rounded-xl border-2 border-dashed border-white/10 text-slate-500 font-black hover:border-purple-500/30 font-orbitron uppercase text-[10px] tracking-[0.3em]">+ Plan Future Quest</button>
            </div>
          </motion.section>
        </div>

        <footer className="mt-20">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleCompleteDay} className={`w-full group relative overflow-hidden bg-slate-900 border p-10 rounded-3xl transition-all shadow-2xl ${isDanger ? 'border-red-500/50 hover:shadow-red-500/10' : 'border-white/5 hover:border-cyan-500/30'}`}>
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDanger ? 'bg-red-500/5' : 'bg-cyan-500/5'}`} />
            <div className="relative z-10 flex flex-col items-center">
              <span className={`text-[10px] font-black tracking-[0.5em] mb-3 font-orbitron ${accentColor}`}>Authorization Sequence Check</span>
              <h2 className="text-3xl lg:text-4xl font-black italic text-white flex items-center gap-6">🌙 COMPLETE TODAY & START TOMORROW</h2>
              <p className="mt-4 text-slate-600 font-bold italic uppercase tracking-widest text-xs">HP penalties apply for missed mandatory quests.</p>
            </div>
          </motion.button>
        </footer>
      </main>
    </div>
  );
}
