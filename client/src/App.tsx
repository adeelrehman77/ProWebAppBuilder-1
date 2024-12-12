import { Switch, Route } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import DriversPage from "@/pages/DriversPage";
import RoutesPage from "@/pages/RoutesPage";
import AuthPage from "@/pages/AuthPage";

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
                <Route path="/deliveries">
                  <div className="p-8">
                    <h1 className="text-2xl font-bold mb-6">Delivery Management</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 border rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Drivers</h2>
                        <p className="text-gray-600 mb-4">Manage delivery drivers and their assignments</p>
                        <a href="/deliveries/drivers" className="text-primary hover:underline">View Drivers →</a>
                      </div>
                      <div className="p-6 border rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Routes</h2>
                        <p className="text-gray-600 mb-4">Configure and optimize delivery routes</p>
                        <a href="/deliveries/routes" className="text-primary hover:underline">View Routes →</a>
                      </div>
                    </div>
                  </div>
                </Route>
                <Route>404 Page Not Found</Route>
              </Switch>
            </main>
          </div>
        </Route>
      </Switch>
    </div>
  );
}

export default App;
