import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Truck, Clock, AlertCircle } from "lucide-react";

export default function DeliveriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deliveries = [] } = useQuery({
    queryKey: ["/api/deliveries"],
    queryFn: async () => {
      const response = await fetch('/api/deliveries');
      if (!response.ok) throw new Error('Failed to fetch deliveries');
      return response.json();
    }
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["/api/drivers"],
    queryFn: async () => {
      const response = await fetch('/api/drivers');
      if (!response.ok) throw new Error('Failed to fetch drivers');
      return response.json();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }) => {
      const res = await fetch(`/api/deliveries/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
      toast({ title: "Delivery status updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: error.message,
      });
    },
  });

  const assignDriverMutation = useMutation({
    mutationFn: async ({ id, driverId }) => {
      const res = await fetch(`/api/deliveries/${id}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
      toast({ title: "Driver assigned successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to assign driver",
        description: error.message,
      });
    },
  });

  const getStatusColor = (status: string) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Assigned: "bg-blue-100 text-blue-800",
      PickedUp: "bg-indigo-100 text-indigo-800",
      InTransit: "bg-purple-100 text-purple-800",
      NearDestination: "bg-pink-100 text-pink-800",
      Delivered: "bg-green-100 text-green-800",
      Failed: "bg-red-100 text-red-800",
      Cancelled: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Group deliveries by status
  const deliveryGroups = deliveries.reduce((acc, delivery) => {
    const status = delivery.status || "Pending";
    if (!acc[status]) acc[status] = [];
    acc[status].push(delivery);
    return acc;
  }, {});

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Delivery Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deliveryGroups["Pending"]?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Active Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(deliveryGroups["InTransit"]?.length || 0) +
                (deliveryGroups["PickedUp"]?.length || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Delayed Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {deliveryGroups["Failed"]?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Delivery Time</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.map((delivery) => (
            <TableRow key={delivery.id}>
              <TableCell>#{delivery.orderId}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(delivery.status)}>
                  {delivery.status}
                </Badge>
              </TableCell>
              <TableCell>
                {delivery.driver ? (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    {delivery.driver.name}
                  </div>
                ) : (
                  <Select
                    value={delivery.driverId?.toString()}
                    onValueChange={(value) =>
                      assignDriverMutation.mutate({
                        id: delivery.id,
                        driverId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign Driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers
                        .filter((d) => d.status === "available")
                        .map((driver) => (
                          <SelectItem
                            key={driver.id}
                            value={driver.id.toString()}
                          >
                            {driver.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
              <TableCell>
                {delivery.route ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {delivery.route.name}
                  </div>
                ) : (
                  "Not assigned"
                )}
              </TableCell>
              <TableCell>
                {new Date(delivery.date).toLocaleString()} [{delivery.slot}]
              </TableCell>
              <TableCell>
                <Select
                  value={delivery.status}
                  onValueChange={(value) =>
                    updateStatusMutation.mutate({
                      id: delivery.id,
                      status: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="PickedUp">Picked Up</SelectItem>
                    <SelectItem value="InTransit">In Transit</SelectItem>
                    <SelectItem value="NearDestination">Near Destination</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
