import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, Calendar, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
}

interface Delivery {
  id: number;
  date: string;
  slot: string;
  status: string;
}

interface Order {
  id: number;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  deliveries: Delivery[];
}

interface Stats {
  monthlySales: number;
  salesGrowth: number;
  activeSubscriptions: number;
  subscriptionGrowth: number;
  retentionRate: number;
  topProducts: Array<{
    id: number;
    name: string;
    orders: number;
  }>;
  categoryRevenue: Array<{
    id: number;
    name: string;
    revenue: number;
  }>;
}

interface FilterState {
  date: string;
  deliveryTime: string;
  route: string;
  showDeliveries: boolean;
  splitRouteWise: boolean;
  expectedOnly: boolean;
}

export default function ReportsPage() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    }
  });

  const [filters, setFilters] = useState<FilterState>({
    date: new Date().toISOString().split('T')[0],
    deliveryTime: "lunch",
    route: "Fun Adventure Route, Deira, Karama",
    showDeliveries: true,
    splitRouteWise: false,
    expectedOnly: true
  });

  const upcomingDeliveries = orders?.filter((order: Order) => 
    order.deliveries?.some((delivery: Delivery) => {
      try {
        const deliveryDate = new Date(delivery.date);
        const filterDate = new Date(filters.date);
        
        // Compare dates using timestamp comparison
        const sameDate = 
          deliveryDate.getFullYear() === filterDate.getFullYear() &&
          deliveryDate.getMonth() === filterDate.getMonth() &&
          deliveryDate.getDate() === filterDate.getDate();
        
        const matchesTime = 
          filters.deliveryTime === "all" || 
          delivery.slot.toLowerCase() === filters.deliveryTime;
        
        return sameDate && matchesTime;
      } catch (e) {
        console.error('Invalid date:', delivery.date);
        return false;
      }
    })
  ) || [];

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting delivery sheet...");
  };

  return (
    <div className="p-8">
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
            <CardTitle>Delivery Sheet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery-date">Delivery Date</Label>
                  <div className="relative">
                    <Input
                      id="delivery-date"
                      type="date"
                      value={filters.date}
                      onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery-time">Delivery Time</Label>
                  <Select
                    value={filters.deliveryTime}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, deliveryTime: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-deliveries"
                      checked={filters.showDeliveries}
                      onCheckedChange={(checked) => 
                        setFilters(prev => ({ ...prev, showDeliveries: checked as boolean }))
                      }
                    />
                    <Label htmlFor="show-deliveries">Deliveries</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="split-route"
                      checked={filters.splitRouteWise}
                      onCheckedChange={(checked) => 
                        setFilters(prev => ({ ...prev, splitRouteWise: checked as boolean }))
                      }
                    />
                    <Label htmlFor="split-route">Split Route Wise</Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExport}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {upcomingDeliveries.map((order: Order) => (
                  <div key={order.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">Order #{order.id}</div>
                      {order.deliveries?.filter((delivery: Delivery) => {
                        const deliveryDate = new Date(delivery.date);
                        const filterDate = new Date(filters.date);
                        return deliveryDate.toDateString() === filterDate.toDateString() &&
                               delivery.slot.toLowerCase() === filters.deliveryTime;
                      }).map((delivery: Delivery) => (
                        <div key={delivery.id} className="text-sm text-muted-foreground">
                          [{delivery.slot}] - {delivery.status}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm">
                      {order.items?.reduce((total: number, item: OrderItem) => total + item.quantity, 0)} Units
                    </div>
                  </div>
                ))}
                {upcomingDeliveries.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    No deliveries found for selected criteria
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
              {stats?.categoryRevenue?.map((category) => (
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
  );
}
