import { Dish, Staff, Customer, Table, Order } from './types';

export const INITIAL_DISHES: Dish[] = [
  {
    id: 'd1',
    name: 'Guacamole con Totopos',
    description: 'Guacamole fresco hecho al momento con aguacates de Michoacán, cebolla, cilantro, serrano y totopos crujientes.',
    price: 135.00,
    category: 'Entrada',
    isAvailable: true,
    preparationTime: 8
  },
  {
    id: 'd2',
    name: 'Empanadas de Viento (3 pzas)',
    description: 'Empanadas fritas rellenas de queso fundido, espolvoreadas con azúcar fina y acompañadas de salsa picante.',
    price: 95.00,
    category: 'Entrada',
    isAvailable: true,
    preparationTime: 12
  },
  {
    id: 'd3',
    name: 'Tacos al Pastor (Orden de 5)',
    description: 'Clásicos tacos de carne de cerdo marinada al pastor, con piña, cebolla, cilantro y salsas de la casa en tortilla de maíz.',
    price: 150.00,
    category: 'Plato Fuerte',
    isAvailable: true,
    preparationTime: 10
  },
  {
    id: 'd4',
    name: 'Enchiladas Suizas',
    description: 'Tres enchiladas rellenas de pollo deshebrado, bañadas en salsa verde cremosa, gratinadas con queso manchego.',
    price: 185.00,
    category: 'Plato Fuerte',
    isAvailable: true,
    preparationTime: 15
  },
  {
    id: 'd5',
    name: 'Ribeye Premium (350g)',
    description: 'Corte de Ribeye de primera calidad cocinado al término deseado, acompañado de papas gajo sazonadas y chiles toreados.',
    price: 490.00,
    category: 'Plato Fuerte',
    isAvailable: true,
    preparationTime: 25
  },
  {
    id: 'd6',
    name: 'Hamburguesa de la Casa',
    description: 'Carne de res Angus (200g), queso cheddar fundido, tocino crujiente, cebolla caramelizada, lechuga, tomate y aderezo especial.',
    price: 210.00,
    category: 'Plato Fuerte',
    isAvailable: true,
    preparationTime: 15
  },
  {
    id: 'd7',
    name: 'Margarita Tradicional',
    description: 'Margarita clásica con Tequila reposado, licor de naranja, jugo de limón fresco, con escarchado de sal.',
    price: 120.00,
    category: 'Bebida',
    isAvailable: true,
    preparationTime: 5
  },
  {
    id: 'd8',
    name: 'Agua Fresca del Día (1L)',
    description: 'Agua fresca natural preparada con frutas de temporada. Pregunte por el sabor del día.',
    price: 55.00,
    category: 'Bebida',
    isAvailable: true,
    preparationTime: 3
  },
  {
    id: 'd9',
    name: 'Flan Napolitano Casero',
    description: 'Flan cremoso de vainilla horneado lentamente, bañado en caramelo dorado suave estilo tradicional.',
    price: 80.00,
    category: 'Postre',
    isAvailable: true,
    preparationTime: 5
  },
  {
    id: 'd10',
    name: 'Pastel de Tres Leches',
    description: 'Bizcocho ultra húmedo bañado en nuestra mezcla secreta de tres leches, decorado con crema batida y fruta de temporada.',
    price: 95.00,
    category: 'Postre',
    isAvailable: true,
    preparationTime: 4
  }
];

export const INITIAL_STAFF: Staff[] = [
  {
    id: 's_admin',
    name: 'Administrador General',
    role: 'Administrador',
    status: 'Activo',
    phone: '5599999999',
    email: 'admin@kulinario.com',
    activeOrdersCount: 0,
    password: 'admin'
  },
  {
    id: 's1',
    name: 'Carlos Gómez',
    role: 'Mesero',
    status: 'Activo',
    phone: '5512345678',
    email: 'carlos.g@restaurante.com',
    activeOrdersCount: 0,
    password: '1234'
  },
  {
    id: 's2',
    name: 'Ana Martínez',
    role: 'Mesero',
    status: 'Activo',
    phone: '5587654321',
    email: 'ana.m@restaurante.com',
    activeOrdersCount: 0,
    password: '1234'
  },
  {
    id: 's3',
    name: 'Chef Sofía Vargas',
    role: 'Chef',
    status: 'Activo',
    phone: '5523456789',
    email: 'sofia.v@restaurante.com',
    activeOrdersCount: 0,
    password: '1234'
  },
  {
    id: 's4',
    name: 'Chef Roberto Silva',
    role: 'Chef',
    status: 'Activo',
    phone: '5576543210',
    email: 'roberto.s@restaurante.com',
    activeOrdersCount: 0,
    password: '1234'
  },
  {
    id: 's5',
    name: 'Laura Ruiz (Cajera)',
    role: 'Cajero',
    status: 'Activo',
    phone: '5545678901',
    email: 'laura.r@restaurante.com',
    activeOrdersCount: 0,
    password: '1234'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Juan Pérez',
    phone: '5566778899',
    email: 'juan.perez@email.com',
    visits: 12,
    points: 240
  },
  {
    id: 'c2',
    name: 'María Rodríguez',
    phone: '5544332211',
    email: 'maria.rod@email.com',
    visits: 8,
    points: 160
  },
  {
    id: 'c3',
    name: 'Alejandro López',
    phone: '5511223344',
    email: 'ale.lopez@email.com',
    visits: 3,
    points: 40
  }
];

export const INITIAL_TABLES: Table[] = [
  { id: 't1', number: 1, capacity: 2, status: 'Libre' },
  { id: 't2', number: 2, capacity: 2, status: 'Libre' },
  { id: 't3', number: 3, capacity: 4, status: 'Libre' },
  { id: 't4', number: 4, capacity: 4, status: 'Libre' },
  { id: 't5', number: 5, capacity: 6, status: 'Libre' },
  { id: 't6', number: 6, capacity: 6, status: 'Libre' },
  { id: 't7', number: 7, capacity: 8, status: 'Libre' },
  { id: 't8', number: 8, capacity: 10, status: 'Libre' }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'o_sample1',
    tableId: 't3',
    tableNumber: 3,
    customerId: 'c1',
    customerName: 'Juan Pérez',
    waiterId: 's1',
    waiterName: 'Carlos Gómez',
    items: [
      { id: 'oi1', dishId: 'd3', name: 'Tacos al Pastor (Orden de 5)', price: 150.00, quantity: 2, status: 'Listo' },
      { id: 'oi2', dishId: 'd8', name: 'Agua Fresca del Día (1L)', price: 55.00, quantity: 1, status: 'Listo' }
    ],
    status: 'Listo',
    notes: 'Salsa roja aparte para los tacos.',
    subtotal: 355.00,
    tip: 35.50,
    total: 390.50,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45 mins ago
  },
  {
    id: 'o_sample2',
    tableId: 't5',
    tableNumber: 5,
    customerId: 'c2',
    customerName: 'María Rodríguez',
    waiterId: 's2',
    waiterName: 'Ana Martínez',
    items: [
      { id: 'oi3', dishId: 'd4', name: 'Enchiladas Suizas', price: 185.00, quantity: 1, status: 'Preparando' },
      { id: 'oi4', dishId: 'd7', name: 'Margarita Tradicional', price: 120.00, quantity: 2, status: 'Servido' }
    ],
    status: 'Preparando',
    notes: 'Enchiladas bien calientes.',
    subtotal: 425.00,
    tip: 42.50,
    total: 467.50,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString() // 20 mins ago
  }
];
