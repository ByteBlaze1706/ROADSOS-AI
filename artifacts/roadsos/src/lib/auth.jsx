import { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSos, setActiveSos] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setUserId(userData.id.toString());
          setIsLoggedIn(true);
          const storedActiveSos = localStorage.getItem("roadsos_activeSos") === "true";
          setActiveSos(storedActiveSos);
        } else {
          setUser(null);
          setUserId(null);
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Failed to check auth:", err);
        setUser(null);
        setUserId(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Invalid credentials");
    }
    const userData = await response.json();
    queryClient.clear();
    setUser(userData);
    setUserId(userData.id.toString());
    setIsLoggedIn(true);
    localStorage.setItem("roadsos_userId", userData.id.toString());
    localStorage.setItem("roadsos_isLoggedIn", "true");
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Registration failed");
    }
    const userData = await response.json();
    queryClient.clear();
    setUser(userData);
    setUserId(userData.id.toString());
    setIsLoggedIn(true);
    localStorage.setItem("roadsos_userId", userData.id.toString());
    localStorage.setItem("roadsos_isLoggedIn", "true");
    return userData;
  };

  const logout = async () => {
    queryClient.clear();
    setUserId(null);
    setUser(null);
    setIsLoggedIn(false);
    setActiveSos(false);
    localStorage.removeItem("roadsos_userId");
    localStorage.removeItem("roadsos_isLoggedIn");
    localStorage.removeItem("roadsos_activeSos");
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout API call failed:", err);
    }
  };

  const handleSetActiveSos = (active) => {
    setActiveSos(active);
    localStorage.setItem("roadsos_activeSos", String(active));
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        isLoggedIn,
        activeSos,
        login,
        logout,
        register,
        setActiveSos: handleSetActiveSos,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
