import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import OrdersPage from "./pages/OrdersPage";
import CustomerPage from "./pages/CustomerPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import PaymentsPage from "./pages/PaymentsPage";
import { Loader2 } from "lucide-react";
import { useUser } from "./hooks/use-user";

function Router() {
  const { user, isLoading } = useUser();

  // Public routes first
  return (
    <div className="flex min-h-screen">
      <Switch>
        <Route path="/customers" component={CustomerPage} />
        {isLoading ? (
          <Route>
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          </Route>
        ) : !user ? (
          <Route component={AuthPage} />
        ) : (
          <>
            <Route path="/" component={DashboardPage} />
            <Route path="/orders" component={OrdersPage} />
            <Route path="/products" component={ProductsPage} />
            <Route path="/categories" component={CategoriesPage} />
            <Route path="/reports" component={ReportsPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/payments" component={PaymentsPage} />
            <Route>404 Page Not Found</Route>
          </>
        )}
      </Switch>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>
);
