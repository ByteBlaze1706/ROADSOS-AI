import { motion } from "framer-motion";
import { Link } from "wouter";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Splash() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
        <motion.div
          className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 bg-primary/5"
          animate={{
            scale: [1, 1.5, 2],
            opacity: [0.5, 0.2, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-full w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/50 to-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "top" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center w-full max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse"></div>
          <ShieldAlert className="w-24 h-24 text-primary relative z-10 neon-text-red" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl font-bold tracking-tight text-white mb-2"
        >
          ROADSOS<span className="text-primary">.AI</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg text-muted-foreground mb-12"
        >
          Your AI Emergency Co-Pilot
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full space-y-4"
        >
          <Link href="/login" className="w-full block">
            <Button className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground neon-box-red transition-all">
              LOGIN
            </Button>
          </Link>
          <Link href="/signup" className="w-full block">
            <Button variant="outline" className="w-full h-14 text-lg font-bold border-white/20 hover:bg-white/5 transition-all text-white backdrop-blur-sm">
              SIGN UP
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}