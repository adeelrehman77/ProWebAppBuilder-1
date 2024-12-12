import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const { data: deliveries } = useQuery<any[]>({
    queryKey: ["/api/deliveries"],
  });

  const { data: subscriptions } = useQuery<any[]>({
    queryKey: ["/api/subscriptions"],
    queryFn: async () => {
      const response = await fetch('/api/subscriptions');
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      return response.json();
    }
  });

  const futureDeliveries = deliveries?.filter(d => new Date(d.date) >= new Date());
  const activeSubscriptions = subscriptions?.filter(s => s.status === 'approved');

  return (
    <div className="p-8">
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
              <CardTitle>Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeSubscriptions?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total number of active subscription plans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Future Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lunch</span>
                  <span className="text-2xl font-bold">
                    {futureDeliveries?.filter(d => d.slot?.toLowerCase() === 'lunch').length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Dinner</span>
                  <span className="text-2xl font-bold">
                    {futureDeliveries?.filter(d => d.slot?.toLowerCase() === 'dinner').length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
