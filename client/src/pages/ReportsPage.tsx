import { Sidebar } from "@/components/Sidebar";

export default function ReportsPage() {
  return (
    <>
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="grid gap-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Reports</h1>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Coming Soon</h2>
            <p>Report generation functionality will be added soon.</p>
          </div>
        </div>
      </div>
    </>
  );
}
