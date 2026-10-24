export interface Product {
  id: number;
  brand: string;
  name: string;
  cat: string;
  price: number;
  old: number;
  tag?: string;
  img: string;
  desc: string;
  fit: string;
  listingType?: 'part' | 'used';
  year?: string | number;
  condition?: string;
}

export interface PreOrder {
  id: string;
  product: string;
  price: number;
  vehicle: string;
  year?: string | number;
  date: string;
  time: string;
  name: string;
  phone: string;
  notes?: string;
  status: string;
  createdAt?: number;
}

export interface ChatMessage {
  from: 'customer' | 'mechanic';
  text: string;
  timestamp?: string;
}

export interface MechanicChat {
  problem: string;
  title: string;
  messages: ChatMessage[];
}

export type CustomerPage = 'home' | 'orders' | 'mechanic';

export type AdminTab = 'dashboard' | 'add' | 'listings' | 'orders' | 'chats' | 'settings';

export interface DashboardMetrics {
  totalProducts: number;
  usedVehicles: number;
  newParts: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  totalChats: number;
}
