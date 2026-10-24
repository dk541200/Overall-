import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatMoney,
  filterProducts,
  validatePreOrder,
  generateWhatsAppMessage,
  calculateDashboardMetrics,
} from './autoflux.ts';
import type { Product, PreOrder } from '../types/index.ts';

const mockProducts: Product[] = [
  {
    id: 1,
    brand: 'RoadForm',
    name: 'Sport Alloy Wheel — 17 inch',
    cat: 'Exterior',
    price: 8990,
    old: 10990,
    tag: 'Popular',
    img: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc',
    desc: 'Sport-inspired wheel style. Confirm wheel size.',
    fit: 'Requires exact wheel specifications.',
  },
  {
    id: 2,
    brand: 'GripCraft',
    name: 'Premium Steering Cover',
    cat: 'Interior',
    price: 799,
    old: 1099,
    tag: 'Bestseller',
    img: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16',
    desc: 'Comfort-focused steering cover in sporty finish.',
    fit: 'Measure steering wheel diameter.',
  },
];

test('formatMoney formats amounts into Indian Rupees correctly', () => {
  assert.equal(formatMoney(8990), '₹8,990');
  assert.equal(formatMoney(799), '₹799');
  assert.equal(formatMoney(0), '₹0');
});

test('filterProducts filters by category accurately', () => {
  const interior = filterProducts(mockProducts, 'Interior', '');
  assert.equal(interior.length, 1);
  assert.equal(interior[0].brand, 'GripCraft');

  const exterior = filterProducts(mockProducts, 'Exterior', '');
  assert.equal(exterior.length, 1);
  assert.equal(exterior[0].name, 'Sport Alloy Wheel — 17 inch');
});

test('filterProducts filters by search query matching name or brand', () => {
  const searched = filterProducts(mockProducts, '', 'wheel');
  assert.equal(searched.length, 1);
  assert.equal(searched[0].id, 1);

  const searchedBrand = filterProducts(mockProducts, '', 'gripcraft');
  assert.equal(searchedBrand.length, 1);
  assert.equal(searchedBrand[0].id, 2);
});

test('validatePreOrder correctly checks required fields and formats', () => {
  const invalid = validatePreOrder({
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    customerName: '',
    customerPhone: '',
    preferredDate: '',
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.vehicleType);
  assert.ok(invalid.errors.customerPhone);

  const valid = validatePreOrder({
    vehicleType: 'Car',
    vehicleMake: 'Honda',
    vehicleModel: 'City',
    customerName: 'Alex Mercer',
    customerPhone: '+919876543210',
    preferredDate: '2026-11-01',
  });
  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('generateWhatsAppMessage contains order details', () => {
  const order: PreOrder = {
    id: 'AF-123456',
    product: 'Sport Alloy Wheel',
    price: 8990,
    vehicle: 'Car · Honda City',
    year: '2023',
    date: '2026-11-01',
    time: 'Morning',
    name: 'Alex Mercer',
    phone: '+919876543210',
    notes: 'Gloss black finish preferred',
    status: 'Pending',
  };

  const message = generateWhatsAppMessage(order);
  assert.ok(message.includes('AF-123456'));
  assert.ok(message.includes('Sport Alloy Wheel'));
  assert.ok(message.includes('₹8,990'));
  assert.ok(message.includes('Alex Mercer'));
});

test('calculateDashboardMetrics calculates counts from actual stored arrays', () => {
  const testProducts: Product[] = [
    { ...mockProducts[0], listingType: 'part' },
    { ...mockProducts[1], listingType: 'used', cat: 'Used Vehicles' },
  ];
  const testOrders: PreOrder[] = [
    {
      id: 'AF-1',
      product: 'Wheel',
      price: 8990,
      vehicle: 'Car',
      date: '2026-11-01',
      time: 'Morning',
      name: 'User 1',
      phone: '123',
      status: 'Confirmed',
    },
    {
      id: 'AF-2',
      product: 'Cover',
      price: 799,
      vehicle: 'Bike',
      date: '2026-11-02',
      time: 'Evening',
      name: 'User 2',
      phone: '456',
      status: 'Request saved on this device',
    },
  ];
  const testChats = [
    { problem: 'starting', title: 'Starting', messages: [] },
  ];

  const metrics = calculateDashboardMetrics(testProducts, testOrders, testChats as any);
  assert.equal(metrics.totalProducts, 2);
  assert.equal(metrics.usedVehicles, 1);
  assert.equal(metrics.newParts, 1);
  assert.equal(metrics.totalOrders, 2);
  assert.equal(metrics.confirmedOrders, 1);
  assert.equal(metrics.pendingOrders, 1);
  assert.equal(metrics.totalChats, 1);
});
