import { Switch, Route, Link } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import DriversPage from "@/pages/DriversPage";
import RoutesPage from "@/pages/RoutesPage";
import AuthPage from "@/pages/AuthPage";

function DeliveryDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Delivery Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Drivers</h2>
          <p className="text-gray-600 mb-4">Manage delivery drivers and their assignments</p>
          <Link href="/deliveries/drivers" className="text-primary hover:underline">
            View Drivers →
          </Link>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Routes</h2>
          <p className="text-gray-600 mb-4">Configure and optimize delivery routes</p>
          <Link href="/deliveries/routes" className="text-primary hover:underline">
            View Routes →
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="flex min-h-screen">
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route>
          <div className="flex w-full">
            <Sidebar />
            <main className="flex-1">
              <Switch>
                <Route path="/deliveries/drivers" component={DriversPage} />
                <Route path="/deliveries/routes" component={RoutesPage} />
                <Route path="/deliveries" component={DeliveryDashboard} />
                <Route path="/">
                  <DeliveryDashboard />
                </Route>
                <Route>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
                    <p className="mt-4">
                      <Link href="/" className="text-primary hover:underline">
                        Return to Dashboard
                      </Link>
                    </p>
                  </div>
                </Route>
              </Switch>
            </main>
          </div>
        </Route>
      </Switch>
    </div>
  );
}

export default App;
