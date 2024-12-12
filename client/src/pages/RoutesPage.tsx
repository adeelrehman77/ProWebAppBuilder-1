import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Edit2, MapPin, Trash2 } from "lucide-react";
import type { Route } from "@db/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRouteSchema } from "@db/schema";

type RouteFormData = {
  name: string;
  description: string;
  areas: string;
  estimatedTime: number;
  maxDeliveries: number;
  startLocation: string;
  endLocation: string;
};

export default function RoutesPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<RouteFormData>({
    resolver: zodResolver(insertRouteSchema),
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

  const onSubmit = (data: RouteFormData) => {
    if (editingRoute) {
      updateRouteMutation.mutate({ ...data, id: editingRoute.id });
    } else {
      addRouteMutation.mutate(data);
    }
  };

  // Reset form when dialog closes
  const handleDialogChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setEditingRoute(null);
      form.reset();
    }
  };

  // Set form values when editing
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
      </div>

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
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
