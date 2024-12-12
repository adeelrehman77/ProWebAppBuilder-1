import { Switch, Route } from "wouter";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Sidebar } from "@/components/Sidebar";

// Page imports
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import CategoriesPage from "@/pages/CategoriesPage";
import OrdersPage from "@/pages/OrdersPage";
import CustomerPage from "@/pages/CustomerPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import PaymentsPage from "@/pages/PaymentsPage";
import RoutesPage from "@/pages/RoutesPage";
import DriversPage from "@/pages/DriversPage";
import DeliveriesPage from "@/pages/DeliveriesPage";

export function Router() {
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
      <main className="flex-1">
        <Switch>
          {/* Delivery management routes */}
          <Route path="/deliveries/routes" component={RoutesPage} />
          <Route path="/deliveries/drivers" component={DriversPage} />
          <Route path="/deliveries" component={DeliveriesPage} />
          
          {/* Core business routes */}
          <Route path="/customers" component={CustomerPage} />
          <Route path="/orders" component={OrdersPage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/categories" component={CategoriesPage} />
          
          {/* Management routes */}
          <Route path="/reports" component={ReportsPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/payments" component={PaymentsPage} />
          
          {/* Home route */}
          <Route path="/" component={DashboardPage} />
          
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
