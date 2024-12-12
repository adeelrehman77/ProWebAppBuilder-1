import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface DataTableProps<TData> {
  columns: {
    header: string;
    accessorKey?: string;
    cell?: (props: { row: { original: TData } }) => React.ReactNode;
  }[];
  data: TData[];
  isLoading?: boolean;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
}: DataTableProps<TData>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.header}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, columnIndex) => (
                <TableCell key={`${rowIndex}-${columnIndex}`}>
                  {column.cell
                    ? column.cell({ row: { original: row } })
                    : column.accessorKey
                    ? String((row as any)[column.accessorKey] ?? "")
                    : ""}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
