import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";

export default function ReportsPage() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    }
  });

  const [selectedMealType, setSelectedMealType] = useState<string>("all");

  const upcomingDeliveries = orders?.filter((order: any) => {
    const deliveryDate = new Date(order.deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const matchesMealType = selectedMealType === "all" || 
                           order.mealType?.toLowerCase() === selectedMealType;
    
    return deliveryDate >= today && matchesMealType;
  }) || [];

  return (
    <>
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Reports</h1>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Data
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sales This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">AED {stats?.monthlySales || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.salesGrowth || 0}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.subscriptionGrowth || 0}% growth rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Customer Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.retentionRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Based on renewal rate
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topProducts?.map((product: any) => (
                  <div key={product.id} className="flex justify-between items-center">
                    <span>{product.name}</span>
                    <span className="font-semibold">{product.orders} orders</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <Label htmlFor="meal-type">Meal Type:</Label>
                  <select
                    id="meal-type"
                    value={selectedMealType}
                    onChange={(e) => setSelectedMealType(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">All Meals</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
                <div className="space-y-2">
                  {upcomingDeliveries.map((order: any) => (
                    <div key={order.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <span className="font-medium">{order.customerName}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({order.mealType})
                        </span>
                      </div>
                      <div className="text-sm">
                        {new Date(order.deliveryDate).toLocaleDateString()} [{order.deliverySlot}]
                      </div>
                    </div>
                  ))}
                  {upcomingDeliveries.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No upcoming deliveries found
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.categoryRevenue?.map((category: any) => (
                  <div key={category.id} className="flex justify-between items-center">
                    <span>{category.name}</span>
                    <span className="font-semibold">AED {category.revenue}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
