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
    contactNumber: "",
    address: "",
    location: "",
    buildingName: "",
    flatNumber: "",
    paymentMode: "cash",
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
      // Create subscription with items
      // Ensure dates are valid before creating the subscription
      const startDate = new Date(formData.startDate + 'T00:00:00Z');
      const endDate = new Date(formData.endDate + 'T00:00:00Z');
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        toast({
          variant: "destructive",
          title: "Invalid dates",
          description: "Please enter valid start and end dates",
        });
        return;
      }

      const subscriptionData = {
        subscription: {
          name: formData.name,
          contactNumber: formData.contactNumber,
          address: formData.address,
          location: formData.location,
          buildingName: formData.buildingName,
          flatNumber: formData.flatNumber,
          paymentMode: formData.paymentMode,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: 'pending'
        },
        items: formData.products.map(product => ({
          productId: product.id,
          quantity: product.quantity
        }))
      };

      // Log the subscription data for debugging
      console.log('Sending subscription data:', subscriptionData);
      
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionData),
      });

      let responseData;
      try {
        responseData = await response.json();
        console.log('Server response:', responseData);
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create subscription');
      }

      toast({ title: "Subscription created successfully" });
      setFormData({
        name: "",
        contactNumber: "",
        address: "",
        location: "",
        buildingName: "",
        flatNumber: "",
        paymentMode: "cash",
        startDate: "",
        endDate: "",
        products: [],
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      let errorMessage = "Failed to create subscription";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'error' in error) {
        errorMessage = String((error as {error: string}).error);
      }

      toast({
        variant: "destructive",
        title: "Error creating subscription",
        description: errorMessage,
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
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buildingName">Building Name</Label>
                  <Input
                    id="buildingName"
                    value={formData.buildingName}
                    onChange={(e) => setFormData(prev => ({ ...prev, buildingName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flatNumber">Flat Number</Label>
                  <Input
                    id="flatNumber"
                    value={formData.flatNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, flatNumber: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <Select
                    value={formData.paymentMode}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMode: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
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
