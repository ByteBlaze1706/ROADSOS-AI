import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertTriangle, Cpu, StopCircle, Radio, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CrashDetection() {
  const [gForce, setGForce] = useState(1.0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [crashDetected, setCrashDetected] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const requestRef = useRef<number>();
  const simulateTimeoutRef = useRef<NodeJS.Timeout>();

  const updateGForce = () => {
    if (!crashDetected && !isSimulating) {
      // Normal minor fluctuations around 1.0 (gravity)
      const baseG = 1.0;
      const noise = (Math.random() - 0.5) * 0.1;
      setGForce(baseG + noise);
    }
    requestRef.current = requestAnimationFrame(updateGForce);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGForce);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [crashDetected, isSimulating]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (crashDetected && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      // Would trigger SOS here
    }
    return () => clearTimeout(timer);
  }, [crashDetected, countdown]);

  const handleSimulate = () => {
    setIsSimulating(true);
    
    // Simulate spike
    let val = 1.0;
    const spike = setInterval(() => {
      val += 0.5;
      setGForce(val);
      if (val > 4.5) {
        clearInterval(spike);
        setCrashDetected(true);
        setIsSimulating(false);
      }
    }, 50);
  };

  const handleCancel = () => {
    setCrashDetected(false);
    setCountdown(10);
    setGForce(1.0);
    setIsSimulating(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col p-4">
      
      {/* Normal State Background */}
      {!crashDetected && (
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,149,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,149,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none -z-10" />
      )}

      {/* Crash Detected Fullscreen Alert */}
      <AnimatePresence>
        {crashDetected && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-900/90 z-40 flex flex-col items-center justify-center p-6 backdrop-blur-md"
          >
            <motion.div 
              className="absolute inset-0 bg-red-600 mix-blend-overlay"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            
            <AlertTriangle className="w-32 h-32 text-white mb-6 animate-pulse" />
            
            <h1 className="text-4xl font-orbitron font-bold text-white text-center tracking-wider mb-2">IMPACT DETECTED</h1>
            
            <div className="font-mono text-xl text-red-200 mb-12 h-8">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                AI ANALYZING TRAUMA VECTOR...
              </motion.span>
            </div>

            <div className="text-center mb-12 relative z-50">
              <p className="text-sm uppercase tracking-widest text-white/70 mb-4">Auto-Dispatching SOS in</p>
              <div className="text-8xl font-orbitron font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                {countdown}
              </div>
            </div>

            <Button 
              onClick={handleCancel}
              size="lg"
              className="w-full max-w-md h-16 text-xl bg-black border-2 border-white/20 hover:bg-white/10 text-white font-bold relative z-50 rounded-xl"
            >
              I AM OKAY - CANCEL
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-orbitron">SENSOR ARRAY</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold flex items-center gap-1 mt-1">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Monitoring Active
          </p>
        </div>
        <Cpu className="text-accent w-8 h-8 opacity-50" />
      </header>

      <div className="flex-1 flex flex-col relative z-10">
        
        {/* Main Readout */}
        <div className="glass-card p-8 flex flex-col items-center justify-center border-accent/20 flex-1 min-h-[300px] mb-6 relative overflow-hidden">
          <div className="absolute top-4 left-4 text-xs font-mono text-muted-foreground">AXIS: X,Y,Z</div>
          <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-mono text-green-500">
            <Radio className="w-3 h-3" /> CALIBRATED
          </div>

          <div className="text-center">
            <span className="text-sm text-accent uppercase tracking-widest mb-2 block font-bold">Current G-Force</span>
            <div className="text-7xl font-orbitron font-bold text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(0,149,255,0.3)]">
              {gForce.toFixed(2)}<span className="text-3xl text-muted-foreground ml-1">G</span>
            </div>
          </div>

          {/* Graphical Representation */}
          <div className="absolute bottom-0 left-0 w-full h-24 flex items-end justify-center px-8 opacity-20">
            <div className="w-full h-[1px] bg-accent relative">
              <motion.div 
                className="absolute bottom-0 w-4 bg-accent"
                style={{ height: `${Math.min(gForce * 10, 100)}px`, left: '50%', transform: 'translateX(-50%)' }}
              />
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-4 mb-auto">
          <div className="glass-card p-4 border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Accelerometer</p>
            <p className="font-bold text-sm text-green-500 flex items-center gap-2">
              <Activity className="w-3 h-3" /> ACTIVE
            </p>
          </div>
          <div className="glass-card p-4 border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Gyroscope</p>
            <p className="font-bold text-sm text-green-500 flex items-center gap-2">
              <Activity className="w-3 h-3" /> ACTIVE
            </p>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="mt-8 p-4 rounded-xl border border-dashed border-white/20 bg-background/50">
          <p className="text-xs text-center text-muted-foreground uppercase tracking-widest mb-4">Simulation Controls</p>
          <Button 
            onClick={handleSimulate}
            disabled={isSimulating || crashDetected}
            className="w-full h-14 bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-500/50 font-bold tracking-wider"
          >
            <StopCircle className="w-5 h-5 mr-2" />
            SIMULATE HIGH-G IMPACT
          </Button>
        </div>
      </div>
    </div>
  );
}