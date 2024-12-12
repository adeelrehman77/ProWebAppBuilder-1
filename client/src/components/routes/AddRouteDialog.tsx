import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddRouteDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: zones } = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const response = await fetch("/api/zones");
      if (!response.ok) {
        throw new Error("Failed to fetch zones");
      }
      return response.json();
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    areas: "",
    estimatedTime: "",
    maxDeliveries: "",
    active: true,
    startLocation: "",
    endLocation: "",
    zoneId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          estimatedTime: parseInt(formData.estimatedTime) || null,
          maxDeliveries: parseInt(formData.maxDeliveries) || null,
          zoneId: parseInt(formData.zoneId) || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create route");
      }

      await queryClient.invalidateQueries(["routes"]);
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        areas: "",
        estimatedTime: "",
        maxDeliveries: "",
        active: true,
        startLocation: "",
        endLocation: "",
        zoneId: "",
      });
    } catch (error) {
      console.error("Error creating route:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-900 hover:bg-emerald-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Route
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Route</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Route Name</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zone">Zone</Label>
            <Select
              value={formData.zoneId}
              onValueChange={(value) => setFormData({ ...formData, zoneId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Zone" />
              </SelectTrigger>
              <SelectContent>
                {zones?.map((zone: any) => (
                  <SelectItem key={zone.id} value={String(zone.id)}>
                    {zone.name} ({zone.hub})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="areas">Areas</Label>
            <Input
              id="areas"
              value={formData.areas}
              onChange={(e) => setFormData({ ...formData, areas: e.target.value })}
              placeholder="Enter comma-separated areas"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Est. Time (mins)</Label>
              <Input
                id="estimatedTime"
                type="number"
                value={formData.estimatedTime}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedTime: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDeliveries">Max Deliveries</Label>
              <Input
                id="maxDeliveries"
                type="number"
                value={formData.maxDeliveries}
                onChange={(e) =>
                  setFormData({ ...formData, maxDeliveries: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startLocation">Start Location</Label>
              <Input
                id="startLocation"
                value={formData.startLocation}
                onChange={(e) =>
                  setFormData({ ...formData, startLocation: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endLocation">End Location</Label>
              <Input
                id="endLocation"
                value={formData.endLocation}
                onChange={(e) =>
                  setFormData({ ...formData, endLocation: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, active: checked })
              }
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-900 hover:bg-emerald-800 text-white"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Route"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
