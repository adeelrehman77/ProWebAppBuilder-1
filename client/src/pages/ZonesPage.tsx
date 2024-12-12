import { useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { DataTable } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Zone {
  id: number;
  name: string;
  hub: string;
  areaPincode: string;
  areaPolygons: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ZonesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHub, setSelectedHub] = useState<string>("All");

  const { data: zones, isLoading } = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const response = await fetch("/api/zones");
      if (!response.ok) {
        throw new Error("Failed to fetch zones");
      }
      return response.json();
    },
  });

  const filteredZones = zones?.filter((zone: Zone) => {
    const matchesSearch = 
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.hub.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.areaPincode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesHub = selectedHub === "All" || zone.hub === selectedHub;
    
    return matchesSearch && matchesHub;
  });

  const columns = [
    {
      header: "Sr.No.",
      cell: ({ row }: { row: any }) => (
        <span className="text-gray-600">{row.index + 1}</span>
      ),
    },
    {
      header: "Zone Name",
      accessorKey: "name",
      cell: ({ row }: { row: any }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      header: "Hub",
      accessorKey: "hub",
      cell: ({ row }: { row: any }) => (
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
          {row.original.hub}
        </Badge>
      ),
    },
    {
      header: "Area (Pincode)",
      accessorKey: "areaPincode",
      cell: ({ row }: { row: any }) => (
        <div className="font-mono text-sm">{row.original.areaPincode}</div>
      ),
    },
    {
      header: "Area (Polygons)",
      accessorKey: "areaPolygons",
      cell: ({ row }: { row: any }) => (
        <div className="max-w-[200px] truncate text-sm text-gray-600">
          {row.original.areaPolygons}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "active",
      cell: ({ row }: { row: any }) => (
        <Badge 
          variant={row.original.active ? "success" : "destructive"}
          className={
            row.original.active 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }
        >
          {row.original.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800"
            onClick={() => handleEdit(row.original.id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-800"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleEdit = (id: number) => {
    // Will implement edit functionality
    console.log("Edit zone:", id);
  };

  const handleDelete = (id: number) => {
    // Will implement delete functionality
    console.log("Delete zone:", id);
  };

  const uniqueHubs = ["All", ...new Set(zones?.map((zone: Zone) => zone.hub) || [])];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Zones</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage delivery zones and their associated hubs
            </p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Zone
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search zones..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={selectedHub}
              onValueChange={setSelectedHub}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Hub" />
              </SelectTrigger>
              <SelectContent>
                {uniqueHubs.map((hub) => (
                  <SelectItem key={hub} value={hub}>
                    {hub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DataTable
            columns={columns}
            data={filteredZones || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
