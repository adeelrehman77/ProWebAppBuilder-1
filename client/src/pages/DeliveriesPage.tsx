import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Truck, Map } from "lucide-react";

export default function DeliveriesPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Management</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-4">Drivers</h2>
              <p className="text-gray-600 mb-4">Manage delivery drivers and their assignments</p>
              <Link href="/deliveries/drivers" className="text-primary hover:underline inline-flex items-center">
                View Drivers <Truck className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-4">Routes</h2>
              <p className="text-gray-600 mb-4">Configure and optimize delivery routes</p>
              <Link href="/deliveries/routes" className="text-primary hover:underline inline-flex items-center">
                View Routes <Map className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
