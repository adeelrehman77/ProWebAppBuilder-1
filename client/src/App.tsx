import { Link } from "wouter";

function App() {
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

export default App;
