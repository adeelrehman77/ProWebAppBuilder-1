import { Link, Route, Switch } from "wouter";
import { Settings, LogOut } from "lucide-react";

// Lazy load pages
const RoutesPage = () => import("./pages/RoutesPage").then(m => m.default);
const DriversPage = () => import("./pages/DriversPage").then(m => m.default);
const ZonesPage = () => import("./pages/ZonesPage").then(m => m.default);
const HubsPage = () => import("./pages/HubsPage").then(m => m.default);
const BulkUploadPage = () => import("./pages/BulkUploadPage").then(m => m.default);

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-xl font-semibold">Fun Adventure Kitchen</h1>
          <div className="ml-auto flex items-center space-x-4">
            <button className="size-8">
              <span className="sr-only">Settings</span>
              <Settings className="h-5 w-5" />
            </button>
            <button className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
      
      <nav className="border-b bg-muted/40">
        <div className="flex h-14 items-center justify-around">
          <Link href="/routes" className="flex flex-col items-center px-4 py-2 hover:text-primary">
            <span className="text-xs">Routes</span>
          </Link>
          <Link href="/drivers" className="flex flex-col items-center px-4 py-2 hover:text-primary">
            <span className="text-xs">Drivers</span>
          </Link>
          <Link href="/hubs" className="flex flex-col items-center px-4 py-2 hover:text-primary">
            <span className="text-xs">Hubs</span>
          </Link>
          <Link href="/zones" className="flex flex-col items-center px-4 py-2 hover:text-primary">
            <span className="text-xs">Zones</span>
          </Link>
          <Link href="/bulk-upload" className="flex flex-col items-center px-4 py-2 hover:text-primary">
            <span className="text-xs">Bulk Upload</span>
          </Link>
        </div>
      </nav>

      <main className="p-8">
        <Switch>
          <Route path="/routes" component={RoutesPage} />
          <Route path="/drivers" component={DriversPage} />
          <Route path="/hubs" component={HubsPage} />
          <Route path="/zones" component={ZonesPage} />
          <Route path="/bulk-upload" component={BulkUploadPage} />
          <Route>
            <div className="text-center py-8">
              <h2 className="text-2xl font-semibold">Welcome to Fun Adventure Kitchen</h2>
              <p className="text-muted-foreground">Select a section from the navigation above to get started.</p>
            </div>
          </Route>
        </Switch>
      </main>
    </div>
  );
}

export default App;
