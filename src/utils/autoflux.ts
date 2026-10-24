import type { Product, PreOrder, MechanicChat } from '../types/index.ts';

/**
 * Format currency in Indian Rupee format
 */
export function formatMoney(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

/**
 * Filter products by category and search keyword
 */
export function filterProducts(
  products: Product[],
  categoryFilter: string,
  searchQuery: string
): Product[] {
  let filtered = [...products];

  if (categoryFilter && categoryFilter.trim() !== '' && categoryFilter !== 'All') {
    filtered = filtered.filter(
      (p) => p.cat.toLowerCase() === categoryFilter.trim().toLowerCase()
    );
  }

  const query = searchQuery ? searchQuery.trim().toLowerCase() : '';
  if (query) {
    filtered = filtered.filter((p) => {
      const matchName = (p.name || '').toLowerCase().includes(query);
      const matchBrand = (p.brand || '').toLowerCase().includes(query);
      const matchCat = (p.cat || '').toLowerCase().includes(query);
      const matchDesc = (p.desc || '').toLowerCase().includes(query);
      return matchName || matchBrand || matchCat || matchDesc;
    });
  }

  return filtered;
}

export interface PreOrderInput {
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: string | number;
  customerName: string;
  customerPhone: string;
  preferredDate: string;
  preferredTime?: string;
  notes?: string;
}

/**
 * Validates pre-order form submission
 */
export function validatePreOrder(input: PreOrderInput): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!input.vehicleType || !input.vehicleType.trim()) {
    errors.vehicleType = 'Please select your vehicle type';
  }
  if (!input.vehicleMake || !input.vehicleMake.trim()) {
    errors.vehicleMake = 'Please specify vehicle make/brand';
  }
  if (!input.vehicleModel || !input.vehicleModel.trim()) {
    errors.vehicleModel = 'Please specify vehicle model/variant';
  }
  if (!input.customerName || !input.customerName.trim()) {
    errors.customerName = 'Please enter your full name';
  }
  if (!input.customerPhone || !input.customerPhone.trim()) {
    errors.customerPhone = 'Please enter your contact phone number';
  } else if (!/^[0-9+\s\-()]{7,15}$/.test(input.customerPhone.trim())) {
    errors.customerPhone = 'Please enter a valid phone number';
  }
  if (!input.preferredDate || !input.preferredDate.trim()) {
    errors.preferredDate = 'Please select a preferred date';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generates formatted WhatsApp export message for pre-order requests
 */
export function generateWhatsAppMessage(order: PreOrder): string {
  const lines = [
    'Hello, I would like to request a PRE-ORDER / availability check.',
    `Request ID: ${order.id}`,
    `Product: ${order.product}`,
    `Listed price: ${formatMoney(order.price)} (please confirm)`,
    `Vehicle: ${order.vehicle}${order.year ? ' (' + order.year + ')' : ''}`,
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    `Preferred date: ${order.date}`,
    `Preferred time: ${order.time || 'Any convenient time'}`,
    `Notes: ${order.notes || 'None'}`,
    'Please confirm compatibility, availability, final price and next steps.',
  ];

  return lines.join('\n');
}

/**
 * Calculates live admin dashboard metrics from stored data
 */
export function calculateDashboardMetrics(
  products: Product[],
  orders: PreOrder[],
  chats: MechanicChat[]
) {
  const usedVehicles = products.filter(
    (p) => p.listingType === 'used' || p.cat === 'Used Vehicles'
  ).length;
  const newParts = products.length - usedVehicles;
  const confirmedOrders = orders.filter((o) => o.status === 'Confirmed').length;
  const pendingOrders = orders.length - confirmedOrders;

  return {
    totalProducts: products.length,
    usedVehicles,
    newParts,
    totalOrders: orders.length,
    pendingOrders,
    confirmedOrders,
    totalChats: chats.length,
  };
}
