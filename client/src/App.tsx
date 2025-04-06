import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import Dashboard from "@/pages/dashboard";
import Loans from "@/pages/loans";
import Community from "@/pages/community";
import Learn from "@/pages/learn";
import AuthPage from "@/pages/auth-page";
import Profile from "@/pages/profile";
import LoanRequest from "@/pages/loan-request";
import Header from "@/components/header";
import Footer from "@/components/footer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow">
        <Switch>
          <ProtectedRoute path="/" component={Dashboard} />
          <ProtectedRoute path="/loans" component={Loans} />
          <ProtectedRoute path="/community" component={Community} />
          <ProtectedRoute path="/learn" component={Learn} />
          <ProtectedRoute path="/profile" component={Profile} />
          <ProtectedRoute path="/loan-request" component={LoanRequest} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
