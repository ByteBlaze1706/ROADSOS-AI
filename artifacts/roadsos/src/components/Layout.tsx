import { Link, useLocation } from "wouter";
import { Home, Map, Radio, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { activeSos } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Map, label: "Map", href: "/map" },
    { icon: Radio, label: "SOS", href: activeSos ? "/emergency-active" : "/dashboard", isSos: true },
    { icon: MessageSquare, label: "Chat", href: "/ai-chat" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full glass-card border-t border-white/5 rounded-none rounded-t-2xl z-50">
        <div className="flex justify-around items-center h-20 px-4">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;

            if (item.isSos) {
              return (
                <Link key={item.href} href={item.href}>
                  <div className="flex flex-col items-center justify-center -mt-8">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-primary text-white neon-box-red ${activeSos ? 'animate-pulse' : ''}`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] mt-1 font-orbitron font-bold text-primary">SOS</span>
                  </div>
                </Link>
              );
            }

            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${isActive ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-[10px]">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
