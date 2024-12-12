import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { DataTable } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

interface Zone {
  id: number;
  name: string;
  hub: string;
  areaPincode: string;
  areaPolygons: string;
  active: boolean;
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
      accessorKey: "id",
    },
    {
      header: "Zone Name",
      accessorKey: "name",
    },
    {
      header: "Hub",
      accessorKey: "hub",
    },
    {
      header: "Area (Pincode)",
      accessorKey: "areaPincode",
    },
    {
      header: "Area (Polygons)",
      accessorKey: "areaPolygons",
    },
    {
      header: "Active",
      accessorKey: "active",
      cell: ({ row }: { row: any }) => (
        <span className={row.original.active ? "text-green-600" : "text-red-600"}>
          {row.original.active ? "YES" : "NO"}
        </span>
      ),
    },
    {
      header: "Action",
      cell: ({ row }: { row: any }) => (
        <Button
          variant="ghost"
          className="text-blue-600 hover:text-blue-800"
          onClick={() => handleEdit(row.original.id)}
        >
          Edit
        </Button>
      ),
    },
  ];

  const handleEdit = (id: number) => {
    // Will implement edit functionality
    console.log("Edit zone:", id);
  };

  const uniqueHubs = ["All", ...new Set(zones?.map((zone: Zone) => zone.hub) || [])];

  return (
    <>
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Zones</h1>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Zone Name"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border rounded-md"
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
            >
              {uniqueHubs.map((hub) => (
                <option key={hub} value={hub}>
                  {hub}
                </option>
              ))}
            </select>
          </div>
          <DataTable
            columns={columns}
            data={filteredZones || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
}
