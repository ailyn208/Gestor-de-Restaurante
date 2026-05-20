export type DishCategory = 'Entrada' | 'Plato Fuerte' | 'Bebida' | 'Postre';

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: DishCategory;
  isAvailable: boolean;
  preparationTime: number; // in minutes
}

export type StaffRole = 'Chef' | 'Mesero' | 'Cajero' | 'Administrador';
export type StaffStatus = 'Activo' | 'Descanso' | 'Inactivo';

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  status: StaffStatus;
  phone: string;
  email: string;
  activeOrdersCount: number;
  password?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  visits: number;
  points: number;
}

export type TableStatus = 'Libre' | 'Ocupada' | 'Esperando' | 'Servida';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
}

export interface OrderItem {
  id: string;
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  status: 'Pendiente' | 'Preparando' | 'Listo' | 'Servido';
}

export type OrderStatus = 'Pendiente' | 'Preparando' | 'Listo' | 'Servido' | 'Pagado' | 'Cancelado';

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  customerId?: string;
  customerName?: string;
  waiterId: string;
  waiterName: string;
  items: OrderItem[];
  status: OrderStatus;
  notes?: string;
  subtotal: number;
  tip: number;
  total: number;
  createdAt: string;
  paidAt?: string;
  paymentMethod?: 'Efectivo' | 'Tarjeta' | 'Transferencia';
}

export interface StoreState {
  dishes: Dish[];
  staff: Staff[];
  customers: Customer[];
  tables: Table[];
  orders: Order[];
}
