import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Navigation, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useGetNearbyServices,
  getGetNearbyServicesQueryKey,
} from "@workspace/api-client-react";

export default function MapPage() {
  const [filter, setFilter] = useState("ALL");
  const filters = ["ALL", "HOSPITALS", "POLICE", "TOWING", "PUNCTURE"];

  // In a real app, we'd pass coordinates
  const { data: services, isLoading } = useGetNearbyServices(
    {
      lat: 37.7749,
      lng: -122.4194,
      type: filter === "ALL" ? undefined : filter.toLowerCase(),
    },
    {
      query: {
        queryKey: getGetNearbyServicesQueryKey({
          lat: 37.7749,
          lng: -122.4194,
          type: filter === "ALL" ? undefined : filter.toLowerCase(),
        }),
      },
    },
  );

  // Fallback dummy data if API is not connected or returns empty
  const dummyServices = [
    {
      id: "1",
      name: "City General Hospital",
      type: "HOSPITAL",
      distance: 1.2,
      eta: 4,
      available: true,
      phone: "555-0101",
    },
    {
      id: "2",
      name: "Central Police Precinct",
      type: "POLICE",
      distance: 2.5,
      eta: 8,
      available: true,
      phone: "555-0102",
    },
    {
      id: "3",
      name: "Rapid Towing Co.",
      type: "TOWING",
      distance: 0.8,
      eta: 3,
      available: true,
      phone: "555-0103",
    },
    {
      id: "4",
      name: "Mike's Puncture Repair",
      type: "PUNCTURE",
      distance: 3.1,
      eta: 12,
      available: false,
      phone: "555-0104",
    },
  ];

  const displayServices = services?.length
    ? services
    : dummyServices.filter((s) => filter === "ALL" || s.type === filter);

  return (
    <div className="h-screen bg-background flex flex-col relative overflow-hidden pb-20">
      {/* Search Header */}
      <div className="absolute top-0 left-0 w-full z-20 p-4 bg-gradient-to-b from-background via-background/80 to-transparent">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search sector..."
            className="pl-10 bg-black/50 border-white/20 text-white backdrop-blur-md h-12 rounded-xl focus:border-accent"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-accent text-accent-foreground border border-accent neon-box-blue"
                  : "bg-black/50 text-muted-foreground border border-white/10 hover:border-white/30 backdrop-blur-md"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Styled Map Area */}
      <div className="flex-1 relative bg-[#0a0f18] overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,149,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,149,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(45deg)] transform-origin-top scale-[1.5]" />

        {/* User Location Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          <div className="w-4 h-4 bg-accent rounded-full relative z-10 shadow-[0_0_15px_rgba(0,149,255,1)]"></div>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-accent"
            animate={{ scale: [1, 3], opacity: [0.8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          <div className="mt-2 bg-black/80 px-2 py-1 rounded border border-accent/30 text-[10px] text-accent font-mono backdrop-blur-sm">
            USER_LOC_LOCKED
          </div>
        </div>

        {/* Dummy Route Line */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
          <motion.path
            d="M 50% 50% Q 60% 40% 70% 30% T 85% 20%"
            fill="none"
            stroke="#0095ff"
            strokeWidth="3"
            strokeDasharray="5,5"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        {/* Dummy POI Markers */}
        <div className="absolute top-[30%] right-[15%] w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(255,0,0,1)]"></div>
        <div className="absolute top-[60%] left-[25%] w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(255,200,0,1)]"></div>
      </div>

      {/* Bottom Sheet - Service List */}
      <div className="absolute bottom-20 left-0 w-full z-20 px-4 pb-4 h-[40vh] flex flex-col">
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3" />
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
          {displayServices.map((service, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={service.id}
              className="glass-card p-4 border-white/10"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-white tracking-wide">
                    {service.name}
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase">
                    {service.type}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-accent font-orbitron font-bold">
                    {service.distance} KM
                  </div>
                  <div className="text-xs text-white/50">
                    {service.eta} min ETA
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-white/10 hover:bg-white/5 h-10"
                >
                  <Phone className="w-4 h-4 mr-2" /> CALL
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30 h-10"
                >
                  <Navigation className="w-4 h-4 mr-2" /> NAVIGATE
                </Button>
              </div>
            </motion.div>
          ))}
          {displayServices.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
              No assets located in current sector.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
