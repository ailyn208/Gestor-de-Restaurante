import React from 'react';
import { 
  TrendingUp, 
  Users, 
  ClipboardList, 
  DollarSign, 
  Utensils, 
  Clock, 
  ChefHat, 
  UserSquare2,
  AlertCircle
} from 'lucide-react';
import { Dish, Staff, Customer, Table, Order } from '../types';

interface DashboardViewProps {
  dishes: Dish[];
  staff: Staff[];
  customers: Customer[];
  tables: Table[];
  orders: Order[];
  onSelectTable: (tableId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  dishes,
  staff,
  customers,
  tables,
  orders,
  onSelectTable,
  onNavigateToTab,
}) => {
  // Calculations
  const activeOrders = orders.filter(o => o.status !== 'Pagado' && o.status !== 'Cancelado');
  const finishedOrders = orders.filter(o => o.status === 'Pagado');
  
  const dailySales = finishedOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingCollections = activeOrders.reduce((sum, order) => sum + order.total, 0);
  
  const occupiedTables = tables.filter(t => t.status !== 'Libre').length;
  const occupancyRate = tables.length > 0 ? Math.round((occupiedTables / tables.length) * 100) : 0;

  // Waiters and Chefs actives count
  const activeWaiters = staff.filter(s => s.role === 'Mesero' && s.status === 'Activo').length;
  const activeChefs = staff.filter(s => s.role === 'Chef' && s.status === 'Activo').length;

  // Kitchen items count currently preparing/pending
  const pendingKitchenItems = activeOrders.reduce((sum, order) => {
    return sum + order.items.filter(item => item.status === 'Pendiente' || item.status === 'Preparando').length;
  }, 0);

  // Top-selling dishes calculation
  const dishSalesMap: { [key: string]: { name: string, quantity: number, total: number } } = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!dishSalesMap[item.dishId]) {
        dishSalesMap[item.dishId] = { name: item.name, quantity: 0, total: 0 };
      }
      dishSalesMap[item.dishId].quantity += item.quantity;
      dishSalesMap[item.dishId].total += item.quantity * item.price;
    });
  });

  const topDishes = Object.values(dishSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 4);

  return (
    <div className="space-y-8" id="dashboard-container">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-metrics-grid">
        {/* Metric 1: Income */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 flex items-center justify-between" id="metric-ventas-dia">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ventas Cerradas</span>
            <h3 className="text-2xl font-bold text-slate-800 font-mono">
              ${dailySales.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-xs text-emerald-600 font-medium">+{finishedOrders.length} cuentas cobradas</span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Active Tickets */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 flex items-center justify-between" id="metric-comandas-activas">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cuentas Abiertas</span>
            <h3 className="text-2xl font-bold text-slate-800 font-mono">
              ${pendingCollections.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-xs text-amber-600 font-medium">{activeOrders.length} comandas en mesa</span>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Occupancy */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 flex items-center justify-between" id="metric-ocupacion-mesas">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ocupación de Mesas</span>
            <h3 className="text-2xl font-bold text-slate-800 font-mono">{occupancyRate}%</h3>
            <span className="text-xs text-slate-500">{occupiedTables} de {tables.length} mesas activas</span>
          </div>
          <div className="bg-sky-50 text-sky-600 p-3 rounded-xl">
            <Utensils className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Kitchen Queue */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 flex items-center justify-between" id="metric-cola-cocina">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Espera en Cocina</span>
            <h3 className="text-2xl font-bold text-slate-800 font-mono">{pendingKitchenItems} Platillos</h3>
            <span className="text-xs text-rose-500 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 inline" /> {pendingKitchenItems > 4 ? 'Alta cocina saturada' : 'Buen ritmo de preparación'}
            </span>
          </div>
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl">
            <ChefHat className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Tables state + Top selling items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="dashboard-main-grid">
        {/* Panel 1: Table list & status */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 lg:col-span-2" id="tables-status-panel">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Mapa de Mesas</h2>
              <p className="text-xs text-slate-500 mt-1">Selecciona una mesa para gestionar su comanda y cuenta.</p>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-600">Libre</span>
              <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-700">Esperando</span>
              <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-sky-100 text-sky-700">Servida</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="tables-layout-grid">
            {tables.map(table => {
              const isActive = orders.find(o => o.tableId === table.id && o.status !== 'Pagado' && o.status !== 'Cancelado');

              let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
              let statusLabel = 'Libre';
              if (table.status === 'Ocupada') {
                badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-100';
                statusLabel = 'Ocupada';
              } else if (table.status === 'Esperando') {
                badgeColor = 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse';
                statusLabel = 'Esperando';
              } else if (table.status === 'Servida') {
                badgeColor = 'bg-sky-50 text-sky-700 border-sky-100';
                statusLabel = 'Servida';
              }

              return (
                <button
                  key={table.id}
                  id={`table-card-${table.id}`}
                  onClick={() => onSelectTable(table.id)}
                  className={`relative p-5 rounded-xl border text-left transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer ${
                    table.status === 'Libre' 
                      ? 'bg-slate-50 border-slate-200 hover:bg-white' 
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-md">MESA {table.number}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                  
                  <div className="mt-4 space-y-1">
                    <div className="text-xs font-medium text-slate-700">Capacidad: {table.capacity} personas</div>
                    {isActive ? (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <div className="text-[11px] font-bold text-slate-900 truncate">
                          {isActive.customerName || 'Cliente General'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Total: ${isActive.total.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-indigo-600 font-semibold mt-1">
                          Mesero: {isActive.waiterName.split(' ')[0]}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-[11px] text-slate-400 italic">Mesa disponible</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel 2: Popular Dishes & Staff Performance */}
        <div className="space-y-8 lg:col-span-1" id="widgets-panel">
          {/* Top Selling Dishes */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6" id="popular-dishes-widget">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Platillos más Vendidos
            </h3>
            {topDishes.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400 italic">No hay comandas procesadas aún.</div>
            ) : (
              <div className="space-y-4">
                {topDishes.map((dish, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-slate-50 last:border-b-0 pb-3 last:pb-0">
                    <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                      <div className="text-sm font-semibold text-slate-700 truncate">{dish.name}</div>
                      <div className="text-xs text-slate-400 font-mono">${dish.total.toFixed(2)} acumulados</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500 font-mono">{dish.quantity} órdenes</span>
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-[10px] font-bold flex items-center justify-center text-slate-600">
                        #{idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Staff overview */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6" id="active-staff-widget">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" /> Personal de Guardia
              </h3>
              <button 
                onClick={() => onNavigateToTab('Personal')}
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                Ver todo
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-700">Chefs en Cocina</div>
                    <div className="text-[10px] text-slate-500">Preparando menú del día</div>
                  </div>
                </div>
                <span className="text-sm font-bold text-indigo-700 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-full">
                  {activeChefs} activos
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-sky-50/50 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="bg-sky-100 text-sky-600 p-2 rounded-lg">
                    <UserSquare2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-700">Meseros de Piso</div>
                    <div className="text-[10px] text-slate-500">Atendiendo comandas</div>
                  </div>
                </div>
                <span className="text-sm font-bold text-sky-700 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-full">
                  {activeWaiters} activos
                </span>
              </div>

              {activeChefs === 0 && activeWaiters === 0 && (
                <div className="flex gap-2 items-center text-xs text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Atención: Configure personal activo en el panel de Personal para asignar órdenes.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
