import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import Dashboard from "@/pages/dashboard";
import PlatformsPage from "@/pages/platforms";
import AIAnalysisPage from "@/pages/ai-analysis";
import ContentReviewPage from "@/pages/content-review";
import LiveMonitoringPage from "@/pages/live-monitoring";
import AnalyticsPage from "@/pages/analytics";
import SettingsPage from "@/pages/settings";
import UsersPage from "@/pages/users";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex min-h-screen cyber-bg">
      <Navigation />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/platforms" component={PlatformsPage} />
          <Route path="/ai-analysis" component={AIAnalysisPage} />
          <Route path="/content-review" component={ContentReviewPage} />
          <Route path="/live-monitoring" component={LiveMonitoringPage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route path="/users" component={UsersPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
