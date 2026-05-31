import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, ShieldAlert, Zap, Radio, Clock, HeartPulse, ShieldCheck, MapPin } from "lucide-react";
import { useGetEmergencyStats, getGetEmergencyStatsQueryKey } from "@workspace/api-client-react";
import { Progress } from "@/components/ui/progress";

export default function GoldenHour() {
  const { data: stats } = useGetEmergencyStats({ query: { queryKey: getGetEmergencyStatsQueryKey() } });
  
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => (prev + 1) % 100);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 space-y-6 relative overflow-hidden min-h-screen">
      {/* Background Radar Effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(0,149,255,0.1)_0%,transparent_70%)] pointer-events-none -z-10" />
      <motion.div 
        className="absolute top-0 right-0 w-[400px] h-[400px] border border-accent/10 rounded-full pointer-events-none -z-10 translate-x-1/4 -translate-y-1/4"
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div 
        className="absolute top-0 right-0 w-[600px] h-[600px] border border-accent/5 rounded-full pointer-events-none -z-10 translate-x-1/4 -translate-y-1/4"
        animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
      />

      <header className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-orbitron">GOLDEN HOUR HUD</h1>
          <p className="text-accent text-xs uppercase tracking-widest font-bold">Tactical Overview</p>
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-accent flex items-center justify-center relative bg-accent/10">
          <Activity className="text-accent w-6 h-6" />
          <motion.div 
            className="absolute inset-0 rounded-full border border-accent"
            animate={{ scale: [1, 1.5], opacity: [1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </header>

      {/* Primary Gauge */}
      <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden border-accent/20">
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Live Telemetry</span>
        </div>
        
        <div className="relative w-48 h-48 mt-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background Arc */}
            <path d="M 20 80 A 45 45 0 1 1 80 80" fill="none" stroke="currentColor" className="text-white/10" strokeWidth="8" strokeLinecap="round" />
            {/* Value Arc (Simulated 75%) */}
            <motion.path 
              d="M 20 80 A 45 45 0 1 1 80 80" 
              fill="none" 
              stroke="url(#gradient)" 
              strokeWidth="8" 
              strokeLinecap="round"
              strokeDasharray="200"
              strokeDashoffset={200 - (200 * (stats?.severityScore || 75)) / 100}
              initial={{ strokeDashoffset: 200 }}
              animate={{ strokeDashoffset: 200 - (200 * (stats?.severityScore || 75)) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0095ff" />
                <stop offset="50%" stopColor="#ffaa00" />
                <stop offset="100%" stopColor="#ff0033" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
            <span className="text-4xl font-orbitron font-bold text-white">{stats?.severityScore || 75}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Risk Factor</span>
          </div>
        </div>
        
        <div className="w-full grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="bg-background/50 rounded-lg p-2 border border-white/5">
            <p className="text-xs text-muted-foreground uppercase">Network</p>
            <p className="font-bold text-accent">{stats?.networkQuality || "OPTIMAL"}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-2 border border-white/5">
            <p className="text-xs text-muted-foreground uppercase">GPS</p>
            <p className="font-bold text-green-500">{stats?.gpsStatus || "LOCKED"}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-2 border border-white/5">
            <p className="text-xs text-muted-foreground uppercase">Nodes</p>
            <p className="font-bold text-white">{stats?.activeResponders || 14}</p>
          </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider">Avg Response</span>
          </div>
          <div className="text-3xl font-orbitron font-bold text-white">{stats?.avgResponseTime || 6.2} <span className="text-sm text-muted-foreground">MIN</span></div>
        </div>
        
        <div className="glass-card p-4 flex flex-col justify-between border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">SOS Count</span>
          </div>
          <div className="text-3xl font-orbitron font-bold text-primary neon-text-red">{stats?.totalSosThisMonth || 3}</div>
        </div>
      </div>

      {/* Readiness Bar */}
      <div className="glass-card p-5">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <span className="font-orbitron text-sm uppercase tracking-widest text-white">System Readiness</span>
          </div>
          <span className="font-mono text-accent">{stats?.emergencyReadiness || 98}%</span>
        </div>
        <Progress value={stats?.emergencyReadiness || 98} className="h-2 bg-white/10" indicatorClassName="bg-accent neon-box-blue" />
        
        <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent"></div> Comm Relays
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent"></div> Sat Link
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent"></div> DB Sync
          </div>
        </div>
      </div>

      {/* Tactical Ticker */}
      <div className="bg-black/40 border-y border-accent/20 overflow-hidden h-8 flex items-center relative rounded-sm">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10"></div>
        <div className="bg-accent text-black text-[10px] font-bold px-2 py-1 uppercase tracking-widest h-full flex items-center z-20">LIVE</div>
        <motion.div 
          className="whitespace-nowrap flex gap-8 pl-4 font-mono text-xs text-accent/80"
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <span>TRAUMA CENTER ALPHA: ONLINE</span>
          <span>CITY GRID TRAFFIC: NORMAL</span>
          <span>SATELLITE UPLINK: STABLE</span>
          <span>WEATHER ALERT: CLEAR</span>
          <span>TRAUMA CENTER ALPHA: ONLINE</span>
          <span>CITY GRID TRAFFIC: NORMAL</span>
        </motion.div>
      </div>

    </div>
  );
}