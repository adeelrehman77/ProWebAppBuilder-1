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
import { toast } from "@/hooks/use-toast";
import { Plus, Edit2, MapPin, PhoneCall } from "lucide-react";

export default function DriversPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: drivers, isLoading } = useQuery({
    queryKey: ['/api/drivers'],
    queryFn: async () => {
      const response = await fetch('/api/drivers');
      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }
      return response.json();
    },
  });

  const addDriverMutation = useMutation({
    mutationFn: async (newDriver: any) => {
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDriver),
      });
      if (!response.ok) {
        throw new Error('Failed to add driver');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Driver added successfully",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Drivers</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addDriverMutation.mutate({
                  name: formData.get('name'),
                  phone: formData.get('phone'),
                  email: formData.get('email'),
                  licenseNumber: formData.get('licenseNumber'),
                  vehicleNumber: formData.get('vehicleNumber'),
                  vehicleType: formData.get('vehicleType'),
                  maxCapacity: parseInt(formData.get('maxCapacity') as string),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input name="name" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input name="phone" required type="tel" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input name="email" type="email" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">License Number</label>
                <Input name="licenseNumber" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle Number</label>
                <Input name="vehicleNumber" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle Type</label>
                <Input name="vehicleType" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Capacity</label>
                <Input type="number" name="maxCapacity" required min="1" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addDriverMutation.isPending}>
                  {addDriverMutation.isPending ? 'Adding...' : 'Add Driver'}
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
            {drivers?.map((driver: any) => (
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
                  <Button variant="ghost" size="icon">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <PhoneCall className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
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
