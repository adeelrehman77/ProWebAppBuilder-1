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
    totalAmount: 0,
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
      if (formData.products.length === 0) {
        toast({
          variant: "destructive",
          title: "Error creating subscription",
          description: "Please select at least one product",
        });
        return;
      }

      // Validate dates
      const startDate = new Date(formData.startDate);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(formData.endDate);
      endDate.setUTCHours(0, 0, 0, 0);
      
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
          totalAmount: formData.totalAmount,
          status: 'pending'
        },
        items: formData.products.map(product => {
          const productDetails = products.find(p => p.id === product.id);
          return {
            productId: product.id,
            quantity: product.quantity,
            price: productDetails?.price || 0
          };
        })
      };

      console.log('Sending subscription data:', subscriptionData);
      
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionData),
      });

      let responseData;
      try {
        const responseText = await response.text();
        console.log('Raw server response:', responseText);
        
        try {
          responseData = JSON.parse(responseText);
          console.log('Parsed server response:', responseData);
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
          throw new Error(responseText || 'Failed to create subscription');
        }
      } catch (e) {
        console.error('Error handling response:', e);
        throw new Error('Failed to process server response');
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
      const product = products.find(p => p.id === productId);
      
      if (!product) return prev;
      
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
      
      // Calculate total amount
      const totalAmount = updatedProducts.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + (product?.price || 0) * item.quantity;
      }, 0);
      
      return { ...prev, products: updatedProducts, totalAmount };
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
                <div className="flex justify-between items-center mb-4">
                  <Label>Select Products</Label>
                  <div className="text-lg font-bold">
                    Total Amount: د.إ {formData.totalAmount.toFixed(2)}
                  </div>
                </div>
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
