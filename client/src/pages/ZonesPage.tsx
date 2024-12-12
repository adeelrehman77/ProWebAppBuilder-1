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

interface Zone {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export function ZonesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: zones, isLoading } = useQuery({
    queryKey: ['/api/zones'],
    queryFn: async () => {
      const response = await fetch('/api/zones');
      if (!response.ok) {
        throw new Error('Failed to fetch zones');
      }
      return response.json() as Promise<Zone[]>;
    },
  });

  const addZoneMutation = useMutation({
    mutationFn: async (data: Omit<Zone, "id" | "createdAt" | "updatedAt">) => {
      const response = await fetch('/api/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add zone');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/zones'] });
      setIsAddDialogOpen(false);
      toast({ title: "Success", description: "Zone added successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zones</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Zone</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Zone</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input name="name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input name="description" />
              </div>
              <DialogFooter>
                <Button type="submit">Add Zone</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sr.No.</TableHead>
              <TableHead>Zone Name</TableHead>
              <TableHead>Hub</TableHead>
              <TableHead>Area (Pincode)</TableHead>
              <TableHead>Area (Polygons)</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones?.map((zone, index) => (
              <TableRow key={zone.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{zone.name}</TableCell>
                <TableCell>Fun Adventure Hub</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>{zone.active ? 'YES' : 'NO'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
