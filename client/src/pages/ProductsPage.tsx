import { useState } from "react";

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
import { Plus, Image, Search } from "lucide-react";
import type { Product, Category } from "@db/schema";

type NewProduct = {
  name: string;
  brand: string;
  categoryId: number | null;
  price: number;
  active: boolean;
  image?: string | null;
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
  sku?: string;
};

export default function ProductsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<(Product & { isNew?: boolean }) | null>(null);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    brand: "Fun Adventure Kitchen",
    categoryId: null,
    price: 15,
    active: true,
    stockQuantity: 0,
    minStockLevel: 10,
    unit: 'units',
    sku: '',
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();
      console.log('Uploaded image URL:', url);
      
      if (editingProduct) {
        const updatedProduct = { ...editingProduct, image: url };
        setEditingProduct(updatedProduct);
        // Update the product immediately with the new image
        updateMutation.mutate({
          id: editingProduct.id,
          image: url,
        });
      } else {
        setNewProduct((prev) => ({ ...prev, image: url }));
      }
      
      toast({ title: "Image uploaded successfully" });
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        variant: "destructive",
        title: "Failed to upload image",
        description: error.message,
      });
    }
  };

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createMutation = useMutation({
    mutationFn: async (product: NewProduct) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setOpen(false);
      setNewProduct({
        name: "",
        brand: "Fun Adventure Kitchen",
        categoryId: null,
        price: 15,
        active: true,
      });
      toast({ title: "Product created successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error creating product",
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: number }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setOpen(false);
      setEditingProduct(null);
      toast({ title: "Product updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setOpen(false);
      setEditingProduct(null);
      toast({ title: "Product deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error deleting product",
        description: error.message,
      });
    },
  });

  return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={editingProduct?.name || newProduct.name}
                      onChange={(e) =>
                        editingProduct
                          ? setEditingProduct({ ...editingProduct, name: e.target.value })
                          : setNewProduct({ ...newProduct, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Image</label>
                    <div className="flex items-center gap-4">
                      {(editingProduct?.image || newProduct.image) && (
                        <img
                          src={editingProduct?.image || newProduct.image}
                          alt="Product"
                          className="h-20 w-20 object-cover rounded"
                        />
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={newProduct.categoryId?.toString() || ""}
                      onValueChange={(value) =>
                        setNewProduct({ ...newProduct, categoryId: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price (AED)</label>
                    <Input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          price: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stock Quantity</label>
                    <Input
                      type="number"
                      value={newProduct.stockQuantity}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          stockQuantity: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Stock Level</label>
                    <Input
                      type="number"
                      value={newProduct.minStockLevel}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          minStockLevel: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Unit</label>
                    <Input
                      value={newProduct.unit}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          unit: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SKU</label>
                    <Input
                      value={newProduct.sku}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          sku: e.target.value,
                        })
                      }
                    />
                  </div>
                  {editingProduct ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          updateMutation.mutate({
                            id: editingProduct.id,
                            name: editingProduct.name,
                            brand: editingProduct.brand,
                            categoryId: editingProduct.categoryId,
                            price: editingProduct.price,
                            image: editingProduct.image,
                            active: editingProduct.active,
                          })
                        }
                        disabled={updateMutation.isPending}
                      >
                        Update Product
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this product?')) {
                            deleteMutation.mutate(editingProduct.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => createMutation.mutate(newProduct)}
                      disabled={createMutation.isPending || !newProduct.categoryId}
                    >
                      Create Product
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price (AED)</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Min. Stock</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product, index) => (
              <TableRow key={product.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                      <Image className="h-6 w-6" />
                    </div>
                  )}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.brand}</TableCell>
                <TableCell>
                  {categories?.find((c) => c.id === product.categoryId)?.name}
                </TableCell>
                <TableCell>AED {product.price}.00/{product.unit}</TableCell>
                <TableCell>
                  <span className={`${product.stockQuantity <= product.minStockLevel ? 'text-red-500' : 'text-green-500'}`}>
                    {product.stockQuantity}
                  </span>
                </TableCell>
                <TableCell>{product.minStockLevel}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>
                  <Button
                    variant={product.active ? "default" : "secondary"}
                    onClick={() =>
                      updateMutation.mutate({
                        id: product.id,
                        active: !product.active,
                      })
                    }
                  >
                    {product.active ? "YES" : "NO"}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingProduct(product);
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
  );
}
