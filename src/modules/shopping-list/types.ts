export type ShoppingPriority = "essential" | "necessary" | "desirable" | "optional";
export type ShoppingListStatus = "draft" | "active" | "completed" | "cancelled";

export type ShoppingListItem = {
  id: string;
  shopping_list_id: string;
  product_id: string;
  quantity: number;
  unit: string | null;
  priority: ShoppingPriority;
  expected_price: number | null;
  actual_price: number | null;
  checked: boolean;
  products: {
    id: string;
    name: string;
    brand: string | null;
    package_quantity: number | null;
    package_unit: string | null;
  } | null;
};

export type ShoppingList = {
  id: string;
  household_id: string;
  budget: number | null;
  planned_days: number | null;
  status: ShoppingListStatus;
  shopping_list_items: ShoppingListItem[];
};
