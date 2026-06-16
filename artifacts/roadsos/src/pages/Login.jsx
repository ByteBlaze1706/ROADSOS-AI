import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert, Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth";
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

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      setLocation("/dashboard");
    } catch (err) {
      form.setError("root", { type: "server", message: err.message || "Invalid credentials." });
    } finally {
      setIsLoading(false);
    }
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
            SYSTEM LOGIN
          </h1>
          <p className="text-muted-foreground mt-2">
            Access your emergency co-pilot
          </p>
        </div>

        <div className="glass-card p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {form.formState.errors.root && (
                <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-sm font-medium">
                  {form.formState.errors.root.message}
                </div>
              )}
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
                      Security Clearance
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
                    <FormMessage className="text-primary text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 text-md font-bold bg-primary hover:bg-primary/90 text-white neon-box-red"
                disabled={isLoading}
              >
                {isLoading ? "AUTHENTICATING..." : "INITIALIZE SESSION"}
                {!isLoading && <LogIn className="ml-2 w-5 h-5" />}
              </Button>
            </form>
          </Form>
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register">
            <span className="text-accent hover:text-accent/80 cursor-pointer font-bold">
              Create Account
            </span>
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
