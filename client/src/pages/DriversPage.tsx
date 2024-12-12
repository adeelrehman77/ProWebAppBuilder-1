import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Truck, MapPin } from "lucide-react";
import type { Driver } from "@db/schema";

export default function DriversPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newDriver, setNewDriver] = useState<Partial<Driver>>({
    name: "",
    phone: "",
    email: "",
    licenseNumber: "",
    vehicleNumber: "",
    vehicleType: "bike",
    maxCapacity: 20,
    status: "available"
  });

  const { data: drivers = [], isLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
    queryFn: async () => {
      const response = await fetch('/api/drivers');
      if (!response.ok) throw new Error('Failed to fetch drivers');
      return response.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (driver: Partial<Driver>) => {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(driver),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      setOpen(false);
      setNewDriver({
        name: "",
        phone: "",
        email: "",
        licenseNumber: "",
        vehicleNumber: "",
        vehicleType: "bike",
        maxCapacity: 20,
        status: "available"
      });
      toast({ title: "Driver created successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error creating driver",
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...driver }: Partial<Driver> & { id: number }) => {
      const res = await fetch(`/api/drivers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(driver),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      toast({ title: "Driver updated successfully" });
    },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Drivers</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newDriver.name}
                  onChange={(e) =>
                    setNewDriver((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Driver's full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={newDriver.phone}
                    onChange={(e) =>
                      setNewDriver((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="Contact number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={newDriver.email || ''}
                    onChange={(e) =>
                      setNewDriver((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Email address"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">License Number</label>
                  <Input
                    value={newDriver.licenseNumber}
                    onChange={(e) =>
                      setNewDriver((prev) => ({ ...prev, licenseNumber: e.target.value }))
                    }
                    placeholder="License number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Number</label>
                  <Input
                    value={newDriver.vehicleNumber}
                    onChange={(e) =>
                      setNewDriver((prev) => ({ ...prev, vehicleNumber: e.target.value }))
                    }
                    placeholder="Vehicle number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Type</label>
                  <Select
                    value={newDriver.vehicleType}
                    onValueChange={(value) =>
                      setNewDriver((prev) => ({ ...prev, vehicleType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bike">Bike</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Capacity</label>
                  <Input
                    type="number"
                    value={newDriver.maxCapacity}
                    onChange={(e) =>
                      setNewDriver((prev) => ({ ...prev, maxCapacity: parseInt(e.target.value) || 20 }))
                    }
                    placeholder="Maximum delivery capacity"
                  />
                </div>
              </div>
              <Button
                onClick={() => createMutation.mutate(newDriver)}
                disabled={
                  createMutation.isPending ||
                  !newDriver.name ||
                  !newDriver.phone ||
                  !newDriver.licenseNumber ||
                  !newDriver.vehicleNumber
                }
              >
                Add Driver
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading && drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell>
                  <div className="font-medium">{driver.name}</div>
                  <div className="text-sm text-muted-foreground">
                    License: {driver.licenseNumber}
                  </div>
                </TableCell>
                <TableCell>
                  <div>{driver.phone}</div>
                  {driver.email && (
                    <div className="text-sm text-muted-foreground">{driver.email}</div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Truck className="mr-2 h-4 w-4" />
                    <div>
                      <div className="font-medium capitalize">{driver.vehicleType}</div>
                      <div className="text-sm text-muted-foreground">
                        {driver.vehicleNumber}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={driver.status}
                    onValueChange={(value) =>
                      updateMutation.mutate({
                        id: driver.id,
                        status: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="on_delivery">On Delivery</SelectItem>
                      <SelectItem value="off_duty">Off Duty</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span className="text-sm">
                      {driver.currentLocation || "Not available"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // TODO: View driver details and delivery history
                    }}
                  >
                    View Details
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
