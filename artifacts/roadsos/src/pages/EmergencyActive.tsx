import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { AlertOctagon, Phone, MapPin, XOctagon, ShieldAlert, Activity } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useCancelSos, useGetActiveSos, getGetActiveSosQueryKey } from "@workspace/api-client-react";

export default function EmergencyActive() {
  const [, setLocation] = useLocation();
  const { userId, setActiveSos } = useAuth();
  const cancelSosMutation = useCancelSos();
  const { data: activeSosData } = useGetActiveSos({ query: { queryKey: getGetActiveSosQueryKey() } });

  const [eta, setEta] = useState(480); // 8 minutes in seconds
  const [stages, setStages] = useState([
    { id: 1, label: "Signal Transmitted", status: "completed" },
    { id: 2, label: "Location Locked", status: "completed" },
    { id: 3, label: "Responders Alerted", status: "active" },
    { id: 4, label: "Ambulance Dispatched", status: "pending" },
    { id: 5, label: "Contacts Notified", status: "pending" },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setEta((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate stage progression
    const t1 = setTimeout(() => setStages(s => s.map(st => st.id === 3 ? { ...st, status: "completed" } : st.id === 4 ? { ...st, status: "active" } : st)), 3000);
    const t2 = setTimeout(() => setStages(s => s.map(st => st.id === 4 ? { ...st, status: "completed" } : st.id === 5 ? { ...st, status: "active" } : st)), 6000);
    const t3 = setTimeout(() => setStages(s => s.map(st => st.id === 5 ? { ...st, status: "completed" } : st)), 9000);
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleCancel = () => {
    if (activeSosData?.alert?.id) {
      cancelSosMutation.mutate({ id: activeSosData.alert.id }, {
        onSuccess: () => {
          setActiveSos(false);
          setLocation("/dashboard");
        }
      });
    } else {
      setActiveSos(false);
      setLocation("/dashboard");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#1a0000] text-white flex flex-col relative overflow-hidden">
      {/* Red Siren Effect */}
      <motion.div 
        className="absolute inset-0 bg-red-600 pointer-events-none mix-blend-overlay"
        animate={{ opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      {/* Scanning Radar Line */}
      <motion.div 
        className="absolute w-full h-[2px] bg-red-500/50 shadow-[0_0_20px_rgba(255,0,0,1)] top-0 z-0"
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 flex-1 flex flex-col p-4">
        <header className="flex justify-between items-center py-2 border-b border-red-500/30 mb-4">
          <div className="flex items-center gap-2 text-red-500">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
            <span className="font-orbitron font-bold tracking-widest">CRITICAL ALERT</span>
          </div>
          <span className="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded border border-red-500/50 uppercase tracking-widest font-bold">
            Live Feed
          </span>
        </header>

        {/* ETA Display */}
        <div className="flex flex-col items-center justify-center my-8">
          <span className="text-sm text-red-400 uppercase tracking-widest mb-2 font-bold">Estimated Arrival</span>
          <div className="text-7xl font-orbitron font-bold text-white drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]">
            {formatTime(eta)}
          </div>
          <span className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">Protocol 7 Activated</span>
        </div>

        {/* Status Stages */}
        <div className="glass-card border-red-500/20 bg-black/60 p-5 mb-6 flex-1 max-h-[40vh] overflow-y-auto">
          <div className="space-y-6">
            {stages.map((stage, i) => (
              <div key={stage.id} className="flex items-start gap-4">
                <div className="relative flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                    stage.status === 'completed' ? 'border-red-500 bg-red-500 text-white' : 
                    stage.status === 'active' ? 'border-red-500 bg-transparent text-red-500' : 
                    'border-white/20 bg-transparent'
                  }`}>
                    {stage.status === 'completed' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    {stage.status === 'active' && <motion.div className="w-2 h-2 rounded-full bg-red-500" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity }} />}
                  </div>
                  {i < stages.length - 1 && (
                    <div className={`w-0.5 h-10 ${stage.status === 'completed' ? 'bg-red-500/50' : 'bg-white/10'}`} />
                  )}
                </div>
                <div className={`pt-0.5 ${
                  stage.status === 'completed' ? 'text-white' : 
                  stage.status === 'active' ? 'text-red-400 font-bold' : 
                  'text-white/40'
                }`}>
                  <p className="font-orbitron tracking-wider text-sm">{stage.label}</p>
                  {stage.status === 'active' && <p className="text-xs text-red-500/70 mt-1 uppercase">Awaiting Confirmation...</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Location Marker (Mock) */}
        <div className="glass-card border-red-500/20 bg-black/60 p-4 mb-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center relative">
              <MapPin className="w-5 h-5 text-red-500 z-10" />
              <motion.div className="absolute inset-0 rounded-full border border-red-500" animate={{ scale: [1, 1.5], opacity: [1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Broadcasting Location</p>
              <p className="font-mono text-sm text-red-400">37.7749° N, 122.4194° W</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button 
            onClick={handleCancel}
            disabled={cancelSosMutation.isPending}
            className="h-14 bg-background/50 border border-white/20 text-white hover:bg-white/10 font-bold"
          >
            <XOctagon className="mr-2 w-5 h-5" />
            STAND DOWN
          </Button>
          <Button 
            className="h-14 bg-red-600 hover:bg-red-700 text-white neon-box-red font-bold"
          >
            <Phone className="mr-2 w-5 h-5" />
            VOICE LINK
          </Button>
        </div>
      </div>
    </div>
  );
}