import { Switch, Route } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import RoutesPage from "@/pages/RoutesPage";
import ZonesPage from "@/pages/ZonesPage";
import DashboardPage from "@/pages/DashboardPage";
import OrdersPage from "@/pages/OrdersPage";
import ProductsPage from "@/pages/ProductsPage";
import CategoriesPage from "@/pages/CategoriesPage";
import CustomerPage from "@/pages/CustomerPage";
import PaymentsPage from "@/pages/PaymentsPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";

function App() {
  return (
    <div className="flex">
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
          <Route path="/payments" component={PaymentsPage} />
          <Route path="/reports" component={ReportsPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route>404 Page Not Found</Route>
        </Switch>
      </div>
    </div>
  );
}

export default App;
