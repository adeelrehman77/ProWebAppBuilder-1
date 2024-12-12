import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Product, Category } from "@db/schema";

export default function CustomerPage() {
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<Array<{id: number, quantity: number}>>([]);
  const [open, setOpen] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({
    name: "",
    contactNumber: "",
    address: "",
    location: "",
    buildingName: "",
    flatNumber: "",
    paymentMode: "cash", // cash or bank_transfer
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const { data: products, error: productsError } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          console.error('Products API Error:', await response.text());
          throw new Error('Failed to fetch products');
        }
        return response.json();
      } catch (error) {
        console.error('Products fetch error:', error);
        throw error;
      }
    }
  });

  const { data: categories, error: categoriesError } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          console.error('Categories API Error:', await response.text());
          throw new Error('Failed to fetch categories');
        }
        return response.json();
      } catch (error) {
        console.error('Categories fetch error:', error);
        throw error;
      }
    }
  });

  const handleSubscribe = async () => {
    try {
      // Convert date strings to ISO format for server
      // Ensure dates are properly formatted for the server
      const startDate = new Date(subscriptionForm.startDate);
      const endDate = new Date(subscriptionForm.endDate);
      
      const formData = {
        ...subscriptionForm,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        products: selectedProducts,
      };

      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(await response.text());

      toast({ title: "Subscription request sent successfully" });
      setOpen(false);
      setSelectedProducts([]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating subscription",
        description: error.message,
      });
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="text-center mb-8">
        <img
          src="/logo.png"
          alt="Fun Adventure Kitchen"
          className="mx-auto w-64 mb-4"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        <h1 className="text-3xl font-bold">Fun Adventure Kitchen Products</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded"
              />
            ) : (
              <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                No image
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{categories?.find(c => c.id === product.categoryId)?.name}</p>
              <p className="font-bold text-lg mt-2">AED {product.price}.00/{product.unit}</p>
            </div>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="Qty"
                className="w-20"
                min="0"
                onChange={(e) => {
                  const qty = parseInt(e.target.value);
                  if (qty > 0) {
                    setSelectedProducts(prev => {
                      const existing = prev.find(p => p.id === product.id);
                      if (existing) {
                        return prev.map(p => p.id === product.id ? {...p, quantity: qty} : p);
                      }
                      return [...prev, { id: product.id, quantity: qty }];
                    });
                  } else {
                    setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
                  }
                }}
                value={selectedProducts.find(p => p.id === product.id)?.quantity || ""}
              />
              <p className="text-sm text-muted-foreground">in {product.unit}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedProducts.length > 0 && (
        <div className="fixed bottom-8 right-8">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                Subscribe ({selectedProducts.length} items)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Subscription Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={subscriptionForm.name}
                    onChange={(e) =>
                      setSubscriptionForm(prev => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Number</label>
                  <Input
                    value={subscriptionForm.contactNumber}
                    onChange={(e) =>
                      setSubscriptionForm(prev => ({ ...prev, contactNumber: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    value={subscriptionForm.address}
                    onChange={(e) =>
                      setSubscriptionForm(prev => ({ ...prev, address: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={subscriptionForm.location}
                    onChange={(e) =>
                      setSubscriptionForm(prev => ({ ...prev, location: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Building Name</label>
                  <Input
                    value={subscriptionForm.buildingName}
                    onChange={(e) =>
                      setSubscriptionForm(prev => ({ ...prev, buildingName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Office/Flat Number</label>
                  <Input
                    value={subscriptionForm.flatNumber}
                    onChange={(e) =>
                      setSubscriptionForm(prev => ({ ...prev, flatNumber: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={subscriptionForm.startDate}
                    onChange={(e) =>
                      setSubscriptionForm(prev => ({ ...prev, startDate: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={subscriptionForm.endDate}
                    onChange={(e) =>
                      setSubscriptionForm(prev => ({ ...prev, endDate: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Mode</label>
                  <Select
                    value={subscriptionForm.paymentMode}
                    onValueChange={(value) =>
                      setSubscriptionForm(prev => ({ ...prev, paymentMode: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleSubscribe}>
                  Submit Subscription
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
