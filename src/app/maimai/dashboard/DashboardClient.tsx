"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  Search,
  RotateCw,
  LogOut,
  Heart,
  TrendingUp,
  Award,
  Music,
  Filter,
  Play,
  ArrowUpDown,
  CheckCircle,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface UserProfile {
  id: string;
  segaId: string;
  nickname: string;
  rating: number | null;
  trophy: string | null;
  plate: string | null;
  syncTime: number | null;
}

interface ScoreRecord {
  id: string;
  songTitle: string;
  difficulty: string;
  level: string;
  achievement: number;
  clearType: string | null;
  liked: number | null;
  playCount: number | null;
}

interface DashboardClientProps {
  user: UserProfile;
  initialScores: ScoreRecord[];
}

export default function DashboardClient({ user, initialScores }: DashboardClientProps) {
  const router = useRouter();
  const [scores, setScores] = useState<ScoreRecord[]>(initialScores);
  const [syncing, setSyncing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [clearTypeFilter, setClearTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"achievement" | "playCount" | "level">("achievement");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [mounted, setMounted] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/auth/sync", { method: "POST" });
      const data = await response.json();
      if (response.ok && data.success) {
        // Refetch scores
        router.refresh();
        setSyncSuccessMsg(true);
        setTimeout(() => setSyncSuccessMsg(false), 3000);
      } else {
        alert(data.error || "Failed to synchronize scores");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during synchronization");
    } finally {
      setSyncing(false);
    }
  };

  // Sync state if initialScores prop changes from server refresh
  useEffect(() => {
    setScores(initialScores);
  }, [initialScores]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.push("/maimai");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setLoggingOut(false);
    }
  };

  const toggleLike = async (scoreId: string, currentLiked: number) => {
    const nextLiked = currentLiked === 1 ? 0 : 1;
    
    // Optimistic UI update
    setScores((prev) =>
      prev.map((s) => (s.id === scoreId ? { ...s, liked: nextLiked } : s))
    );

    try {
      const response = await fetch("/api/auth/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scoreId, liked: nextLiked === 1 }),
      });
      if (!response.ok) {
        // Revert on error
        setScores((prev) =>
          prev.map((s) => (s.id === scoreId ? { ...s, liked: currentLiked } : s))
        );
      }
    } catch (err) {
      console.error(err);
      setScores((prev) =>
        prev.map((s) => (s.id === scoreId ? { ...s, liked: currentLiked } : s))
      );
    }
  };

  // Grouping Data calculations for charts
  const levels = ["8", "11+", "12", "12+", "13", "13+", "14", "14+", "15"];
  const levelCounts = levels.map((lvl) => {
    const count = scores.filter((s) => s.level === lvl).length;
    return { name: `Lvl ${lvl}`, count };
  });

  const clearTypes = ["AP", "APP", "FC", "FCP", "CLEAR"];
  const clearTypeData = clearTypes
    .map((type) => {
      const count = scores.filter((s) => s.clearType === type).length;
      return { name: type, value: count };
    })
    .filter((d) => d.value > 0);

  const clearTypeColors: Record<string, string> = {
    AP: "#22d3ee", // Cyan
    APP: "#06b6d4", // Darker cyan
    FC: "#c084fc", // Purple
    FCP: "#a855f7", // Darker purple
    CLEAR: "#94a3b8", // Slate
  };

  const achievementRanks = [
    {
      name: "AP (100.5%+)",
      count: scores.filter((s) => s.achievement >= 100.5).length,
      fill: "url(#cyanGrad)",
    },
    {
      name: "SSS (100%-100.49%)",
      count: scores.filter((s) => s.achievement >= 100.0 && s.achievement < 100.5).length,
      fill: "url(#purpleGrad)",
    },
    {
      name: "SS (99%-99.99%)",
      count: scores.filter((s) => s.achievement >= 99.0 && s.achievement < 100.0).length,
      fill: "url(#indigoGrad)",
    },
    {
      name: "S (97%-98.99%)",
      count: scores.filter((s) => s.achievement >= 97.0 && s.achievement < 99.0).length,
      fill: "url(#roseGrad)",
    },
    {
      name: "A or Below (<97%)",
      count: scores.filter((s) => s.achievement < 97.0).length,
      fill: "#475569",
    },
  ];

  // Filtering and sorting records
  const filteredScores = scores
    .filter((s) => {
      const matchesSearch = s.songTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDiff = difficultyFilter === "All" || s.difficulty === difficultyFilter;
      const matchesClear = clearTypeFilter === "All" || s.clearType === clearTypeFilter;
      return matchesSearch && matchesDiff && matchesClear;
    })
    .sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];

      // Convert level values to comparable metrics for level sort (e.g. 14+ is 14.7, 14 is 14.0)
      if (sortBy === "level") {
        const getLvlNum = (lvlStr: string) => {
          const num = parseFloat(lvlStr);
          return lvlStr.includes("+") ? num + 0.7 : num;
        };
        valA = getLvlNum(a.level);
        valB = getLvlNum(b.level);
      }

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (sortOrder === "asc") {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Basic":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "Advanced":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Expert":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "Master":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "Re:Master":
        return "bg-pink-500/20 text-pink-300 border-pink-400/30 border-dashed animate-pulse";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const toggleSort = (field: "achievement" | "playCount" | "level") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col px-4 md:px-8 py-8 relative z-10 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background cinematic grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Main Header Row */}
      <header className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/5 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 uppercase animate-pulse">
              {user.plate || "Maimai DX Player"}
            </span>
            <span className="text-xs font-mono text-slate-500">
              SEGA ID: {user.segaId}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 font-outfit">
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              {user.nickname}
            </span>
            <span className="text-slate-400 text-2xl font-normal ml-3 font-mono">
              // TELEMETRY
            </span>
          </h1>
          {user.trophy && (
            <p className="text-xs font-mono text-slate-400 tracking-wider mt-1 italic">
              🏆 &ldquo;{user.trophy}&rdquo;
            </p>
          )}
        </div>

        {/* Sync & Logout Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-mono text-xs uppercase tracking-wider hover:bg-cyan-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <RotateCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Sega ID"}
          </button>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 font-mono text-xs uppercase tracking-wider hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <LogOut className={`w-3.5 h-3.5 ${loggingOut ? "animate-spin" : ""}`} />
            {loggingOut ? "Disconnecting..." : "Logout"}
          </button>
        </div>
      </header>

      {/* Sync Success notification */}
      <AnimatePresence>
        {syncSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-6 py-3 rounded-xl flex items-center gap-3 text-xs font-mono z-50 shadow-lg shadow-cyan-500/10 backdrop-blur-md"
          >
            <CheckCircle className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span>Scores successfully synched with live SEGA API database!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Dashboard Grid */}
      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 relative z-10">
        
        {/* Left Column: Visual Orb & Recharts Pie */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          
          {/* Maimai Rating Orb Panel */}
          <GlassCard className="border border-white/5 bg-space-950/40 backdrop-blur-xl flex flex-col items-center justify-center py-10 relative overflow-hidden" enableTilt={true}>
            {/* Glowing orbital ring backgrounds */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_60%)] pointer-events-none" />
            
            {/* The 3D-Like Rating Orb */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-48 h-48 rounded-full border border-yellow-500/20 bg-gradient-to-tr from-yellow-600/10 via-amber-500/15 to-amber-300/30 shadow-[0_0_50px_rgba(234,179,8,0.2)] flex flex-col justify-center items-center backdrop-blur-md"
            >
              {/* Inner glowing core */}
              <div className="absolute inset-2 rounded-full border border-yellow-400/20 bg-[radial-gradient(circle_at_center,rgba(253,224,71,0.25)_0%,transparent_80%)] animate-pulse" />
              
              <Award className="w-7 h-7 text-yellow-400 mb-1 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              <span className="text-3xl font-extrabold tracking-tight font-mono text-yellow-300 drop-shadow-[0_0_12px_rgba(234,179,8,0.5)]">
                {user.rating ?? 0}
              </span>
              <span className="text-[10px] font-mono text-yellow-400/70 tracking-widest uppercase mt-0.5 font-bold">
                DX Rating
              </span>

              {/* Decorative orbit particles */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-dashed border-yellow-500/15 rounded-full pointer-events-none scale-105"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full top-0 left-1/2 -translate-x-1/2 shadow-[0_0_8px_#facc15]"
              />
            </motion.div>

            {/* Sync Timestamp underneath */}
            <div className="text-center mt-6">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                Last Telemetry Sync
              </span>
              <span className="text-xs font-mono text-cyan-400 mt-1 block">
                {user.syncTime ? new Date(user.syncTime).toLocaleString() : "Never synced"}
              </span>
            </div>
          </GlassCard>

          {/* Clear Type Pie Chart */}
          <GlassCard className="border border-white/5 bg-space-950/40 backdrop-blur-xl" enableTilt={false}>
            <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Music className="w-4 h-4 text-cyan-400" />
              Clear Types Breakdown
            </h2>
            
            {mounted && clearTypeData.length > 0 ? (
              <div className="w-full h-56 flex flex-col justify-center items-center">
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={clearTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {clearTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={clearTypeColors[entry.name] || "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(10, 10, 15, 0.9)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                      }}
                      itemStyle={{ color: "#f1f5f9", fontFamily: "monospace", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend list */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2 text-[10px] font-mono">
                  {clearTypeData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-sm inline-block"
                        style={{ backgroundColor: clearTypeColors[d.name] }}
                      />
                      <span className="text-slate-400">{d.name}</span>
                      <span className="text-slate-300 font-bold">({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-slate-500 font-mono text-xs">
                No telemetry registered.
              </div>
            )}
          </GlassCard>

        </div>

        {/* Center & Right Column: Analytics & Score Directory */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Analytics Graphs Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Level Spread Area Chart */}
            <GlassCard className="border border-white/5 bg-space-950/40 backdrop-blur-xl" enableTilt={false}>
              <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Played Levels Spread
              </h2>

              {mounted ? (
                <div className="w-full h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={levelCounts} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        stroke="#475569"
                        tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "monospace" }}
                      />
                      <YAxis
                        stroke="#475569"
                        tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "monospace" }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(10, 10, 15, 0.9)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                        }}
                        labelStyle={{ color: "#a5b4fc", fontFamily: "monospace", fontSize: "11px" }}
                        itemStyle={{ color: "#f1f5f9", fontFamily: "monospace", fontSize: "12px" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#6366f1"
                        fillOpacity={1}
                        fill="url(#purpleArea)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-52 flex items-center justify-center text-slate-500 font-mono text-xs">
                  No telemetry registered.
                </div>
              )}
            </GlassCard>

            {/* Achievement Rankings Bar Chart */}
            <GlassCard className="border border-white/5 bg-space-950/40 backdrop-blur-xl" enableTilt={false}>
              <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                Score Achievements Spread
              </h2>

              {mounted ? (
                <div className="w-full h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={achievementRanks} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22d3ee" />
                          <stop offset="100%" stopColor="#0891b2" />
                        </linearGradient>
                        <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#e879f9" />
                          <stop offset="100%" stopColor="#c084fc" />
                        </linearGradient>
                        <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#818cf8" />
                          <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                        <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fb7185" />
                          <stop offset="100%" stopColor="#e11d48" />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        stroke="#475569"
                        tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "monospace" }}
                      />
                      <YAxis
                        stroke="#475569"
                        tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "monospace" }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(10, 10, 15, 0.9)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                        }}
                        itemStyle={{ color: "#f1f5f9", fontFamily: "monospace", fontSize: "12px" }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {achievementRanks.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-52 flex items-center justify-center text-slate-500 font-mono text-xs">
                  No telemetry registered.
                </div>
              )}
            </GlassCard>

          </div>

          {/* Interactive Score List Directory */}
          <GlassCard className="border border-white/5 bg-space-950/40 backdrop-blur-xl relative" enableTilt={false}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-400" />
                Score Records Directory
              </h2>
              
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-black/40 border border-white/5 px-2.5 py-1 rounded-lg">
                <span>Displaying</span>
                <span className="text-cyan-400 font-bold">{filteredScores.length}</span>
                <span>/</span>
                <span>{scores.length} tracks</span>
              </div>
            </div>

            {/* Filter controls row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              
              {/* Search input */}
              <div className="sm:col-span-2 relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search song title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-black/30 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono text-xs"
                />
              </div>

              {/* Difficulty Dropdown */}
              <div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Filter className="w-3.5 h-3.5" />
                  </span>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-black/30 text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="All">All Difficulties</option>
                    <option value="Basic">Basic</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                    <option value="Master">Master</option>
                    <option value="Re:Master">Re:Master</option>
                  </select>
                </div>
              </div>

              {/* Clear Type Dropdown */}
              <div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </span>
                  <select
                    value={clearTypeFilter}
                    onChange={(e) => setClearTypeFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-black/30 text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="All">All Clears</option>
                    <option value="AP">AP</option>
                    <option value="APP">AP+</option>
                    <option value="FC">FC</option>
                    <option value="FCP">FC+</option>
                    <option value="CLEAR">CLEAR</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Score records Table/List */}
            {filteredScores.length > 0 ? (
              <div className="overflow-x-auto border border-white/5 rounded-xl bg-black/10">
                <table className="w-full border-collapse font-mono text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/2 text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                      <th className="py-3.5 px-4 font-medium">Song / Level</th>
                      <th 
                        className="py-3.5 px-4 font-medium cursor-pointer hover:text-slate-200 transition-colors"
                        onClick={() => toggleSort("level")}
                      >
                        <div className="flex items-center gap-1">
                          Lvl
                          <ArrowUpDown className="w-3 h-3 text-slate-500" />
                        </div>
                      </th>
                      <th 
                        className="py-3.5 px-4 font-medium cursor-pointer hover:text-slate-200 transition-colors"
                        onClick={() => toggleSort("achievement")}
                      >
                        <div className="flex items-center gap-1">
                          Achievement
                          <ArrowUpDown className="w-3 h-3 text-slate-500" />
                        </div>
                      </th>
                      <th className="py-3.5 px-4 font-medium text-center">Clear</th>
                      <th 
                        className="py-3.5 px-4 font-medium text-center cursor-pointer hover:text-slate-200 transition-colors"
                        onClick={() => toggleSort("playCount")}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Plays
                          <ArrowUpDown className="w-3 h-3 text-slate-500" />
                        </div>
                      </th>
                      <th className="py-3.5 px-4 font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredScores.map((score, index) => (
                      <motion.tr
                        key={score.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-white/2 transition-colors group"
                      >
                        {/* Song Title & Difficulty */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-outfit font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors text-sm">
                              {score.songTitle}
                            </span>
                            <span className={`inline-block w-fit px-2 py-0.5 rounded text-[8px] font-bold border ${getDifficultyColor(score.difficulty)}`}>
                              {score.difficulty}
                            </span>
                          </div>
                        </td>
                        
                        {/* Level */}
                        <td className="py-3.5 px-4">
                          <span className="text-slate-300 font-bold text-sm">
                            {score.level}
                          </span>
                        </td>

                        {/* Achievement percentage */}
                        <td className="py-3.5 px-4 font-bold">
                          <span className={score.achievement >= 100 ? "text-cyan-400" : "text-slate-300"}>
                            {score.achievement.toFixed(4)}%
                          </span>
                        </td>

                        {/* Clear Type Badge */}
                        <td className="py-3.5 px-4 text-center">
                          {score.clearType && (
                            <span
                              className="px-2.5 py-0.5 rounded text-[9px] font-bold border shadow-[0_0_8px_rgba(34,211,238,0.02)] inline-block"
                              style={{
                                color: clearTypeColors[score.clearType] || "#94a3b8",
                                borderColor: `${clearTypeColors[score.clearType]}30` || "#94a3b830",
                                backgroundColor: `${clearTypeColors[score.clearType]}08` || "transparent",
                              }}
                            >
                              {score.clearType}
                            </span>
                          )}
                        </td>

                        {/* Play Count */}
                        <td className="py-3.5 px-4 text-center text-slate-400">
                          <div className="flex items-center justify-center gap-1">
                            <Play className="w-2.5 h-2.5 text-slate-600 group-hover:text-cyan-500 transition-colors" />
                            <span>{score.playCount || 1}</span>
                          </div>
                        </td>

                        {/* Liking Button */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => toggleLike(score.id, score.liked || 0)}
                            className="p-1.5 rounded-lg hover:bg-white/5 active:scale-90 text-slate-500 hover:text-rose-500 transition-all cursor-pointer"
                          >
                            <Heart
                              className={`w-4 h-4 transition-transform duration-300 ${
                                score.liked === 1
                                  ? "fill-rose-500 text-rose-500 scale-110 drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]"
                                  : "text-slate-500 hover:scale-105"
                              }`}
                            />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 font-mono text-xs border border-white/5 border-dashed rounded-xl bg-black/10">
                No score records match your search criteria.
              </div>
            )}
          </GlassCard>

        </div>
      </main>
    </div>
  );
}
