import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert, Mail, Lock, UserPlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";

const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function Signup() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = form.watch("password");

  useEffect(() => {
    if (!passwordValue) {
      setPasswordStrength(0);
      return;
    }
    let strength = 0;
    if (passwordValue.length >= 8) strength += 25;
    if (/[A-Z]/.test(passwordValue)) strength += 25;
    if (/[0-9]/.test(passwordValue)) strength += 25;
    if (/[^A-Za-z0-9]/.test(passwordValue)) strength += 25;
    setPasswordStrength(strength);
  }, [passwordValue]);

  const getStrengthColor = () => {
    if (passwordStrength < 50) return "bg-destructive";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLocation("/setup");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,149,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_bottom_left,rgba(255,0,51,0.1)_0%,transparent_50%)]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center justify-center mb-4 cursor-pointer">
              <ShieldAlert className="w-12 h-12 text-primary neon-text-red" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white font-orbitron">
            NEW OPERATIVE
          </h1>
          <p className="text-muted-foreground mt-2">
            Initialize your emergency profile
          </p>
        </div>

        <div className="glass-card p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">
                      Email Designation
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="operative@roadsos.ai"
                          className="pl-10 bg-background/50 border-white/10 text-white focus:border-primary focus:ring-primary/50"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-primary text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">
                      Security Clearance Key
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 bg-background/50 border-white/10 text-white focus:border-primary focus:ring-primary/50"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    {passwordValue && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Encryption Strength</span>
                          <span>{passwordStrength}%</span>
                        </div>
                        <Progress
                          value={passwordStrength}
                          className="h-1 bg-white/10"
                          indicatorClassName={getStrengthColor()}
                        />
                      </div>
                    )}
                    <FormMessage className="text-primary text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">
                      Verify Key
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CheckCircle2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 bg-background/50 border-white/10 text-white focus:border-primary focus:ring-primary/50"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-primary text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 mt-2 text-md font-bold bg-primary hover:bg-primary/90 text-white neon-box-red"
                disabled={isLoading}
              >
                {isLoading ? "PROCESSING..." : "CREATE CLEARANCE"}
                {!isLoading && <UserPlus className="ml-2 w-5 h-5" />}
              </Button>
            </form>
          </Form>
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already have clearance?{" "}
          <Link href="/login">
            <span className="text-accent hover:text-accent/80 cursor-pointer font-bold">
              Access System
            </span>
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
