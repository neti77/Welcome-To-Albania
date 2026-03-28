import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CityDetails from "@/pages/CityDetails";
import HubPage from "@/pages/HubPage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import AuthPage from "@/pages/AuthPage";
import AdminNewsletterPage from "@/pages/AdminNewsletterPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import LegalPage from "@/pages/LegalPage";
import AboutPage from "@/pages/AboutPage";
import ThashethemeSquarePage from "@/pages/ThashethemeSquarePage";
import VisitorsGuidePage from "@/pages/VisitorsGuidePage";
import ProfilePage from "@/pages/ProfilePage";

function Router() {
  const AuthRoute = () => <AuthPage />;
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/city/:id" component={CityDetails} />
      <Route path="/thashetheme-square" component={ThashethemeSquarePage} />
      <Route path="/visitors-guide" component={VisitorsGuidePage} />
      <Route path="/for-albanians" component={ThashethemeSquarePage} />
      <Route path="/for-visitors" component={VisitorsGuidePage} />
      <Route path="/plan-your-trip" component={HubPage} />
      <Route path="/auth" component={AuthRoute} />
      <Route path="/sign-in" component={SignInPage} />
      <Route path="/sign-up" component={SignUpPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/newsletter" component={AdminNewsletterPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/legal" component={LegalPage} />
      <Route path="/about" component={AboutPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
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
