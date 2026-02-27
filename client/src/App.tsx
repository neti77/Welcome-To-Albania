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
import AdminNewsletterPage from "@/pages/AdminNewsletterPage";
import AdminLoginPage from "@/pages/AdminLoginPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/city/:id" component={CityDetails} />
      <Route path="/for-albanians" component={HubPage} />
      <Route path="/for-visitors" component={HubPage} />
      <Route path="/whats-new" component={HubPage} />
      <Route path="/plan-your-trip" component={HubPage} />
      <Route path="/sign-in" component={SignInPage} />
      <Route path="/sign-up" component={SignUpPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/newsletter" component={AdminNewsletterPage} />
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
