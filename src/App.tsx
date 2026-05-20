import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  UtensilsCrossed, 
  BookOpen, 
  Users, 
  UserCircle2, 
  Clock, 
  DollarSign, 
  CalendarDays,
  Menu,
  X,
  LogIn
} from 'lucide-react';

import { Dish, Staff, Customer, Table, Order, OrderStatus, TableStatus } from './types';
import { 
  INITIAL_DISHES, 
  INITIAL_STAFF, 
  INITIAL_CUSTOMERS, 
  INITIAL_TABLES, 
  INITIAL_ORDERS 
} from './initialData';

// Subcomponents
import { DashboardView } from './components/DashboardView';
import { ComandasView } from './components/ComandasView';
import { MenuManagementView } from './components/MenuManagementView';
import { StaffManagementView } from './components/StaffManagementView';
import { CustomerManagementView } from './components/CustomerManagementView';

export default function App() {
  // --- LOCAL PERSISTENCE LOADER ---
  const [dishes, setDishes] = useState<Dish[]>(() => {
    const saved = localStorage.getItem('rest_dishes');
    return saved ? JSON.parse(saved) : INITIAL_DISHES;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('rest_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('rest_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('rest_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('rest_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // --- AUTH SELECTION STATE ---
  const [currentUser, setCurrentUser] = useState<Staff | null>(() => {
    const saved = localStorage.getItem('rest_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) {
        return null;
      }
    }
    // Return Admin user by default to keep the application instantly discoverable!
    return INITIAL_STAFF[0];
  });

  // --- SAVE TO LOCALSTORAGE ---
  useEffect(() => {
    localStorage.setItem('rest_dishes', JSON.stringify(dishes));
  }, [dishes]);

  useEffect(() => {
    localStorage.setItem('rest_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('rest_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('rest_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('rest_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('rest_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('rest_current_user');
    }
  }, [currentUser]);

  // --- TAB NAVIGATION STATE ---
  const [activeTab, setActiveTab] = useState<string>('Resumen');
  const [selectedTableIdForOrder, setSelectedTableIdForOrder] = useState<string | undefined>(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Force Tab to active 'Comandas' for Waiters
  useEffect(() => {
    if (currentUser?.role === 'Mesero' && activeTab !== 'Comandas') {
      setActiveTab('Comandas');
    }
  }, [currentUser, activeTab]);

  // UTC clock simulation
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- STATE MODIFIER ACTIONS ---

  // Dishes
  const handleAddDish = (newDish: Dish) => {
    setDishes([newDish, ...dishes]);
  };

  const handleUpdateDish = (updatedDish: Dish) => {
    setDishes(dishes.map(d => d.id === updatedDish.id ? updatedDish : d));
  };

  const handleDeleteDish = (dishId: string) => {
    setDishes(dishes.filter(d => d.id !== dishId));
  };

  // Staff
  const handleAddStaff = (newStaff: Staff) => {
    setStaff([newStaff, ...staff]);
  };

  const handleUpdateStaff = (updatedStaff: Staff) => {
    setStaff(staff.map(s => s.id === updatedStaff.id ? updatedStaff : s));
  };

  const handleDeletStaff = (staffId: string) => {
    setStaff(staff.filter(s => s.id !== staffId));
  };

  // Customers
  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers([newCustomer, ...customers]);
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers(customers.filter(c => c.id !== customerId));
  };

  const handleAddCustomerPoints = (customerId: string, pointsToAdd: number) => {
    setCustomers(customers.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          points: c.points + pointsToAdd,
          visits: c.visits + 1
        };
      }
      return c;
    }));
  };

  // Tables
  const handleUpdateTableStatus = (tableId: string, status: TableStatus) => {
    setTables(tables.map(t => t.id === tableId ? { ...t, status } : t));
  };

  // Orders
  const handleAddOrder = (newOrder: Order) => {
    setOrders([newOrder, ...orders]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        // Also update items state dynamically
        const updatedItems = order.items.map(item => {
          let nextItemStatus = item.status;
          if (status === 'Listo') nextItemStatus = 'Listo';
          else if (status === 'Servido') nextItemStatus = 'Servido';
          else if (status === 'Preparando') nextItemStatus = 'Preparando';
          return { ...item, status: nextItemStatus };
        });

        return { 
          ...order, 
          status,
          items: updatedItems
        };
      }
      return order;
    }));
  };

  const handlePayOrder = (orderId: string, paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia', finalTip: number) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'Pagado',
          tip: finalTip,
          total: order.subtotal + finalTip,
          paymentMethod,
          paidAt: new Date().toISOString()
        };
      }
      return order;
    }));
  };

  // Helper action: click a table on Dashboard Map to jump to order taking
  const handleSelectTableFromDashboard = (tableId: string) => {
    setSelectedTableIdForOrder(tableId);
    setActiveTab('Comandas');
  };

  if (!currentUser) {
    return <AuthScreen staff={staff} onLogin={setCurrentUser} onRegisterStaff={handleAddStaff} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans" id="app-root-shell">
      {/* 🚀 RESPONSIVE MOBILE MENU BAR */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-3 flex justify-between items-center z-45" id="mobile-top-bar">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍽️</span>
          <span className="font-display font-black text-sm tracking-tight">Kulinario Gestor</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white hover:text-slate-300 p-1 cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 🧭 NAVIGATION SIDEBAR (LEFT) */}
      <aside 
        className={`bg-slate-900 text-slate-300 w-full lg:w-72 shrink-0 flex flex-col justify-between p-6 z-40 transition-all duration-300 lg:translate-x-0 ${
          isMobileMenuOpen 
            ? 'fixed inset-y-0 left-0 translate-x-0' 
            : 'fixed lg:relative inset-y-0 left-0 -translate-x-full lg:translate-x-0'
        }`}
        id="side-navigator"
      >
        <div className="space-y-8">
          {/* Brand header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🍽️</span>
              <div>
                <h1 className="font-display font-black text-lg text-white leading-tight tracking-tight">Kulinario</h1>
                <span className="text-[10px] uppercase tracking-widest text-slate-450 font-bold font-mono">Restaurante ERP</span>
              </div>
            </div>
            <button 
              className="lg:hidden text-slate-450 hover:text-white p-1 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active User Card badge */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 flex items-center justify-between gap-3 text-xs" id="active-user-badge">
            <div className="flex items-center gap-2 truncate">
              <div className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold shrink-0">
                {currentUser?.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="font-bold text-white leading-tight truncate">{currentUser?.name}</p>
                <span className="text-[9px] font-mono leading-none bg-amber-500/10 text-amber-400 border border-amber-950/40 px-1 py-0.5 rounded font-bold uppercase block mt-1 w-max">
                  {currentUser?.role}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('¿Deseas cerrar tu sesión actual?')) {
                  setCurrentUser(null);
                }
              }}
              className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
              title="Cerrar Sesión"
              id="sidebar-logout-btn"
            >
              <LogIn className="w-3.5 h-3.5 rotate-180 text-rose-400" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="space-y-1" id="nav-links-box">
            {[
              { name: 'Resumen', label: 'Dashboard / Resumen', icon: BarChart3, roles: ['Administrador', 'Chef', 'Cajero'] },
              { name: 'Comandas', label: 'Comandas y Cobros', icon: UtensilsCrossed, roles: ['Administrador', 'Chef', 'Cajero', 'Mesero'] },
              { name: 'Platillos', label: 'Carta y Menú', icon: BookOpen, roles: ['Administrador', 'Chef'] },
              { name: 'Personal', label: 'Plantilla de Personal', icon: Users, roles: ['Administrador'] },
              { name: 'Clientes', label: 'Club de Clientes', icon: UserCircle2, roles: ['Administrador', 'Cajero'] },
            ].filter(tab => !tab.roles || !currentUser || tab.roles.includes(currentUser.role)).map(tab => {
              const IconComp = tab.icon;
              const isSelected = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => {
                    setActiveTab(tab.name);
                    setIsMobileMenuOpen(false);
                    if (tab.name !== 'Comandas') {
                      setSelectedTableIdForOrder(undefined);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-650 text-white shadow-md shadow-indigo-900/20'
                      : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
                  }`}
                  id={`nav-link-${tab.name}`}
                >
                  <IconComp className="w-4.5 h-4.5 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Info Box Footer */}
        <div className="border-t border-slate-800 pt-5 mt-8 space-y-4 text-xs font-mono" id="nav-footer-box">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-sans">Sistema:</span>
            <span className="bg-emerald-500/10 text-emerald-450 border border-emerald-900/30 px-2 py-0.5 rounded-sm text-[10px] font-bold">
              ● SERVICIO ONLINE
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentTime} Local</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-[10px]">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>20-May-2026</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 🖥️ MAIN VIEW SHELL CONTROLLER (RIGHT) */}
      <main className="flex-1 flex flex-col min-w-0" id="main-view-layout">
        {/* UPPER HEADER */}
        <header className="bg-white border-b border-slate-100 py-5 px-6 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 shadow-2xs">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-800">
              {activeTab === 'Resumen' && 'Vista del Administrador'}
              {activeTab === 'Comandas' && 'Centro de Operaciones y Cobro'}
              {activeTab === 'Platillos' && 'Control del Catálogo Gastronómico'}
              {activeTab === 'Personal' && 'Gestión de la Ficha Laboral'}
              {activeTab === 'Clientes' && 'Registro de Fidelización'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeTab === 'Resumen' && 'Resumen global del día, ocupación de mesas e ingresos.'}
              {activeTab === 'Comandas' && 'Crea comandas de mesero, progresa cocciones en cocina y procesa cierres de cuenta.'}
              {activeTab === 'Platillos' && 'Añadir platillos, editar precios del menú, dar de baja existencias o ingredientes.'}
              {activeTab === 'Personal' && 'Miembros activos actualmente en plantilla, turnos de meseros y chefs.'}
              {activeTab === 'Clientes' && 'Consultas de puntos acumulados en el Club de Lealtad por cada consumo asignado.'}
            </p>
          </div>

          {/* Quick stats tags */}
          <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-xs">
            <div className="bg-slate-50 border border-slate-105 rounded-xl px-3 py-1.5 text-slate-600 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Venta Cerrada: <strong className="text-slate-800">${orders.filter(o => o.status === 'Pagado').reduce((sum, o) => sum + o.total, 0).toLocaleString('es-MX', { minimumFractionDigits: 1 })}</strong></span>
            </div>
          </div>
        </header>

        {/* SCREEN SCROLL BODY */}
        <section className="flex-1 overflow-y-auto p-6 sm:p-8" id="scrolling-stage">
          {activeTab === 'Resumen' && (
            <DashboardView
              dishes={dishes}
              staff={staff}
              customers={customers}
              tables={tables}
              orders={orders}
              onSelectTable={handleSelectTableFromDashboard}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'Comandas' && (
            <ComandasView
              dishes={dishes}
              staff={staff}
              customers={customers}
              tables={tables}
              orders={orders}
              onAddOrder={handleAddOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdateTableStatus={handleUpdateTableStatus}
              onPayOrder={handlePayOrder}
              onAddCustomerPoints={handleAddCustomerPoints}
              selectedTableIdFromDashboard={selectedTableIdForOrder}
              onClearSelectedTableId={() => setSelectedTableIdForOrder(undefined)}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'Platillos' && (
            <MenuManagementView
              dishes={dishes}
              onAddDish={handleAddDish}
              onUpdateDish={handleUpdateDish}
              onDeleteDish={handleDeleteDish}
            />
          )}

          {activeTab === 'Personal' && (
            <StaffManagementView
              staffList={staff}
              onAddStaff={handleAddStaff}
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeletStaff}
            />
          )}

          {activeTab === 'Clientes' && (
            <CustomerManagementView
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}
        </section>
      </main>
    </div>
  );
}

interface AuthScreenProps {
  staff: Staff[];
  onLogin: (user: Staff) => void;
  onRegisterStaff: (waiter: Staff) => void;
}

function AuthScreen({ staff, onLogin, onRegisterStaff }: AuthScreenProps) {
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Search for matching credentials
    const foundUser = staff.find(
      s => s.email.toLowerCase() === loginEmail.trim().toLowerCase() && 
      (s.password === loginPassword || (!s.password && loginPassword === '1234'))
    );

    if (foundUser) {
      if (foundUser.status === 'Inactivo') {
        setLoginError('Esta cuenta se encuentra inactiva. Contacta al administrador.');
        return;
      }
      onLogin(foundUser);
    } else {
      setLoginError('Credenciales incorrectas. Intenta de nuevo o ingresa con un usuario de muestra.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    // Check if email already registered
    const emailExists = staff.some(s => s.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (emailExists) {
      alert('Este correo electrónico ya está registrado en el restaurante.');
      return;
    }

    // Create new waiter account
    const newWaiter: Staff = {
      id: 's_self_' + Math.floor(Math.random() * 100000),
      name: regName.trim(),
      role: 'Mesero',
      status: 'Activo',
      phone: regPhone.trim() || 'Sin registrar',
      email: regEmail.trim(),
      activeOrdersCount: 0,
      password: regPassword
    };

    onRegisterStaff(newWaiter);
    alert('¡Cuenta de Mesero creada con éxito! Iniciando sesión...');
    onLogin(newWaiter);
  };

  const triggerQuickLogin = (email: string, pass: string) => {
    const found = staff.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (found) {
      onLogin(found);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden" id="auth-screen-layout">
      {/* Aurora glow effect mesh background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[150px] -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-pink-500/10 blur-[150px] -z-10" />

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-8 rounded-3xl shadow-2xl space-y-6 animate-fade-in" id="auth-card">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-2xl shadow-lg shadow-orange-500/20">
            🍽️
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-white tracking-tight leading-none mt-2">Kulinario ERP</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Portal de Acceso del Personal</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 bg-white/5 rounded-xl p-1 border border-white/5" id="auth-tabs">
          <button
            onClick={() => { setActiveMode('login'); setLoginError(''); }}
            className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeMode === 'login'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setActiveMode('register'); setLoginError(''); }}
            className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeMode === 'register'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Registrar Mesero
          </button>
        </div>

        {loginError && (
          <div className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs py-2.5 px-3 rounded-lg flex items-center gap-2 animate-pulse" id="login-error-msg">
            <span className="shrink-0 text-sm">⚠</span>
            <p className="font-medium text-left">{loginError}</p>
          </div>
        )}

        {activeMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Correo Electrónico / Email</label>
              <input
                type="email"
                required
                placeholder="p. ej. carlos.g@restaurante.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full text-sm rounded-xl border border-white/10 p-3 bg-white/5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contraseña o PIN</label>
                <span className="text-[9px] text-slate-500 lowercase">Por defecto: 1234 u admin</span>
              </div>
              <input
                type="password"
                required
                placeholder="Ingresa tu clave / PIN"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full text-sm rounded-xl border border-white/10 p-3 bg-white/5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-indigo-950/40 cursor-pointer text-center mt-2 uppercase tracking-wider"
              id="submit-login-btn"
            >
              Ingresar al ERP
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4" id="register-form">
            <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-left">
              <span className="text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Módulo de Auto-Registro
              </span>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">Crea tu credencial de Mesero para ingresar al piso y comenzar a comandar con rol restringido.</p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombre Completo *</label>
              <input
                type="text"
                required
                placeholder="p. ej. Carlos Gómez"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                className="w-full text-sm rounded-xl border border-white/10 p-3 bg-white/5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teléfono / Celular</label>
                <input
                  type="tel"
                  placeholder="5512345678"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  className="w-full text-sm rounded-xl border border-white/10 p-3 bg-white/5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contraseña / PIN *</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 4 digitos"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full text-sm rounded-xl border border-white/10 p-3 bg-white/5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Correo Electrónico (Login) *</label>
              <input
                type="email"
                required
                placeholder="mesero.nuevo@restaurante.com"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                className="w-full text-sm rounded-xl border border-white/10 p-3 bg-white/5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-orange-950/40 cursor-pointer text-center uppercase tracking-wider"
              id="submit-register-btn"
            >
              Completar Registro y Entrar
            </button>
          </form>
        )}

        {/* Demo Fast Login preset accounts */}
        <div className="space-y-2 border-t border-white/5 pt-4" id="auth-quick-access">
          <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold font-mono block text-center">
            Prueba Rápida de Roles (Demostrador en un click)
          </span>
          <div className="grid grid-cols-2 gap-2 text-left">
            <button
              type="button"
              onClick={() => triggerQuickLogin('admin@kulinario.com', 'admin')}
              className="p-2.5 border border-indigo-500/15 hover:border-indigo-500/35 bg-indigo-550/5 hover:bg-indigo-550/10 text-indigo-200 rounded-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full">
                <span className="uppercase text-[7px] tracking-wider text-indigo-400 font-bold">Administrador</span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              </div>
              <span className="text-[10px] mt-1 font-sans truncate font-bold text-indigo-100">admin@kulinario.com</span>
              <span className="text-[8px] text-slate-500 font-mono mt-0.5 font-bold">PIN: admin (Ver Todo)</span>
            </button>

            <button
              type="button"
              onClick={() => triggerQuickLogin('carlos.g@restaurante.com', '1234')}
              className="p-2.5 border border-amber-500/15 hover:border-amber-500/35 bg-amber-550/5 hover:bg-amber-550/10 text-amber-200 rounded-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full">
                <span className="uppercase text-[7px] tracking-wider text-amber-400 font-bold">Mesero Restringido</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              </div>
              <span className="text-[10px] mt-1 font-sans truncate font-bold text-amber-100">carlos.g@restaurante.com</span>
              <span className="text-[8px] text-slate-500 font-mono mt-0.5 font-bold">PIN: 1234 (Solo Comanda y Cobro)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
