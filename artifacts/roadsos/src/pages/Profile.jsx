import { motion } from "framer-motion";
import {
  User,
  Settings,
  LogOut,
  FileText,
  HeartPulse,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import {
  useGetProfile,
  getGetProfileQueryKey,
} from "@workspace/api-client-react";

export default function Profile() {
  const { logout, userId } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile } = useGetProfile({
    query: { queryKey: getGetProfileQueryKey() },
  });

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-to-b from-accent/20 to-background pt-12 pb-6 px-4">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-black border-2 border-accent shadow-[0_0_20px_rgba(0,149,255,0.3)] flex items-center justify-center mb-4 relative">
            <User className="w-10 h-10 text-accent" />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h1 className="text-2xl font-orbitron font-bold text-white">
            {profile?.fullName || "JOHN DOE"}
          </h1>
          <p className="font-mono text-xs text-accent mt-1 tracking-widest">
            ID: {userId || "OP-7728"}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-0 overflow-hidden border-white/5"
        >
          <div
            className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 hover:bg-white/10 cursor-pointer"
            onClick={() => setLocation("/setup")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="font-bold text-white tracking-wide">
                Edit Medical Profile
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          <div
            className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 hover:bg-white/10 cursor-pointer"
            onClick={() => setLocation("/medical-id")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-bold text-white tracking-wide">
                View Smart ID
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          <div
            className="p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 cursor-pointer"
            onClick={() => setLocation("/incidents")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="font-bold text-white tracking-wide">
                Incident History
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-0 overflow-hidden border-white/5"
        >
          <div className="p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70">
                <Settings className="w-4 h-4" />
              </div>
              <span className="font-bold text-white tracking-wide">
                System Settings
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pt-4"
        >
          <Button
            variant="outline"
            className="w-full h-14 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400 font-bold tracking-widest"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            TERMINATE SESSION
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
