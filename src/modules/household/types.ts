export const PRODUCT_UNITS = ["kg", "g", "l", "ml", "unit", "roll", "package"] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];
export type InventoryStatus = "in_stock" | "low" | "out";
export type ShoppingProfile = "economic" | "balanced" | "practical";

export type HouseholdProduct = {
  id: string;
  name: string;
  brand: string | null;
  package_quantity: number | null;
  package_unit: ProductUnit | null;
  locked: boolean;
  inventory_items: Array<{
    id: string;
    registered_quantity: number;
    estimated_quantity: number | null;
    unit: ProductUnit | null;
    status: InventoryStatus;
  }>;
};
