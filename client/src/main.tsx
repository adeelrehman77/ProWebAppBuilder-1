import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
// Component imports
import Sidebar from "@/components/Sidebar";
import { Loader2 } from "lucide-react";
import { useUser } from "./hooks/use-user";

// Page imports
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import OrdersPage from "./pages/OrdersPage";
import CustomerPage from "./pages/CustomerPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import PaymentsPage from "./pages/PaymentsPage";
import RoutesPage from "./pages/RoutesPage";
import DriversPage from "./pages/DriversPage";
import DeliveriesPage from "./pages/DeliveriesPage";

function Router() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-h-screen">
        <Switch>
          {/* Specific routes first */}
          <Route path="/deliveries/routes">
            <RoutesPage />
          </Route>
          <Route path="/deliveries/drivers">
            <DriversPage />
          </Route>
          <Route path="/deliveries">
            <DeliveriesPage />
          </Route>
          <Route path="/customers">
            <CustomerPage />
          </Route>
          <Route path="/orders">
            <OrdersPage />
          </Route>
          <Route path="/products">
            <ProductsPage />
          </Route>
          <Route path="/categories">
            <CategoriesPage />
          </Route>
          <Route path="/reports">
            <ReportsPage />
          </Route>
          <Route path="/settings">
            <SettingsPage />
          </Route>
          <Route path="/payments">
            <PaymentsPage />
          </Route>
          {/* Home route */}
          <Route path="/">
            <DashboardPage />
          </Route>
          {/* 404 catch-all route */}
          <Route>
            <div className="p-8">
              <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
              <p className="mt-4">The page you're looking for doesn't exist.</p>
            </div>
          </Route>
        </Switch>
      </main>
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
