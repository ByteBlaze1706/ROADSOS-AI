import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      setLocation("/login");
    }
  }, [isLoggedIn, setLocation]);

  if (!isLoggedIn) return null;
  return <>{children}</>;
}
