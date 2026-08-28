export type ShoppingProfile = "economic" | "balanced" | "practical";
export type InventoryStatus = "in_stock" | "low" | "out";
export type ShoppingPriority = "essential" | "necessary" | "desirable" | "optional";
export type PriceSourceType = "manual" | "api";

export interface PriceObservation {
  productId: string;
  storeLocationId: string;
  price: number;
  unitPrice?: number;
  sourceType: PriceSourceType;
  sourceRef?: string;
  confidence?: number;
  observedAt: string;
  validUntil: string;
}

export interface PriceProvider {
  readonly id: string;
  search(input: {
    productName: string;
    brand?: string;
    city: string;
  }): Promise<PriceObservation[]>;
}

export interface AIProvider {
  readonly id: string;
  execute<TOutput>(input: {
    instruction: string;
    context: unknown;
  }): Promise<TOutput>;
}
