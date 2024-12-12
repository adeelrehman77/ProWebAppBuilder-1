import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Plus, Edit2, MapPin } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Route {
  id: number;
  name: string;
  description: string | null;
  areas: string;
  estimatedTime: number;
  maxDeliveries: number;
  startLocation: string;
  endLocation: string;
}

interface Delivery {
  id: number;
  orderId: number;
  routeId: number | null;
  driverId: number | null;
  date: string;
  slot: string;
  status: string;
  route?: { id: number; name: string } | null;
  driver?: { id: number; name: string } | null;
}

interface Driver {
  id: number;
  name: string;
  status: string;
}

const routeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  areas: z.string().min(1, "Areas are required"),
  estimatedTime: z.number().min(1, "Estimated time is required"),
  maxDeliveries: z.number().min(1, "Max deliveries is required"),
  startLocation: z.string().min(1, "Start location is required"),
  endLocation: z.string().min(1, "End location is required"),
});

type RouteFormData = z.infer<typeof routeFormSchema>;

export default function RoutesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RouteFormData>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      areas: "",
      estimatedTime: 30,
      maxDeliveries: 20,
      startLocation: "",
      endLocation: "",
    },
  });

  const { data: routes, isLoading } = useQuery({
    queryKey: ['/api/routes'],
    queryFn: async () => {
      const response = await fetch('/api/routes');
      if (!response.ok) {
        throw new Error('Failed to fetch routes');
      }
      return response.json() as Promise<Route[]>;
    },
  });

  const { data: deliveries } = useQuery({
    queryKey: ['/api/deliveries'],
    queryFn: async () => {
      const response = await fetch('/api/deliveries');
      if (!response.ok) {
        throw new Error('Failed to fetch deliveries');
      }
      return response.json() as Promise<Delivery[]>;
    },
  });

  const { data: availableDrivers } = useQuery({
    queryKey: ['/api/drivers'],
    queryFn: async () => {
      const response = await fetch('/api/drivers');
      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }
      return (response.json() as Promise<Driver[]>).then(drivers => 
        drivers.filter(d => d.status === 'available')
      );
    },
  });

  const addRouteMutation = useMutation({
    mutationFn: async (data: RouteFormData) => {
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to add route');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Route added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const updateRouteMutation = useMutation({
    mutationFn: async ({ id, ...data }: RouteFormData & { id: number }) => {
      const response = await fetch(`/api/routes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update route');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      setIsAddDialogOpen(false);
      setEditingRoute(null);
      form.reset();
      toast({
        title: "Success",
        description: "Route updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const assignDeliveryMutation = useMutation({
    mutationFn: async ({ deliveryId, routeId, driverId }: { deliveryId: number; routeId: number; driverId: number }) => {
      const response = await fetch(`/api/deliveries/${deliveryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routeId,
          driverId,
          status: 'Assigned',
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to assign delivery');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deliveries'] });
      setIsAssignDialogOpen(false);
      setSelectedDelivery(null);
      toast({
        title: "Success",
        description: "Delivery assigned successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: RouteFormData) => {
    if (editingRoute) {
      updateRouteMutation.mutate({ ...data, id: editingRoute.id });
    } else {
      addRouteMutation.mutate(data);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setEditingRoute(null);
      form.reset();
    }
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    form.reset({
      name: route.name,
      description: route.description || "",
      areas: route.areas,
      estimatedTime: route.estimatedTime,
      maxDeliveries: route.maxDeliveries,
      startLocation: route.startLocation,
      endLocation: route.endLocation,
    });
    setIsAddDialogOpen(true);
  };

  const handleAssignDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setIsAssignDialogOpen(true);
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Routes</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRoute ? 'Edit Route' : 'Add New Route'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input {...form.register("description")} />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Areas Covered</label>
                <Input {...form.register("areas")} placeholder="Comma separated areas" />
                {form.formState.errors.areas && (
                  <p className="text-sm text-red-500">{form.formState.errors.areas.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Time (minutes)</label>
                <Input
                  type="number"
                  {...form.register("estimatedTime", { valueAsNumber: true })}
                  min="1"
                />
                {form.formState.errors.estimatedTime && (
                  <p className="text-sm text-red-500">{form.formState.errors.estimatedTime.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Deliveries</label>
                <Input
                  type="number"
                  {...form.register("maxDeliveries", { valueAsNumber: true })}
                  min="1"
                />
                {form.formState.errors.maxDeliveries && (
                  <p className="text-sm text-red-500">{form.formState.errors.maxDeliveries.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Location</label>
                <Input {...form.register("startLocation")} />
                {form.formState.errors.startLocation && (
                  <p className="text-sm text-red-500">{form.formState.errors.startLocation.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Location</label>
                <Input {...form.register("endLocation")} />
                {form.formState.errors.endLocation && (
                  <p className="text-sm text-red-500">{form.formState.errors.endLocation.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={addRouteMutation.isPending || updateRouteMutation.isPending}
                >
                  {editingRoute
                    ? updateRouteMutation.isPending
                      ? 'Updating...'
                      : 'Update Route'
                    : addRouteMutation.isPending
                    ? 'Adding...'
                    : 'Add Route'
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Assignment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Delivery</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Route</label>
                <Select onValueChange={(value) => {
                  if (selectedDelivery) {
                    assignDeliveryMutation.mutate({
                      deliveryId: selectedDelivery.id,
                      routeId: parseInt(value),
                      driverId: selectedDelivery.driverId || 0,
                    });
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Available Routes</SelectLabel>
                      {routes?.map((route) => (
                        <SelectItem key={route.id} value={route.id.toString()}>
                          {route.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Select Driver</label>
                <Select onValueChange={(value) => {
                  if (selectedDelivery) {
                    assignDeliveryMutation.mutate({
                      deliveryId: selectedDelivery.id,
                      routeId: selectedDelivery.routeId || 0,
                      driverId: parseInt(value),
                    });
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Available Drivers</SelectLabel>
                      {availableDrivers?.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id.toString()}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Areas</TableHead>
                <TableHead>Estimated Time</TableHead>
                <TableHead>Max Deliveries</TableHead>
                <TableHead>Start Location</TableHead>
                <TableHead>End Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes?.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>{route.name}</TableCell>
                  <TableCell>{route.areas}</TableCell>
                  <TableCell>{route.estimatedTime} minutes</TableCell>
                  <TableCell>{route.maxDeliveries}</TableCell>
                  <TableCell>{route.startLocation}</TableCell>
                  <TableCell>{route.endLocation}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(route)}
                      title="Edit Route"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/dir/${encodeURIComponent(
                            route.startLocation
                          )}/${encodeURIComponent(route.endLocation)}`,
                          '_blank'
                        );
                      }}
                      title="View on Map"
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pending Deliveries Section */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Deliveries</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Route</TableHead>
                <TableHead>Assigned Driver</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries?.filter(d => d.status === 'Pending').map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>#{delivery.orderId}</TableCell>
                  <TableCell>{new Date(delivery.date).toLocaleDateString()}</TableCell>
                  <TableCell>{delivery.slot}</TableCell>
                  <TableCell>{delivery.status}</TableCell>
                  <TableCell>{delivery.route?.name || 'Not Assigned'}</TableCell>
                  <TableCell>{delivery.driver?.name || 'Not Assigned'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignDelivery(delivery)}
                    >
                      Assign
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
