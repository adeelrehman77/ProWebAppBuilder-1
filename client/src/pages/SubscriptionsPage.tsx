import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SubscriptionsPage() {
  const { toast } = useToast();
  interface Product {
    id: number;
    name: string;
    price: number;
    categoryId: number;
    active: boolean;
  }

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    route: "",
    subscriptionType: "daily",
    mealPreference: "veg",
    startDate: "",
    endDate: "",
    products: [] as { id: number; quantity: number }[],
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.products.length === 0) {
      toast({
        variant: "destructive",
        title: "Error creating subscription",
        description: "Please select at least one product",
      });
      return;
    }

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast({ title: "Subscription created successfully" });
      setFormData({
        name: "",
        phone: "",
        route: "",
        subscriptionType: "daily",
        mealPreference: "veg",
        startDate: "",
        endDate: "",
        products: [],
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        variant: "destructive",
        title: "Error creating subscription",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const updateProductQuantity = (productId: number, quantity: number) => {
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      const existingIndex = updatedProducts.findIndex(p => p.id === productId);
      
      if (quantity <= 0) {
        if (existingIndex !== -1) {
          updatedProducts.splice(existingIndex, 1);
        }
      } else {
        if (existingIndex !== -1) {
          updatedProducts[existingIndex].quantity = quantity;
        } else {
          updatedProducts.push({ id: productId, quantity });
        }
      }
      
      return { ...prev, products: updatedProducts };
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Subscribe to Our Meal Service</CardTitle>
            <CardDescription className="text-center">
              Get delicious meals delivered right to your doorstep
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="route">Delivery Route/Area</Label>
                  <Input
                    id="route"
                    value={formData.route}
                    onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscriptionType">Subscription Type</Label>
                  <Select
                    value={formData.subscriptionType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subscriptionType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Select Products</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="w-[150px]">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: Product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>د.إ {product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={formData.products.find(p => p.id === product.id)?.quantity || 0}
                            onChange={(e) => updateProductQuantity(product.id, parseInt(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button type="submit" className="w-full">Subscribe Now</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
