// TypeScript types matching Django backend models

export type UserRole = 'SUPER_ADMIN' | 'SELLER_ADMIN' | 'YARD_OPERATOR' | 'BUYER' | 'INSPECTOR';

export interface Organization {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  org: number;  // Organization ID
  org_name?: string;  // Optional, populated by serializer
  phone?: string;
}

export type BoxStatus = 'WIP' | 'FINALIZED';

export interface Box {
  id: number;
  org: number;  // Organization ID
  box_number: string;
  name: string;
  status: BoxStatus;
  gross_weight_lbs: number | null;
  tare_weight_lbs: number | null;
  net_weight_lbs?: number | null;  // Calculated field
  photo_main?: string | null;
  photo_overall?: string | null;
  photo_weight_ticket?: string | null;
  created_by: number;  // User ID
  created_by_name?: string;  // Optional, populated by serializer
  created_at: string;
  updated_at: string;
  parts_count?: number;  // Optional, populated by serializer
}

export type PartMaterialType = 'FERROUS' | 'NON_FERROUS' | 'ALUMINUM' | 'COPPER' | 'BRASS' | 'STAINLESS' | 'MIXED' | 'OTHER';
export type PartCondition = 'CLEAN' | 'CONTAMINATED' | 'MIXED';

export interface Part {
  id: number;
  box: number;  // Box ID
  material_type: PartMaterialType;
  part_type: string;
  weight_lbs: number;
  condition: PartCondition;
  notes?: string;
  photo?: string | null;
  created_at: string;
  updated_at: string;
}

export type SaleType = 'SEALED_BID' | 'OPEN_AUCTION';
export type SaleStatus = 'DRAFT' | 'OPEN' | 'CLOSED';

export interface Sale {
  id: number;
  org: number;  // Seller Organization ID
  org_name?: string;  // Optional, populated by serializer
  box: number;  // Box ID
  box_details?: Box;  // Optional, populated by serializer
  title: string;
  description?: string;
  sale_type: SaleType;
  status: SaleStatus;
  reserve_price_usd: number | null;
  starting_bid_usd?: number | null;
  current_high_bid_usd?: number | null;  // Populated by serializer
  bid_count?: number;  // Populated by serializer
  opens_at: string;
  closes_at: string;
  created_at: string;
  updated_at: string;
}

export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Bid {
  id: number;
  sale: number;  // Sale ID
  bidder: number;  // User ID (buyer)
  bidder_name?: string;  // Optional, populated by serializer
  bidder_org?: number;  // Organization ID
  bidder_org_name?: string;  // Optional, populated by serializer
  amount_usd: number;
  status: BidStatus;
  created_at: string;
  updated_at: string;
}

// Auth response types
export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// API request types
export interface BoxCreateRequest {
  box_number: string;
  name: string;
  gross_weight_lbs?: number | null;
  tare_weight_lbs?: number | null;
}

export interface PartCreateRequest {
  box: number;
  material_type: PartMaterialType;
  part_type: string;
  weight_lbs: number;
  condition: PartCondition;
  notes?: string;
}

export interface SaleCreateRequest {
  box: number;
  title: string;
  description?: string;
  sale_type: SaleType;
  reserve_price_usd?: number | null;
  starting_bid_usd?: number | null;
  opens_at: string;
  closes_at: string;
}

export interface BidCreateRequest {
  sale: number;
  amount_usd: number;
}
