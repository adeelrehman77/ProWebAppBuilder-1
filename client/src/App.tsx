import { Switch, Route, useLocation } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import AuthPage from "@/pages/AuthPage";
import WelcomePage from "@/pages/WelcomePage";
import DashboardPage from "@/pages/DashboardPage";
import RoutesPage from "@/pages/RoutesPage";
import ZonesPage from "@/pages/ZonesPage";
import OrdersPage from "@/pages/OrdersPage";
import ProductsPage from "@/pages/ProductsPage";
import CategoriesPage from "@/pages/CategoriesPage";
import CustomerPage from "@/pages/CustomerPage";
import PaymentsPage from "@/pages/PaymentsPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import DriversPage from "./pages/DriversPage";
import DeliveriesPage from "./pages/DeliveriesPage";

function App() {
  const { user, isLoading } = useUser();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Show welcome page if not logged in and not on auth page
  if (!user && location !== "/auth") {
    return <WelcomePage />;
  }

  // Show auth page if trying to access it
  if (!user && location === "/auth") {
    return <AuthPage />;
  }

  // Show authenticated routes if user is logged in
  if (user) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/routes" component={RoutesPage} />
            <Route path="/zones" component={ZonesPage} />
            <Route path="/orders" component={OrdersPage} />
            <Route path="/products" component={ProductsPage} />
            <Route path="/categories" component={CategoriesPage} />
            <Route path="/customers" component={CustomerPage} />
            <Route path="/drivers" component={DriversPage} />
            <Route path="/deliveries" component={DeliveriesPage} />
            <Route path="/payments" component={PaymentsPage} />
            <Route path="/reports" component={ReportsPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route>404 Page Not Found</Route>
          </Switch>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
