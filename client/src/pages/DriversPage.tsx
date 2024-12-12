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
import { Plus, Edit2, MapPin, PhoneCall } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDriverSchema } from "@db/schema";
import type { Driver } from "@db/schema";

type DriverFormData = {
  name: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  vehicleNumber: string;
  vehicleType: string;
  maxCapacity: number;
};

export default function DriversPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<DriverFormData>({
    resolver: zodResolver(insertDriverSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      licenseNumber: "",
      vehicleNumber: "",
      vehicleType: "",
      maxCapacity: 50,
    },
  });

  const { data: drivers, isLoading } = useQuery({
    queryKey: ['/api/drivers'],
    queryFn: async () => {
      const response = await fetch('/api/drivers');
      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }
      return response.json() as Promise<Driver[]>;
    }
  });

  const addDriverMutation = useMutation({
    mutationFn: async (data: DriverFormData) => {
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to add driver');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Driver added successfully",
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

  const updateDriverMutation = useMutation({
    mutationFn: async ({ id, ...data }: DriverFormData & { id: number }) => {
      const response = await fetch(`/api/drivers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update driver');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      setIsAddDialogOpen(false);
      setEditingDriver(null);
      form.reset();
      toast({
        title: "Success",
        description: "Driver updated successfully",
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

  const onSubmit = (data: DriverFormData) => {
    if (editingDriver) {
      updateDriverMutation.mutate({ ...data, id: editingDriver.id });
    } else {
      addDriverMutation.mutate(data);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setEditingDriver(null);
      form.reset();
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    form.reset({
      name: driver.name,
      phone: driver.phone,
      email: driver.email || "",
      licenseNumber: driver.licenseNumber,
      vehicleNumber: driver.vehicleNumber,
      vehicleType: driver.vehicleType,
      maxCapacity: driver.maxCapacity,
    });
    setIsAddDialogOpen(true);
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Drivers</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
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
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input {...form.register("phone")} type="tel" />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input {...form.register("email")} type="email" />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">License Number</label>
                <Input {...form.register("licenseNumber")} />
                {form.formState.errors.licenseNumber && (
                  <p className="text-sm text-red-500">{form.formState.errors.licenseNumber.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle Number</label>
                <Input {...form.register("vehicleNumber")} />
                {form.formState.errors.vehicleNumber && (
                  <p className="text-sm text-red-500">{form.formState.errors.vehicleNumber.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle Type</label>
                <Input {...form.register("vehicleType")} />
                {form.formState.errors.vehicleType && (
                  <p className="text-sm text-red-500">{form.formState.errors.vehicleType.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Capacity</label>
                <Input
                  type="number"
                  {...form.register("maxCapacity", { valueAsNumber: true })}
                  min="1"
                />
                {form.formState.errors.maxCapacity && (
                  <p className="text-sm text-red-500">{form.formState.errors.maxCapacity.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={addDriverMutation.isPending || updateDriverMutation.isPending}
                >
                  {editingDriver
                    ? updateDriverMutation.isPending
                      ? 'Updating...'
                      : 'Update Driver'
                    : addDriverMutation.isPending
                    ? 'Adding...'
                    : 'Add Driver'
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
              <TableHead>Phone</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers?.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell>{driver.name}</TableCell>
                <TableCell>{driver.phone}</TableCell>
                <TableCell>
                  {driver.vehicleType} - {driver.vehicleNumber}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    driver.status === 'available' 
                      ? 'bg-green-100 text-green-800'
                      : driver.status === 'on_delivery'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {driver.status}
                  </span>
                </TableCell>
                <TableCell>{driver.currentLocation || 'Not available'}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(driver)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      window.open(`tel:${driver.phone}`);
                    }}
                  >
                    <PhoneCall className="w-4 h-4" />
                  </Button>
                  {driver.currentLocation && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            driver.currentLocation || ""
                          )}`,
                          '_blank'
                        );
                      }}
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
