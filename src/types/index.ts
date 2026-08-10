export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  parentId?: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  status: 'active' | 'inactive';
  productCount: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  images: string[];
  description: string;
  specs: ProductSpec[];
  rating: number;
  reviewCount: number;
  stock: number;
  status: 'active' | 'inactive';
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  authorName: string;
  rating: number;
  text: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'assembling'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  deliveryMethod: 'delivery' | 'pickup';
  paymentMethod: 'cash' | 'transfer' | 'online';
  address?: string;
  district?: string;
  comment?: string;
  status: OrderStatus;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  registeredAt: string;
  orderCount: number;
  totalSpent: number;
}

export interface Promotion {
  id: string;
  name: string;
  discount: number;
  startDate: string;
  endDate: string;
  productIds: string[];
  status: 'active' | 'inactive';
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  order: number;
  status: 'active' | 'inactive';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutForm {
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp?: string;
  address: string;
  district: string;
  comment?: string;
  deliveryMethod: 'delivery' | 'pickup';
  paymentMethod: 'cash' | 'transfer' | 'online';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'user' | 'admin';
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'New',
  confirmed: 'Confirmed',
  assembling: 'Assembling',
  ready: 'Ready for Delivery',
  delivering: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-cyan-100 text-cyan-700',
  assembling: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-purple-100 text-purple-700',
  delivering: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};
