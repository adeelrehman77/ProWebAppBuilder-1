import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Pencil, Trash2 } from "lucide-react";
import { AddRouteDialog } from "@/components/routes/AddRouteDialog";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Route {
  id: number;
  name: string;
  description: string;
  areas: string;
  estimatedTime: number;
  maxDeliveries: number;
  active: boolean;
  startLocation: string;
  endLocation: string;
  zone: {
    id: number;
    name: string;
    hub: string;
  };
}

export default function RoutesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHub, setSelectedHub] = useState<string>("All");

  const { data: routes, isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const response = await fetch("/api/routes");
      if (!response.ok) {
        throw new Error("Failed to fetch routes");
      }
      return response.json();
    },
  });

  const filteredRoutes = routes?.filter((route: Route) => {
    const matchesSearch =
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.zone?.hub.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHub = selectedHub === "All" || route.zone?.hub === selectedHub;

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
      header: "Route Name",
      accessorKey: "name",
      cell: ({ row }: { row: any }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      header: "Zone",
      cell: ({ row }: { row: any }) => (
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
          {row.original.zone?.name || "Unassigned"}
        </Badge>
      ),
    },
    {
      header: "Hub",
      cell: ({ row }: { row: any }) => (
        <div className="text-sm">{row.original.zone?.hub || "N/A"}</div>
      ),
    },
    {
      header: "Areas",
      accessorKey: "areas",
      cell: ({ row }: { row: any }) => (
        <div className="max-w-[200px] truncate text-sm text-gray-600">
          {row.original.areas}
        </div>
      ),
    },
    {
      header: "Est. Time",
      accessorKey: "estimatedTime",
      cell: ({ row }: { row: any }) => (
        <div className="text-sm">
          {row.original.estimatedTime ? `${row.original.estimatedTime} mins` : "N/A"}
        </div>
      ),
    },
    {
      header: "Max Deliveries",
      accessorKey: "maxDeliveries",
      cell: ({ row }: { row: any }) => (
        <div className="text-sm">{row.original.maxDeliveries || "N/A"}</div>
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
    console.log("Edit route:", id);
  };

  const handleDelete = (id: number) => {
    // Will implement delete functionality
    console.log("Delete route:", id);
  };

  const uniqueHubs = [
    "All",
    ...Array.from(new Set(routes?.map((route: Route) => route.zone?.hub).filter(Boolean) || [])),
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Routes</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage delivery routes and their associated zones
            </p>
          </div>
          <AddRouteDialog />
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search routes..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedHub} onValueChange={setSelectedHub}>
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
            data={filteredRoutes || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
