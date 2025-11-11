export interface User { id: number; username: string; email: string; first_name: string; last_name: string; role: 'SUPER_ADMIN' | 'SELLER_ADMIN' | 'YARD_OPERATOR' | 'BUYER'; organization: number; organization_name: string; }
export interface Box { id: number; box_number: string; name: string; status: 'IN_PROGRESS' | 'FINISHED'; gross_weight_lbs: number | null; tare_weight_lbs: number | null; net_weight_lbs: number | null; parts: Part[]; part_count: number; created_at: string; }
export interface Part { id: number; box: number; material_type: string; part_type: string; weight_lbs: number; condition: string; }
export interface Sale { id: number; title: string; status: string; boxes: Box[]; bid_count: number; }
export interface Bid { id: number; sale: number; amount: number; status: string; }
