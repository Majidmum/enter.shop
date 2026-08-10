import { create } from 'zustand';
import type { Order, OrderStatus, OrderItem } from '@/types';
import { orders as initialOrders } from '@/lib/mockData';

interface OrdersState {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'date' | 'status'>) => Order;
  updateStatus: (orderId: string, status: OrderStatus) => void;
  getOrdersByCustomer: (customerId: string) => Order[];
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: initialOrders,

  addOrder: (data) => {
    const order: Order = {
      ...data,
      id: `o_${Date.now()}`,
      orderNumber: `ORD-${String(get().orders.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'new',
    };
    set((state) => ({ orders: [order, ...state.orders] }));
    return order;
  },

  updateStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    }));
  },

  getOrdersByCustomer: (customerId) =>
    get().orders.filter((o) => o.customerId === customerId),
}));

export type { OrderItem };
