import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert, User, Droplet, FileText, Phone, Plus, Trash2, HeartPulse, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/lib/auth";
import { useSaveProfile } from "@workspace/api-client-react";

const setupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  insuranceInfo: z.string().optional(),
  emergencyContacts: z.array(z.object({
    name: z.string().min(2, "Name is required"),
    phone: z.string().min(5, "Phone is required")
  })).min(1, "At least one emergency contact is required")
});

type SetupFormValues = z.infer<typeof setupSchema>;

export default function Setup() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const saveProfileMutation = useSaveProfile();

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      fullName: "",
      bloodGroup: "",
      allergies: "",
      medications: "",
      insuranceInfo: "",
      emergencyContacts: [{ name: "", phone: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emergencyContacts",
  });

  const onSubmit = async (data: SetupFormValues) => {
    // Generate a user ID for demo purposes if not logged in yet via normal flow
    const demoUserId = "demo-user-123";
    
    saveProfileMutation.mutate({
      data: {
        userId: demoUserId,
        fullName: data.fullName,
        bloodGroup: data.bloodGroup,
        allergies: data.allergies,
        medications: data.medications,
        insuranceInfo: data.insuranceInfo,
        emergencyContacts: JSON.stringify(data.emergencyContacts)
      }
    }, {
      onSuccess: () => {
        login(demoUserId);
        setLocation("/dashboard");
      }
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background relative overflow-y-auto">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-pulse opacity-50"></div>
      
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-orbitron flex items-center gap-3">
              <HeartPulse className="text-primary w-8 h-8 neon-text-red" />
              MEDICAL ID SETUP
            </h1>
            <p className="text-muted-foreground mt-1 uppercase text-xs tracking-widest">Crucial data for emergency responders</p>
          </div>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
            
            {/* Primary Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-orbitron text-accent border-b border-white/10 pb-2 mb-4">PRIMARY BIOMETRICS</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">Legal Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input placeholder="John Doe" className="pl-10 bg-background/50 border-white/10 text-white focus:border-accent" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-primary text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">Blood Group</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <div className="relative">
                            <Droplet className="absolute left-3 top-3 h-5 w-5 text-primary z-10" />
                            <SelectTrigger className="pl-10 bg-background/50 border-white/10 text-white focus:border-accent">
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent className="bg-card border-white/10 text-white">
                          {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                            <SelectItem key={bg} value={bg} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-primary text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </motion.div>

            {/* Medical History */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-orbitron text-accent border-b border-white/10 pb-2 mb-4">MEDICAL HISTORY</h2>
              
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">Known Allergies (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="E.g., Penicillin, Peanuts, Latex..." className="resize-none bg-background/50 border-white/10 text-white focus:border-accent min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage className="text-primary text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">Current Medications (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="E.g., Inhaler, Insulin, Blood thinners..." className="resize-none bg-background/50 border-white/10 text-white focus:border-accent min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage className="text-primary text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="insuranceInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">Insurance Provider (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Provider name, Policy #" className="pl-10 bg-background/50 border-white/10 text-white focus:border-accent" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-primary text-xs" />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Emergency Contacts */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4">
                <h2 className="text-lg font-orbitron text-accent">EMERGENCY CONTACTS</h2>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="h-8 border-accent/30 text-accent hover:bg-accent/10 hover:text-accent"
                  onClick={() => append({ name: "", phone: "" })}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 rounded-lg bg-background/30 border border-white/5 relative group">
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <FormField
                        control={form.control}
                        name={`emergencyContacts.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">Contact Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Jane Doe" className="pl-10 bg-background/50 border-white/10 text-white focus:border-accent" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage className="text-primary text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`emergencyContacts.${index}.phone`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input type="tel" placeholder="+1 (555) 000-0000" className="pl-10 bg-background/50 border-white/10 text-white focus:border-accent" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage className="text-primary text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground neon-box-blue transition-all"
                disabled={saveProfileMutation.isPending}
              >
                {saveProfileMutation.isPending ? "SAVING TO SECURE DB..." : "FINALIZE PROTOCOL"}
                {!saveProfileMutation.isPending && <Save className="ml-2 w-5 h-5" />}
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </div>
  );
}