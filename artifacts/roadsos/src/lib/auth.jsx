import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSos, setActiveSos] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("roadsos_userId");
    const storedIsLoggedIn =
      localStorage.getItem("roadsos_isLoggedIn") === "true";
    const storedActiveSos =
      localStorage.getItem("roadsos_activeSos") === "true";
    if (storedIsLoggedIn && storedUserId) {
      setUserId(storedUserId);
      setIsLoggedIn(true);
      setActiveSos(storedActiveSos);
    }
    setIsLoading(false);
  }, []);

  const login = (id = "demo-user") => {
    setUserId(id);
    setIsLoggedIn(true);
    localStorage.setItem("roadsos_userId", id);
    localStorage.setItem("roadsos_isLoggedIn", "true");
  };

  const logout = () => {
    setUserId(null);
    setIsLoggedIn(false);
    setActiveSos(false);
    localStorage.removeItem("roadsos_userId");
    localStorage.removeItem("roadsos_isLoggedIn");
    localStorage.removeItem("roadsos_activeSos");
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
        userId,
        isLoggedIn,
        activeSos,
        login,
        logout,
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
