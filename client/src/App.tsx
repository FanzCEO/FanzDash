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
import RiskManagementPage from "@/pages/risk-management";
import CrisisManagementPage from "@/pages/crisis-management";
import AdvancedAnalyticsPage from "@/pages/advanced-analytics";
import PredictiveAnalyticsPage from "@/pages/predictive-analytics";
import ComplianceReportingPage from "@/pages/compliance-reporting";
import VaultPage from "@/pages/vault";
import AuditPage from "@/pages/audit";
import ThreatsPage from "@/pages/threats";
import DataPage from "@/pages/data";
import LandingHub from "@/pages/landing-hub";
import Verification2257 from "@/pages/verification-2257";
import ChatSystem from "@/pages/chat-system";
import StreamManagement from "@/pages/stream-management";
import PaymentManagement from "@/pages/payment-management";
import PaymentProcessorManagement from "@/pages/payment-processor-management";
import TaxManagement from "@/pages/tax-management";
import AdvertisingManagement from "@/pages/advertising-management";
import AudioCallSettings from "@/pages/audio-call-settings";
import BlogManagement from "@/pages/blog-management";
import BlogCreate from "@/pages/blog-create";
import BlogEdit from "@/pages/blog-edit";
import DepositsManagement from "@/pages/deposits-management";
import DepositView from "@/pages/deposit-view";
import LocationManagement from "@/pages/location-management";
import CronManagement from "@/pages/cron-management";
import ShopManagement from "@/pages/shop-management";
import StoriesManagement from "@/pages/stories-management";
import SocialLoginSettings from "@/pages/social-login-settings";
import StorageSettings from "@/pages/storage-settings";
import TaxRateManagement from "@/pages/tax-rate-management";
import ThemeSettings from "@/pages/theme-settings";
import WithdrawalManagement from "@/pages/withdrawal-management";
import WithdrawalView from "@/pages/withdrawal-view";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex min-h-screen cyber-bg">
      <Navigation />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={LandingHub} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/platforms" component={PlatformsPage} />
          <Route path="/ai-analysis" component={AIAnalysisPage} />
          <Route path="/content-review" component={ContentReviewPage} />
          <Route path="/live-monitoring" component={LiveMonitoringPage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route path="/users" component={UsersPage} />
          <Route path="/risk-management" component={RiskManagementPage} />
          <Route path="/crisis-management" component={CrisisManagementPage} />
          <Route path="/advanced-analytics" component={AdvancedAnalyticsPage} />
          <Route path="/predictive-analytics" component={PredictiveAnalyticsPage} />
          <Route path="/compliance-reporting" component={ComplianceReportingPage} />
          <Route path="/vault" component={VaultPage} />
          <Route path="/audit" component={AuditPage} />
          <Route path="/threats" component={ThreatsPage} />
          <Route path="/data" component={DataPage} />
          <Route path="/verification-2257" component={Verification2257} />
          <Route path="/chat-system" component={ChatSystem} />
          <Route path="/stream-management" component={StreamManagement} />
          <Route path="/payment-management" component={PaymentManagement} />
          <Route path="/payment-processors" component={PaymentProcessorManagement} />
          <Route path="/tax-management" component={TaxManagement} />
          <Route path="/advertising" component={AdvertisingManagement} />
          <Route path="/audio-calls" component={AudioCallSettings} />
          <Route path="/blog" component={BlogManagement} />
          <Route path="/blog/create" component={BlogCreate} />
          <Route path="/blog/edit/:id" component={BlogEdit} />
          <Route path="/deposits" component={DepositsManagement} />
          <Route path="/deposits/:id" component={DepositView} />
          <Route path="/locations" component={LocationManagement} />
          <Route path="/cron-jobs" component={CronManagement} />
          <Route path="/shop-management" component={ShopManagement} />
          <Route path="/stories-management" component={StoriesManagement} />
          <Route path="/social-login-settings" component={SocialLoginSettings} />
          <Route path="/storage-settings" component={StorageSettings} />
          <Route path="/tax-rate-management" component={TaxRateManagement} />
          <Route path="/theme-settings" component={ThemeSettings} />
          <Route path="/withdrawal-management" component={WithdrawalManagement} />
          <Route path="/withdrawal-view/:id" component={WithdrawalView} />
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
