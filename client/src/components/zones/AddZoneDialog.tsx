import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function AddZoneDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    hub: "",
    areaPincode: "",
    areaPolygons: "",
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("/api/zones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create zone");
      }

      await queryClient.invalidateQueries(["zones"]);
      setOpen(false);
      setFormData({
        name: "",
        hub: "",
        areaPincode: "",
        areaPolygons: "",
        active: true,
      });
    } catch (error) {
      console.error("Error creating zone:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-900 hover:bg-emerald-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Zone
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Zone</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Zone Name</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hub">Hub</Label>
            <Input
              id="hub"
              required
              value={formData.hub}
              onChange={(e) => setFormData({ ...formData, hub: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="areaPincode">Area Pincode</Label>
            <Input
              id="areaPincode"
              value={formData.areaPincode}
              onChange={(e) => setFormData({ ...formData, areaPincode: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="areaPolygons">Area Polygons</Label>
            <Input
              id="areaPolygons"
              value={formData.areaPolygons}
              onChange={(e) => setFormData({ ...formData, areaPolygons: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active">Active</Label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-900 hover:bg-emerald-800 text-white"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Zone"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
