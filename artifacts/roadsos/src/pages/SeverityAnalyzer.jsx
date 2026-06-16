import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  AlertTriangle,
  ScanLine,
  FileText,
  CheckCircle2,
  AlertOctagon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SeverityAnalyzer() {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [severity, setSeverity] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result);
        setSeverity(null);
        startAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate AI processing time
    setTimeout(() => {
      setIsAnalyzing(false);
      // Random severity for demo
      const severities = ["LOW", "MEDIUM", "CRITICAL"];
      setSeverity(severities[Math.floor(Math.random() * severities.length)]);
    }, 3000);
  };

  const triggerCamera = () => {
    // In a real app, this would use navigator.mediaDevices.getUserMedia
    // For demo, we just trigger the file input
    fileInputRef.current?.click();
  };

  const getSeverityColor = (sev) => {
    switch (sev) {
      case "LOW":
        return "text-green-500 border-green-500 bg-green-500/10";
      case "MEDIUM":
        return "text-yellow-500 border-yellow-500 bg-yellow-500/10";
      case "CRITICAL":
        return "text-red-500 border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(255,0,0,0.3)]";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col relative">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white font-orbitron flex items-center gap-2">
          <ScanLine className="w-6 h-6 text-accent" />
          VISUAL ANALYZER
        </h1>
        <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1">
          AI Damage Assessment
        </p>
      </header>

      <div className="flex-1 flex flex-col">
        {/* Upload / Preview Area */}
        <div className="glass-card relative overflow-hidden rounded-2xl flex-1 max-h-[50vh] flex items-center justify-center border-accent/20 mb-6 bg-black">
          {!image ? (
            <div className="text-center p-6">
              <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider">
                Provide visual telemetry
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={triggerCamera}
                  className="bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30"
                >
                  <Camera className="w-4 h-4 mr-2" /> Camera
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="border-white/20 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" /> Upload
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <img
                src={image}
                alt="Uploaded for analysis"
                className="w-full h-full object-cover opacity-60"
              />

              {/* Scanning Animation */}
              {isAnalyzing && (
                <>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,149,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,149,255,0.2)_1px,transparent_1px)] bg-[size:20px_20px]" />
                  <motion.div
                    className="absolute top-0 left-0 w-full h-1 bg-accent shadow-[0_0_15px_rgba(0,149,255,1)]"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-accent text-accent font-orbitron tracking-widest text-sm animate-pulse">
                      PROCESSING...
                    </div>
                  </div>
                </>
              )}

              {/* Analysis Complete Overlay */}
              {!isAnalyzing && severity && (
                <div className="absolute top-4 right-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImage(null)}
                    className="bg-black/50 border-white/20 backdrop-blur-md"
                  >
                    RESCAN
                  </Button>
                </div>
              )}
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        {/* Results Area */}
        <AnimatePresence>
          {!isAnalyzing && severity && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 mb-auto"
            >
              <div
                className={`p-4 rounded-xl border-2 ${getSeverityColor(severity)} flex items-center justify-between`}
              >
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-80 mb-1">
                    Assessed Severity
                  </p>
                  <p className="text-2xl font-orbitron font-bold">{severity}</p>
                </div>
                {severity === "CRITICAL" ? (
                  <AlertOctagon className="w-10 h-10" />
                ) : severity === "MEDIUM" ? (
                  <AlertTriangle className="w-10 h-10" />
                ) : (
                  <CheckCircle2 className="w-10 h-10" />
                )}
              </div>

              <div className="glass-card p-4 border-white/10">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" /> AI Recommendations
                </h3>
                <ul className="space-y-2 text-sm text-white/80">
                  {severity === "CRITICAL" && (
                    <>
                      <li className="flex gap-2">
                        <span className="text-red-500 font-bold">›</span>{" "}
                        Immediate medical attention required
                      </li>
                      <li className="flex gap-2">
                        <span className="text-red-500 font-bold">›</span> Do not
                        move injured individuals unless in immediate danger
                      </li>
                      <li className="flex gap-2">
                        <span className="text-red-500 font-bold">›</span> Secure
                        the perimeter if safe to do so
                      </li>
                    </>
                  )}
                  {severity === "MEDIUM" && (
                    <>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 font-bold">›</span>{" "}
                        Seek medical evaluation within 2 hours
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 font-bold">›</span>{" "}
                        Move vehicles to shoulder if drivable
                      </li>
                      <li className="flex gap-2">
                        <span className="text-yellow-500 font-bold">›</span>{" "}
                        Exchange information with other parties
                      </li>
                    </>
                  )}
                  {severity === "LOW" && (
                    <>
                      <li className="flex gap-2">
                        <span className="text-green-500 font-bold">›</span> No
                        immediate medical threat detected
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-500 font-bold">›</span>{" "}
                        Document scene with additional photos
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-500 font-bold">›</span> File
                        standard incident report
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {severity === "CRITICAL" && (
                <Button className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold text-lg neon-box-red tracking-wider mt-4">
                  ACTIVATE SOS PROTOCOL
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
