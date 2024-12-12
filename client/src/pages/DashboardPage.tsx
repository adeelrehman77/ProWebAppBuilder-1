import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface Delivery {
  id: number;
  date: string;
  slot: string;
  status: string;
}

export default function DashboardPage() {
  const { data: deliveries } = useQuery<Delivery[]>({
    queryKey: ["/api/deliveries"],
    queryFn: async () => {
      const response = await fetch('/api/deliveries');
      if (!response.ok) throw new Error('Failed to fetch deliveries');
      return response.json();
    }
  });

  const pastDeliveries = deliveries?.filter(d => new Date(d.date) < new Date());
  const futureDeliveries = deliveries?.filter(d => new Date(d.date) >= new Date());

  return (
    <div className="flex-1 p-8">
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">301</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Incomplete Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unapproved Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unapproved Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Past Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pastDeliveries?.map((delivery) => (
                <div key={delivery.id} className="text-sm text-muted-foreground">
                  {new Date(delivery.date).toLocaleDateString()} [{delivery.slot}]
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Future Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {futureDeliveries?.map((delivery) => (
                <div key={delivery.id} className="text-sm text-muted-foreground">
                  {new Date(delivery.date).toLocaleDateString()} [{delivery.slot}]
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
