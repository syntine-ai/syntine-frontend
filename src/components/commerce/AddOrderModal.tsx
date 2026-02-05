import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Minus,
  Trash2,
  Search,
  Package,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import type { ProductWithVariants, ProductVariant } from "@/api/types/products";
import type { PaymentType } from "@/api/types/commerce-common";

interface OrderLineItem {
  product: ProductWithVariants;
  variant: ProductVariant;
  quantity: number;
}

interface AddOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ManualOrderData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface ManualOrderData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  payment_type: PaymentType;
  notes?: string;
  items: {
    product_id: string;
    variant_id: string;
    title: string;
    variant_title?: string;
    sku?: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  total_amount: number;
  subtotal: number;
  currency: string;
}

export function AddOrderModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: AddOrderModalProps) {
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("cod");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<OrderLineItem[]>([]);
  const [productSearch, setProductSearch] = useState("");

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useProducts({
    status: "active",
    page_size: 100,
  });

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const searchLower = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.vendor?.toLowerCase().includes(searchLower)
    );
  }, [products, productSearch]);

  // Calculate totals
  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + (item.variant.price || 0) * item.quantity, 0),
    [lineItems]
  );

  const totalAmount = subtotal; // Could add tax/discounts here

  // Add product to line items
  const addProduct = (product: ProductWithVariants, variant: ProductVariant) => {
    setLineItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.variant.id === variant.id
      );
      if (existingIndex >= 0) {
        // Increment quantity
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      // Add new item
      return [...prev, { product, variant, quantity: 1 }];
    });
  };

  // Update quantity
  const updateQuantity = (variantId: string, delta: number) => {
    setLineItems((prev) =>
      prev
        .map((item) =>
          item.variant.id === variantId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item
  const removeItem = (variantId: string) => {
    setLineItems((prev) => prev.filter((item) => item.variant.id !== variantId));
  };

  // Reset form
  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setPaymentType("cod");
    setNotes("");
    setLineItems([]);
    setProductSearch("");
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim() || lineItems.length === 0) {
      return;
    }

    const data: ManualOrderData = {
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim() || undefined,
      payment_type: paymentType,
      notes: notes.trim() || undefined,
      items: lineItems.map((item) => ({
        product_id: item.product.id,
        variant_id: item.variant.id,
        title: item.product.title,
        variant_title: item.variant.title,
        sku: item.variant.sku,
        quantity: item.quantity,
        price: item.variant.price || 0,
        total: (item.variant.price || 0) * item.quantity,
      })),
      total_amount: totalAmount,
      subtotal,
      currency: "INR",
    };

    await onSubmit(data);
    resetForm();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const isValid = customerName.trim() && customerPhone.trim() && lineItems.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Add Order Manually
          </DialogTitle>
          <DialogDescription>
            Create a new order by selecting products and entering customer details.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4">
          {/* Left: Product Selection */}
          <div className="flex flex-col border rounded-lg overflow-hidden">
            <div className="p-3 border-b bg-muted/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <ScrollArea className="flex-1 h-[300px]">
              {productsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                  <Package className="h-8 w-8 mb-2" />
                  <p className="text-sm text-center">
                    {products.length === 0
                      ? "No products synced yet. Sync products from your commerce platform first."
                      : "No products match your search."}
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg overflow-hidden">
                      <div className="p-2 bg-muted/20">
                        <p className="text-sm font-medium truncate">{product.title}</p>
                        {product.vendor && (
                          <p className="text-xs text-muted-foreground">{product.vendor}</p>
                        )}
                      </div>
                      <div className="p-2 space-y-1">
                        {product.variants.map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => addProduct(product, variant)}
                            className="w-full flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors text-left"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-foreground truncate">
                                {variant.title || "Default"}
                              </p>
                              {variant.sku && (
                                <p className="text-xs text-muted-foreground">
                                  SKU: {variant.sku}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <span className="text-sm font-medium">
                                ₹{variant.price?.toFixed(2) || "0.00"}
                              </span>
                              <Plus className="h-4 w-4 text-primary" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right: Order Details */}
          <div className="flex flex-col space-y-4 overflow-y-auto">
            {/* Customer Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Customer Details</h4>
              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label htmlFor="customer_name">Name *</Label>
                  <Input
                    id="customer_name"
                    placeholder="Customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="customer_phone">Phone *</Label>
                  <Input
                    id="customer_phone"
                    placeholder="+91 XXXXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="customer_email">Email (optional)</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    placeholder="customer@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="payment_type">Payment Type *</Label>
                  <Select value={paymentType} onValueChange={(v) => setPaymentType(v as PaymentType)}>
                    <SelectTrigger id="payment_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cod">Cash on Delivery (COD)</SelectItem>
                      <SelectItem value="prepaid">Prepaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Selected Items */}
            <div className="flex-1 space-y-2">
              <h4 className="text-sm font-medium">
                Order Items ({lineItems.length})
              </h4>
              {lineItems.length === 0 ? (
                <div className="border border-dashed rounded-lg p-4 text-center text-muted-foreground">
                  <Package className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm">Select products from the left panel</p>
                </div>
              ) : (
                <ScrollArea className="h-[150px]">
                  <div className="space-y-2 pr-2">
                    {lineItems.map((item) => (
                      <div
                        key={item.variant.id}
                        className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="text-sm font-medium truncate">
                            {item.product.title}
                          </p>
                          {item.variant.title && (
                            <p className="text-xs text-muted-foreground">
                              {item.variant.title}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border rounded">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.variant.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.variant.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm font-medium w-20 text-right">
                            ₹{((item.variant.price || 0) * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeItem(item.variant.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span className="text-lg">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
