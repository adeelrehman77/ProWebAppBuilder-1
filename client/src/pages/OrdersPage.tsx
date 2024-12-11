import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import type { Order, Product } from "@db/schema";

type NewOrder = {
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  delivery?: {
    date: string;
    slot: "Lunch" | "Dinner";
  };
};

export default function OrdersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newOrder, setNewOrder] = useState<NewOrder>({
    items: [],
    totalAmount: 0,
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createMutation = useMutation({
    mutationFn: async (order: NewOrder) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setOpen(false);
      setNewOrder({
        items: [],
        totalAmount: 0,
      });
      toast({ title: "Order created successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error creating order",
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...order }: Partial<Order> & { id: number }) => {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order updated successfully" });
    },
  });

  const addItem = (productId: number) => {
    const product = products?.find((p) => p.id === productId);
    if (!product) return;

    setNewOrder((prev) => {
      const items = [
        ...prev.items,
        {
          productId: product.id,
          quantity: 1,
          price: product.price,
        },
      ];
      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { ...prev, items, totalAmount };
    });
  };

  return (
    <>
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Orders</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Add Products</label>
                  <Select
                    onValueChange={(value) => addItem(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem
                          key={product.id}
                          value={product.id.toString()}
                          disabled={!product.active}
                        >
                          {product.name} - ₹{product.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Order Items</h3>
                  <div className="space-y-2">
                    {newOrder.items.map((item, index) => {
                      const product = products?.find((p) => p.id === item.productId);
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <span className="flex-1">{product?.name}</span>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const quantity = parseInt(e.target.value);
                              setNewOrder((prev) => ({
                                ...prev,
                                items: prev.items.map((i, idx) =>
                                  idx === index ? { ...i, quantity } : i
                                ),
                                totalAmount: prev.items.reduce(
                                  (sum, i, idx) =>
                                    sum +
                                    i.price *
                                      (idx === index ? quantity : i.quantity),
                                  0
                                ),
                              }));
                            }}
                            className="w-20"
                          />
                          <span>× ₹{item.price}</span>
                          <span>= ₹{item.price * item.quantity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Total Amount: ₹{newOrder.totalAmount}</h3>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Delivery Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      onChange={(e) =>
                        setNewOrder((prev) => ({
                          ...prev,
                          delivery: {
                            ...prev.delivery,
                            date: new Date(e.target.value).toISOString(),
                          } as any,
                        }))
                      }
                    />
                    <Select
                      onValueChange={(value) =>
                        setNewOrder((prev) => ({
                          ...prev,
                          delivery: {
                            ...prev.delivery,
                            slot: value as "Lunch" | "Dinner",
                          } as any,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lunch">Lunch</SelectItem>
                        <SelectItem value="Dinner">Dinner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={() => createMutation.mutate(newOrder)}
                  disabled={
                    createMutation.isPending ||
                    newOrder.items.length === 0 ||
                    !newOrder.delivery?.date ||
                    !newOrder.delivery?.slot
                  }
                >
                  Create Order
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order, index) => (
              <TableRow key={order.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(value) =>
                      updateMutation.mutate({
                        id: order.id,
                        status: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>₹{order.totalAmount}</TableCell>
                <TableCell>
                  {new Date(order.createdAt!).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {order.deliveries?.map((delivery) => (
                    <div key={delivery.id} className="text-sm">
                      {new Date(delivery.date).toLocaleDateString()} [{delivery.slot}] - {delivery.status}
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
