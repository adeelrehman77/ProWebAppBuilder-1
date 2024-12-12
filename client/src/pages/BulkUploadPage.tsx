import { Button } from "@/components/ui/button";

export default function BulkUploadPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bulk Upload</h1>
      </div>

      <div className="max-w-xl">
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Data</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select File</label>
              <input
                type="file"
                className="w-full border rounded-lg p-2"
                accept=".csv,.xlsx"
              />
            </div>
            <Button>Upload</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
