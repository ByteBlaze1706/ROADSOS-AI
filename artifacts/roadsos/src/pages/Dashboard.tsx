import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, MapPin, Activity, ShieldAlert, Mic, Navigation, Plus, Zap, AlertTriangle, Phone } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useTriggerSos, useGetEmergencyStats, getGetEmergencyStatsQueryKey } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { userId, setActiveSos } = useAuth();
  const triggerSosMutation = useTriggerSos();
  const { data: stats } = useGetEmergencyStats({ query: { queryKey: getGetEmergencyStatsQueryKey() } });

  const [countdown, setCountdown] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const quickActions = [
    { id: "hospital", label: "Hospital", icon: Plus, color: "text-red-500", bg: "bg-red-500/10" },
    { id: "ambulance", label: "Ambulance", icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10" },
    { id: "police", label: "Police", icon: ShieldAlert, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "towing", label: "Towing", icon: Navigation, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { id: "puncture", label: "Puncture", icon: AlertTriangle, color: "text-gray-400", bg: "bg-gray-500/10" },
    { id: "fuel", label: "Fuel", icon: Zap, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  const dummyServices = [
    { name: "City General", distance: 1.2, eta: 4, type: "hospital" },
    { name: "Rapid Response", distance: 2.5, eta: 8, type: "ambulance" },
    { name: "Central Precinct", distance: 3.1, eta: 10, type: "police" },
    { name: "Quick Tow Co.", distance: 0.8, eta: 3, type: "towing" },
    { name: "Mike's Repair", distance: 1.5, eta: 5, type: "puncture" },
    { name: "Star Station", distance: 0.5, eta: 2, type: "fuel" },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      handleSosConfirm();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSosClick = () => {
    setCountdown(10);
  };

  const handleSosCancel = () => {
    setCountdown(null);
  };

  const handleSosConfirm = () => {
    triggerSosMutation.mutate({
      data: {
        userId: userId || "demo-user",
        latitude: 37.7749,
        longitude: -122.4194,
        severity: "CRITICAL",
        notes: "SOS triggered from Dashboard"
      }
    }, {
      onSuccess: () => {
        setActiveSos(true);
        setLocation("/emergency-active");
      }
    });
  };

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-primary neon-text-red" />
          <span className="font-orbitron font-bold text-xl tracking-wider">ROADSOS</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className={`p-2 rounded-full transition-all ${isListening ? 'bg-primary/20 text-primary neon-box-red animate-pulse' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
            onClick={() => setIsListening(!isListening)}
          >
            <Mic className="w-5 h-5" />
          </button>
          <div className="relative">
            <Bell className="w-6 h-6 text-muted-foreground" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></span>
          </div>
          <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent flex items-center justify-center font-bold text-accent">
            {userId?.substring(0, 2).toUpperCase() || "OP"}
          </div>
        </div>
      </header>

      {/* Main SOS Button Area */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative">
          <AnimatePresence>
            {countdown !== null && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-full bg-background/90 backdrop-blur-sm"
              >
                <span className="text-5xl font-orbitron font-bold text-primary neon-text-red">{countdown}</span>
                <span className="text-xs tracking-widest text-muted-foreground mt-2 uppercase">Dispatching</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSosCancel}
                  className="mt-4 border-white/20 hover:bg-white/10 text-white z-50 relative pointer-events-auto"
                >
                  CANCEL
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSosClick}
            disabled={countdown !== null}
            className="w-48 h-48 rounded-full bg-gradient-to-br from-red-600 to-red-900 border-4 border-red-500 shadow-[0_0_50px_rgba(255,0,51,0.5),inset_0_0_20px_rgba(255,255,255,0.5)] flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_60%)] opacity-20 MixBlend-overlay"></div>
            <span className="font-orbitron text-5xl font-bold text-white tracking-widest shadow-black drop-shadow-lg z-10">SOS</span>
            <span className="text-white/80 text-sm mt-1 tracking-widest uppercase font-bold z-10">Hold to activate</span>
            
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-white/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.button>
        </div>
      </div>

      {/* Mini Golden Hour HUD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setLocation("/golden-hour")}
        className="glass-card p-4 cursor-pointer hover:bg-white/5 transition-colors relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0 opacity-50"></div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-orbitron text-sm text-accent uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4" /> System Status
          </h3>
          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded border border-green-500/30">ONLINE</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Readiness</p>
            <p className="font-orbitron font-bold text-xl">{stats?.emergencyReadiness || 98}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">GPS Signal</p>
            <p className="font-orbitron font-bold text-xl text-green-500">{stats?.gpsStatus || "STRONG"}</p>
          </div>
        </div>
      </motion.div>

      {/* Map Placeholder */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => setLocation("/map")}
        className="glass-card h-32 relative overflow-hidden flex items-center justify-center cursor-pointer group"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9IiMwcjI4MzUiIGZpbGwtb3BhY2l0eT0iMSIvPgo8cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJ1cmwoI2EpIiBmaWxsLW9wYWNpdHk9IjEiLz4KPGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCIgeTE9IjAiIHgyPSI0MCIgeTI9IjQwIj4KPHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9Ii4wNSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZmYiIHN0b3Atb3BhY2l0eT0iMCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8cGF0aCBkPSJNMCAwaDQwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+CjxwYXRoIGQ9Ik0wIDB2NDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        
        <div className="relative z-10 flex items-center gap-2 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 group-hover:border-accent/50 transition-colors">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium tracking-wide">VIEW LIVE MAP</span>
        </div>
        
        <motion.div 
          className="absolute w-3 h-3 bg-accent rounded-full shadow-[0_0_10px_rgba(0,149,255,1)]"
          style={{ top: '40%', left: '60%' }}
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-orbitron text-muted-foreground uppercase tracking-wider mb-3">Rapid Deployment</h3>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedService(action.id)}
              className="glass-card p-3 flex flex-col items-center justify-center gap-2 border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors h-24"
            >
              <div className={`p-2 rounded-full ${action.bg} ${action.color}`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-white/80">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
        <DialogContent className="bg-card border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-xl uppercase tracking-wider text-accent">
              Nearby {quickActions.find(a => a.id === selectedService)?.label}s
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select an available service unit to dispatch.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {dummyServices.filter(s => s.type === selectedService || selectedService === null).map((service, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-white/5 hover:border-accent/50 transition-colors">
                <div>
                  <h4 className="font-bold text-white">{service.name}</h4>
                  <p className="text-xs text-muted-foreground">{service.distance} KM • {service.eta} MIN ETA</p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" className="border-white/10 text-white hover:bg-white/10 h-8 w-8">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 h-8">
                    DISPATCH
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}