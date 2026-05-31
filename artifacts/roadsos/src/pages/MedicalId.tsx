import { useState } from "react";
import { motion } from "framer-motion";
import { Droplet, HeartPulse, Share2, Shield, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";

export default function MedicalId() {
  const { data: profile } = useGetProfile({ query: { queryKey: getGetProfileQueryKey() } });
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Generate a fake grid pattern for QR code placeholder
  const renderQrGrid = () => {
    const cells = [];
    for (let i = 0; i < 64; i++) {
      const isFilled = Math.random() > 0.4;
      cells.push(
        <div key={i} className={`w-3 h-3 ${isFilled ? 'bg-white' : 'bg-transparent'}`} />
      );
    }
    return (
      <div className="w-24 h-24 bg-black p-1 grid grid-cols-8 gap-0 border-2 border-white/20">
        {/* QR alignment markers */}
        <div className="absolute top-1 left-1 w-6 h-6 border-2 border-white bg-black z-10 flex items-center justify-center"><div className="w-2 h-2 bg-white"></div></div>
        <div className="absolute top-1 right-1 w-6 h-6 border-2 border-white bg-black z-10 flex items-center justify-center"><div className="w-2 h-2 bg-white"></div></div>
        <div className="absolute bottom-1 left-1 w-6 h-6 border-2 border-white bg-black z-10 flex items-center justify-center"><div className="w-2 h-2 bg-white"></div></div>
        {cells}
      </div>
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ROADSOS Medical ID',
        text: 'Emergency Medical Information for ' + (profile?.fullName || 'User'),
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText("Medical ID data copied");
      // Could add toast here
    }
  };

  return (
    <div className={`min-h-screen p-4 transition-colors duration-500 ${emergencyMode ? 'bg-red-950' : 'bg-background'}`}>
      
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-orbitron">MEDICAL ID</h1>
          <p className={`${emergencyMode ? 'text-red-300' : 'text-muted-foreground'} text-xs uppercase tracking-widest mt-1`}>
            Authorized Personnel Only
          </p>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setEmergencyMode(!emergencyMode)}
          className={`rounded-full border-2 ${emergencyMode ? 'border-red-500 text-red-500 bg-red-500/20' : 'border-white/20 text-white/70'}`}
        >
          <AlertTriangle className="w-5 h-5" />
        </Button>
      </header>

      <motion.div 
        layout
        className={`glass-card rounded-3xl overflow-hidden border-2 ${emergencyMode ? 'border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.3)] bg-red-900/40' : 'border-accent/20'}`}
      >
        {/* ID Header */}
        <div className={`p-6 border-b ${emergencyMode ? 'border-red-500/30 bg-red-600/20' : 'border-white/10 bg-white/5'} flex justify-between items-start`}>
          <div>
            <h2 className={`text-3xl font-orbitron font-bold uppercase tracking-wider ${emergencyMode ? 'text-white' : 'text-white'}`}>
              {profile?.fullName || "JOHN DOE"}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <Shield className={`w-4 h-4 ${emergencyMode ? 'text-red-400' : 'text-accent'}`} />
              <span className={`text-xs uppercase tracking-widest font-bold ${emergencyMode ? 'text-red-400' : 'text-accent'}`}>
                Verified Identity
              </span>
            </div>
          </div>
          
          {/* Blood Group Badge */}
          <div className="relative">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${
              emergencyMode ? 'bg-red-600 border-2 border-white text-white' : 'bg-red-500/20 border border-red-500/50 text-red-500'
            }`}>
              <span className="text-2xl font-orbitron font-bold">{profile?.bloodGroup || "O+"}</span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 border border-white/10">
              <Droplet className={`w-4 h-4 ${emergencyMode ? 'text-red-500' : 'text-red-500'}`} fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Data Sections */}
        <div className={`p-6 space-y-6 ${emergencyMode ? 'text-lg' : 'text-sm'}`}>
          
          <div>
            <h3 className={`text-xs uppercase tracking-widest mb-2 font-bold ${emergencyMode ? 'text-red-300' : 'text-muted-foreground'}`}>Allergies / Reactions</h3>
            <p className={`font-medium ${emergencyMode ? 'text-white text-xl font-bold' : 'text-white/90'}`}>
              {profile?.allergies || "No known allergies"}
            </p>
          </div>

          <div>
            <h3 className={`text-xs uppercase tracking-widest mb-2 font-bold ${emergencyMode ? 'text-red-300' : 'text-muted-foreground'}`}>Current Medications</h3>
            <p className={`font-medium ${emergencyMode ? 'text-white text-xl font-bold' : 'text-white/90'}`}>
              {profile?.medications || "None"}
            </p>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h3 className={`text-xs uppercase tracking-widest mb-3 font-bold ${emergencyMode ? 'text-red-300' : 'text-muted-foreground'}`}>Emergency Contacts</h3>
            
            <div className="space-y-3">
              {/* Parse contacts if it's a string, or use array if already parsed */}
              {(() => {
                let contacts = [];
                try {
                  contacts = profile?.emergencyContacts ? JSON.parse(profile.emergencyContacts as string) : [{ name: "Jane Doe (Spouse)", phone: "+1 (555) 019-2837" }];
                } catch {
                  contacts = [{ name: "Jane Doe (Spouse)", phone: "+1 (555) 019-2837" }];
                }
                
                return contacts.map((c: any, i: number) => (
                  <div key={i} className={`flex justify-between items-center p-3 rounded-lg ${emergencyMode ? 'bg-red-950 border border-red-500/30' : 'bg-black/30 border border-white/5'}`}>
                    <div>
                      <p className={`font-bold ${emergencyMode ? 'text-white text-lg' : 'text-white'}`}>{c.name}</p>
                      <p className={`font-mono mt-1 ${emergencyMode ? 'text-red-200' : 'text-accent'}`}>{c.phone}</p>
                    </div>
                    {emergencyMode && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold h-10">CALL</Button>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
          
          {!emergencyMode && (
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Scan for Full Record</p>
                <p className="text-xs text-white/50">Encrypted token: 8XF-992-A</p>
              </div>
              <div className="relative">
                {renderQrGrid()}
              </div>
            </div>
          )}

        </div>
      </motion.div>

      {!emergencyMode && (
        <Button 
          onClick={handleShare}
          className="w-full h-14 mt-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold tracking-widest"
        >
          <Share2 className="w-5 h-5 mr-2" />
          SHARE PROTOCOL
        </Button>
      )}
    </div>
  );
}