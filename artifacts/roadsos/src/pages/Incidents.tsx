import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, AlertTriangle, Calendar, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGetIncidents, getGetIncidentsQueryKey, useReportIncident } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";

export default function Incidents() {
  const { userId } = useAuth();
  const { data: incidents, refetch } = useGetIncidents({ query: { queryKey: getGetIncidentsQueryKey() } });
  const reportMutation = useReportIncident();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    type: "",
    severity: "",
    description: ""
  });

  // Dummy data if API empty
  const dummyIncidents = [
    { id: 1, type: "Vehicle Collision", severity: "CRITICAL", date: "2023-10-15T14:30:00Z", status: "RESOLVED", location: "I-80 Westbound" },
    { id: 2, type: "Medical Emergency", severity: "MEDIUM", date: "2023-09-02T09:15:00Z", status: "RESOLVED", location: "Downtown Sector" },
    { id: 3, type: "Road Hazard", severity: "LOW", date: "2023-11-20T18:45:00Z", status: "PENDING", location: "Route 101" },
  ];

  const displayList = incidents?.length ? incidents : dummyIncidents;

  const handleReport = () => {
    if (!newIncident.type || !newIncident.severity) return;
    
    reportMutation.mutate({
      data: {
        userId: userId || "demo-user",
        type: newIncident.type,
        severity: newIncident.severity,
        description: newIncident.description,
        latitude: 37.7749,
        longitude: -122.4194
      }
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setNewIncident({ type: "", severity: "", description: "" });
        refetch();
      }
    });
  };

  const getSeverityBadge = (sev: string) => {
    switch(sev.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return <span className="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">CRITICAL</span>;
      case 'MEDIUM':
        return <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">MEDIUM</span>;
      default:
        return <span className="bg-green-500/20 text-green-500 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">LOW</span>;
    }
  };

  return (
    <div className="p-4 min-h-screen bg-background pb-24">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-orbitron">INCIDENT LOGS</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1">Historical Records</p>
        </div>
        <Button 
          size="icon" 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 rounded-full h-10 w-10"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search logs by ID or type..." 
          className="pl-10 bg-black/50 border-white/10 text-white h-12"
        />
      </div>

      <div className="space-y-4">
        {displayList.map((inc, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={inc.id}
            className="glass-card p-4 border-white/5 hover:border-white/10 transition-colors cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                <span className="font-mono text-xs text-muted-foreground">LOG-{inc.id.toString().padStart(4, '0')}</span>
              </div>
              {getSeverityBadge(inc.severity)}
            </div>
            
            <h3 className="font-bold text-white text-lg mb-2">{inc.type}</h3>
            
            <div className="flex flex-col gap-1 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(inc.date || (inc as any).createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>{(inc as any).location || "GPS Coordinates Logged"}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
              <span className={`text-[10px] uppercase tracking-widest font-bold ${inc.status === 'RESOLVED' ? 'text-muted-foreground' : 'text-accent'}`}>
                STATUS: {inc.status}
              </span>
              <span className="text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                VIEW DETAIL <span className="ml-1">→</span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-xl uppercase tracking-wider text-accent">Report Incident</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Log a new incident to the central database.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Incident Type</label>
              <Input 
                placeholder="E.g., Vehicle Collision" 
                value={newIncident.type}
                onChange={e => setNewIncident({...newIncident, type: e.target.value})}
                className="bg-black/50 border-white/10"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Severity</label>
              <Select value={newIncident.severity} onValueChange={v => setNewIncident({...newIncident, severity: v})}>
                <SelectTrigger className="bg-black/50 border-white/10">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10 text-white">
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Description</label>
              <Textarea 
                placeholder="Brief description of the event..."
                value={newIncident.description}
                onChange={e => setNewIncident({...newIncident, description: e.target.value})}
                className="bg-black/50 border-white/10 resize-none min-h-[80px]"
              />
            </div>
            <Button 
              onClick={handleReport}
              disabled={reportMutation.isPending || !newIncident.type || !newIncident.severity}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 neon-box-blue font-bold tracking-widest mt-2"
            >
              {reportMutation.isPending ? "SUBMITTING..." : "LOG INCIDENT"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}