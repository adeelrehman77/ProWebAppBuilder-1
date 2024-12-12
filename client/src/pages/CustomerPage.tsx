import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";

interface Customer {
  id: number;
  name: string;
  phone: string;
  balance: number;
  isActive: boolean;
  route: string;
  registeredOn: string;
}

export default function CustomerPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchBalance, setSearchBalance] = useState("");
  const [searchRoute, setSearchRoute] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      return response.json();
    },
  });

  const filteredCustomers = customers?.filter((customer: Customer) => {
    const matchesName = customer.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesPhone = customer.phone.includes(searchPhone);
    const matchesBalance = searchBalance === "" || customer.balance.toString().includes(searchBalance);
    const matchesRoute = customer.route.toLowerCase().includes(searchRoute.toLowerCase());
    const matchesActive = activeFilter === "all" || 
      (activeFilter === "active" && customer.isActive) || 
      (activeFilter === "inactive" && !customer.isActive);

    return matchesName && matchesPhone && matchesBalance && matchesRoute && matchesActive;
  });

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Phone",
      accessorKey: "phone",
    },
    {
      header: "Balance",
      accessorKey: "balance",
      cell: ({ row }: { row: any }) => (
        <span className="text-right">{row.original.balance.toFixed(2)} د.إ</span>
      ),
    },
    {
      header: "Is Active?",
      accessorKey: "isActive",
      cell: ({ row }: { row: any }) => (
        <span className={row.original.isActive ? "text-green-600" : "text-red-600"}>
          {row.original.isActive ? "YES" : "NO"}
        </span>
      ),
    },
    {
      header: "Route",
      accessorKey: "route",
    },
    {
      header: "Registered On",
      accessorKey: "registeredOn",
      cell: ({ row }: { row: any }) => (
        <span>{new Date(row.original.registeredOn).toLocaleString()}</span>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="grid gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Customers</h1>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              id="bulkUploadInput"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const formData = new FormData();
                formData.append('file', file);

                try {
                  const response = await fetch('/api/customers/bulk-upload', {
                    method: 'POST',
                    body: formData,
                  });

                  if (!response.ok) throw new Error('Failed to upload customers');

                  toast({ title: 'Customers uploaded successfully' });
                  queryClient.invalidateQueries({ queryKey: ['customers'] });
                } catch (error) {
                  toast({
                    variant: 'destructive',
                    title: 'Error uploading customers',
                    description: error instanceof Error ? error.message : 'Unknown error occurred',
                  });
                }
              }}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('bulkUploadInput')?.click()}
            >
              Bulk Upload
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const XLSX = await import('xlsx');
                  const ws = XLSX.utils.json_to_sheet(customers || []);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Customers');
                  XLSX.writeFile(wb, 'customers.xlsx');
                } catch (error) {
                  toast({
                    variant: 'destructive',
                    title: 'Error exporting customers',
                    description: 'Failed to export customers to Excel',
                  });
                }
              }}
            >
              Export to Excel
            </Button>
            <AddCustomerDialog />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search By Name"
              className="pl-9"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search By Phone"
              className="pl-9"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search By Balance"
              className="pl-9"
              value={searchBalance}
              onChange={(e) => setSearchBalance(e.target.value)}
            />
          </div>
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Active" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search By Route"
              className="pl-9"
              value={searchRoute}
              onChange={(e) => setSearchRoute(e.target.value)}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredCustomers || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}