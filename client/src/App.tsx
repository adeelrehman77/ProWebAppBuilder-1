import { Switch, Route } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import DriversPage from "@/pages/DriversPage";
import RoutesPage from "@/pages/RoutesPage";

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <Switch>
          <Route path="/deliveries/drivers" component={DriversPage} />
          <Route path="/deliveries/routes" component={RoutesPage} />
          <Route>404 Page Not Found</Route>
        </Switch>
      </main>
    </div>
  );
}

export default App;
