import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";

// Placeholder imports for pages
import Splash from "@/pages/Splash";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Setup from "@/pages/Setup";
import Dashboard from "@/pages/Dashboard";
import EmergencyActive from "@/pages/EmergencyActive";
import GoldenHour from "@/pages/GoldenHour";
import CrashDetection from "@/pages/CrashDetection";
import SeverityAnalyzer from "@/pages/SeverityAnalyzer";
import MapPage from "@/pages/Map";
import MedicalId from "@/pages/MedicalId";
import AiChat from "@/pages/AiChat";
import Incidents from "@/pages/Incidents";
import Profile from "@/pages/Profile";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      
      <Route path="/setup">
        <ProtectedRoute>
          <Setup />
        </ProtectedRoute>
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/emergency-active">
        <ProtectedRoute>
          <EmergencyActive />
        </ProtectedRoute>
      </Route>

      <Route path="/golden-hour">
        <ProtectedRoute>
          <Layout><GoldenHour /></Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/crash-detection">
        <ProtectedRoute>
          <Layout><CrashDetection /></Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/severity-analyzer">
        <ProtectedRoute>
          <Layout><SeverityAnalyzer /></Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/map">
        <ProtectedRoute>
          <Layout><MapPage /></Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/medical-id">
        <ProtectedRoute>
          <Layout><MedicalId /></Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/ai-chat">
        <ProtectedRoute>
          <Layout><AiChat /></Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/incidents">
        <ProtectedRoute>
          <Layout><Incidents /></Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/profile">
        <ProtectedRoute>
          <Layout><Profile /></Layout>
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
