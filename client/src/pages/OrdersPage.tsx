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
  startDate?: string;
  endDate?: string;
  isRecurring: boolean;
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
    isRecurring: false,
    startDate: new Date().toISOString().split('T')[0],
  });

  const { data: orders = [], isError: hasOrderError } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    }
  });

  const { data: products = [], isError: hasProductError } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  // Log the data to help with debugging
  console.log('Orders:', orders);
  console.log('Products:', products);

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
        isRecurring: false,
        startDate: new Date().toISOString().split('T')[0],
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

  const updateDeliveryMutation = useMutation({
    mutationFn: async ({ id, ...delivery }: { id: number; status: string }) => {
      const res = await fetch(`/api/deliveries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(delivery),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Delivery status updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update delivery status",
        description: error.message,
      });
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
        <div className="grid gap-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Orders</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> New Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
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
                            {product.name} - AED {product.price}
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
                            <span>× AED {item.price}</span>
                            <span>= AED {item.price * item.quantity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium">Total Amount: AED {newOrder.totalAmount}</h3>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Delivery Details</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <label className="text-sm font-medium">Recurring Order</label>
                      <input
                        type="checkbox"
                        checked={newOrder.isRecurring}
                        onChange={(e) =>
                          setNewOrder((prev) => ({
                            ...prev,
                            isRecurring: e.target.checked,
                          }))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <Input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={newOrder.startDate}
                          onChange={(e) =>
                            setNewOrder((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                              delivery: {
                                ...prev.delivery,
                                date: new Date(e.target.value).toISOString(),
                              } as any,
                            }))
                          }
                        />
                      </div>
                      {newOrder.isRecurring && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">End Date</label>
                          <Input
                            type="date"
                            min={newOrder.startDate}
                            value={newOrder.endDate}
                            onChange={(e) =>
                              setNewOrder((prev) => ({
                                ...prev,
                                endDate: e.target.value,
                              }))
                            }
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Delivery Slot</label>
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
                            <SelectItem value="Lunch">Lunch (11:00 AM - 2:00 PM)</SelectItem>
                            <SelectItem value="Dinner">Dinner (7:00 PM - 10:00 PM)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => createMutation.mutate(newOrder)}
                    disabled={
                      createMutation.isPending ||
                      newOrder.items.length === 0
                    }
                  >
                    Create Order
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Past Deliveries</h2>
              <div className="space-y-2">
                {orders?.filter(order => 
                  order.deliveries?.some(d => new Date(d.date) < new Date())
                ).map(order => (
                  <div key={order.id} className="text-sm">
                    {order.deliveries?.map(delivery => 
                      new Date(delivery.date) < new Date() && (
                        <div key={delivery.id} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span>{new Date(delivery.date).toLocaleDateString()} [{delivery.slot}]</span>
                          <span className={delivery.status === "Completed" ? "text-green-600" : "text-yellow-600"}>
                            {delivery.status}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Future Deliveries</h2>
              <div className="space-y-2">
                {orders?.filter(order => 
                  order.deliveries?.some(d => new Date(d.date) >= new Date())
                ).map(order => (
                  <div key={order.id} className="text-sm">
                    {order.deliveries?.map(delivery => 
                      new Date(delivery.date) >= new Date() && (
                        <div key={delivery.id} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span>{new Date(delivery.date).toLocaleDateString()} [{delivery.slot}]</span>
                          <span className="text-blue-600">{delivery.status}</span>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Paid Amount</TableHead>
              <TableHead>Payment Status</TableHead>
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
                <TableCell>AED {order.totalAmount}</TableCell>
                <TableCell>AED {order.paidAmount}</TableCell>
                <TableCell>
                  <Select
                    value={order.paymentStatus}
                    onValueChange={(value) =>
                      updateMutation.mutate({
                        id: order.id,
                        paymentStatus: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">Order Items</h3>
                          <div className="space-y-2">
                            {order.items?.map((item) => {
                              const product = products?.find((p) => p.id === item.productId);
                              return (
                                <div key={item.id} className="flex items-center justify-between">
                                  <span>{product?.name}</span>
                                  <span className="text-muted-foreground">
                                    {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-4 pt-4 border-t space-y-4">
                            <div className="flex justify-between">
                              <span className="font-medium">Total Amount:</span>
                              <span>₹{order.totalAmount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Payment Method:</span>
                              <Select
                                value={order.paymentMethod || ''}
                                onValueChange={(value) =>
                                  updateMutation.mutate({
                                    id: order.id,
                                    paymentMethod: value,
                                  })
                                }
                              >
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Cash">Cash</SelectItem>
                                  <SelectItem value="Card">Card</SelectItem>
                                  <SelectItem value="UPI">UPI</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Paid Amount:</span>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  className="w-[100px]"
                                  value={order.paidAmount}
                                  onChange={(e) =>
                                    updateMutation.mutate({
                                      id: order.id,
                                      paidAmount: parseInt(e.target.value) || 0,
                                    })
                                  }
                                />
                                <span className="text-sm text-muted-foreground">
                                  of AED {order.totalAmount}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Payment Status:</span>
                              <Select
                                value={order.paymentStatus}
                                onValueChange={(value) =>
                                  updateMutation.mutate({
                                    id: order.id,
                                    paymentStatus: value,
                                  })
                                }
                              >
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Partial">Partial</SelectItem>
                                  <SelectItem value="Paid">Paid</SelectItem>
                                  <SelectItem value="Refunded">Refunded</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">Delivery Details</h3>
                          {order.deliveries?.map((delivery) => (
                            <div key={delivery.id} className="space-y-1">
                              <div className="flex justify-between">
                                <span>Date:</span>
                                <span>{new Date(delivery.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Slot:</span>
                                <span>{delivery.slot}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Status:</span>
                                <Select
                                  value={delivery.status}
                                  onValueChange={(value) =>
                                    updateDeliveryMutation.mutate({
                                      id: delivery.id,
                                      status: value,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
