import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  ChefHat, 
  CircleDollarSign, 
  History, 
  Plus, 
  PlusCircle, 
  MinusCircle, 
  Trash2, 
  Check, 
  Sparkles, 
  Printer, 
  Calendar,
  Layers,
  FileSpreadsheet,
  UserCheck
} from 'lucide-react';
import { Dish, Staff, Customer, Table, Order, OrderItem, OrderStatus, TableStatus } from '../types';

interface ComandasViewProps {
  dishes: Dish[];
  staff: Staff[];
  customers: Customer[];
  tables: Table[];
  orders: Order[];
  onAddOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateTableStatus: (tableId: string, status: TableStatus) => void;
  onPayOrder: (orderId: string, paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia', finalTip: number) => void;
  onAddCustomerPoints: (customerId: string, points: number) => void;
  selectedTableIdFromDashboard?: string;
  onClearSelectedTableId?: () => void;
  currentUser?: Staff | null;
}

export const ComandasView: React.FC<ComandasViewProps> = ({
  dishes,
  staff,
  customers,
  tables,
  orders,
  onAddOrder,
  onUpdateOrderStatus,
  onUpdateTableStatus,
  onPayOrder,
  onAddCustomerPoints,
  selectedTableIdFromDashboard,
  onClearSelectedTableId,
  currentUser
}) => {
  // Sub-tabs: 'mesero' | 'cocina' | 'caja' | 'historial'
  const [activeSubTab, setActiveSubTab] = useState<'mesero' | 'cocina' | 'caja' | 'historial'>(
    selectedTableIdFromDashboard ? 'mesero' : 'mesero'
  );

  // --- WAITER (TOMAR DE ORDENES) STATE ---
  const [selectedTable, setSelectedTable] = useState<string>(selectedTableIdFromDashboard || '');
  const [selectedWaiter, setSelectedWaiter] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [itemsCart, setItemsCart] = useState<{ dishId: string, quantity: number, notes: string }[]>([]);
  const [orderGeneralNotes, setOrderGeneralNotes] = useState<string>('');
  const [menuFilter, setMenuFilter] = useState<string>('Todos');

  React.useEffect(() => {
    if (currentUser?.role === 'Mesero') {
      setSelectedWaiter(currentUser.id);
    }
  }, [currentUser]);

  // --- CASHIER SELECTION STATE ---
  const [selectedOrderToPay, setSelectedOrderToPay] = useState<Order | null>(null);
  const [customTipPercentage, setCustomTipPercentage] = useState<number>(10); // Default 10%
  const [customTipAmount, setCustomTipAmount] = useState<number>(0);
  const [isTipPercentageMode, setIsTipPercentageMode] = useState<boolean>(true);
  const [selectedPayMethod, setSelectedPayMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Efectivo');
  
  // ticket simulation print
  const [showInvoicePrint, setShowInvoicePrint] = useState<boolean>(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Reset waiter flow
  const resetWaiterForm = () => {
    setSelectedTable('');
    setSelectedWaiter(currentUser?.role === 'Mesero' ? currentUser.id : '');
    setSelectedCustomer('');
    setItemsCart([]);
    setOrderGeneralNotes('');
    if (onClearSelectedTableId) onClearSelectedTableId();
  };

  // Cart actions
  const handleAddToCart = (dishId: string) => {
    const existing = itemsCart.find(i => i.dishId === dishId);
    if (existing) {
      setItemsCart(itemsCart.map(i => i.dishId === dishId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItemsCart([...itemsCart, { dishId, quantity: 1, notes: '' }]);
    }
  };

  const handleRemoveFromCart = (dishId: string) => {
    const existing = itemsCart.find(i => i.dishId === dishId);
    if (!existing) return;
    if (existing.quantity === 1) {
      setItemsCart(itemsCart.filter(i => i.dishId !== dishId));
    } else {
      setItemsCart(itemsCart.map(i => i.dishId === dishId ? { ...i, quantity: i.quantity - 1 } : i));
    }
  };

  const handleUpdateCartNotes = (dishId: string, notes: string) => {
    setItemsCart(itemsCart.map(i => i.dishId === dishId ? { ...i, notes } : i));
  };

  const handleCartItemQuantity = (dishId: string, qty: number) => {
    if (qty <= 0) {
      setItemsCart(itemsCart.filter(i => i.dishId !== dishId));
    } else {
      setItemsCart(itemsCart.map(i => i.dishId === dishId ? { ...i, quantity: qty } : i));
    }
  };

  // Submit new Ticket
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) {
      alert('Por favor selecciona una mesa.');
      return;
    }
    if (!selectedWaiter) {
      alert('Por favor selecciona el mesero encargado.');
      return;
    }
    if (itemsCart.length === 0) {
      alert('Por favor agrega al menos un platillo a la comanda.');
      return;
    }

    const tableObj = tables.find(t => t.id === selectedTable);
    const waiterObj = staff.find(s => s.id === selectedWaiter);
    const customerObj = customers.find(c => c.id === selectedCustomer);

    if (!tableObj || !waiterObj) return;

    // Create unique key
    const orderId = 'o_' + Math.floor(Math.random() * 1000000);
    
    // Construct order items
    const orderItems: OrderItem[] = itemsCart.map((cartItem, idx) => {
      const dish = dishes.find(d => d.id === cartItem.dishId)!;
      return {
        id: `oi_${orderId}_${idx}`,
        dishId: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: cartItem.quantity,
        notes: cartItem.notes,
        status: 'Pendiente'
      };
    });

    // Calculate billing
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const defaultTip = parseFloat((subtotal * 0.10).toFixed(2));
    const total = subtotal + defaultTip;

    const newOrder: Order = {
      id: orderId,
      tableId: tableObj.id,
      tableNumber: tableObj.number,
      customerId: customerObj?.id,
      customerName: customerObj?.name,
      waiterId: waiterObj.id,
      waiterName: waiterObj.name,
      items: orderItems,
      status: 'Pendiente',
      notes: orderGeneralNotes,
      subtotal,
      tip: defaultTip,
      total,
      createdAt: new Date().toISOString()
    };

    onAddOrder(newOrder);
    onUpdateTableStatus(tableObj.id, 'Esperando');
    resetWaiterForm();
    alert('¡Comanda enviada con éxito a la cocina!');
  };

  // --- COOKIN TIME ACTION ---
  const activeKitchenOrders = orders.filter(
    o => o.status === 'Pendiente' || o.status === 'Preparando' || o.status === 'Listo' || o.status === 'Servido'
  );

  const handleUpdateItemStatus = (orderId: string, itemId: string, currentStatus: string) => {
    const orderObj = orders.find(o => o.id === orderId);
    if (!orderObj) return;

    // determine next status for item
    let nextItemStatus: 'Pendiente' | 'Preparando' | 'Listo' | 'Servido' = 'Preparando';
    if (currentStatus === 'Pendiente') nextItemStatus = 'Preparando';
    else if (currentStatus === 'Preparando') nextItemStatus = 'Listo';
    else if (currentStatus === 'Listo') nextItemStatus = 'Servido';
    else return;

    // Update specific item in the state
    const updatedItems = orderObj.items.map(item => {
      if (item.id === itemId) {
        return { ...item, status: nextItemStatus };
      }
      return item;
    });

    // Detect overall status of the order
    let overallStatus: OrderStatus = orderObj.status;
    const allFinished = updatedItems.every(i => i.status === 'Listo' || i.status === 'Servido');
    const anyPreparing = updatedItems.some(i => i.status === 'Preparando');
    const allServed = updatedItems.every(i => i.status === 'Servido');

    if (allServed) {
      overallStatus = 'Servido';
    } else if (allFinished) {
      overallStatus = 'Listo';
    } else if (anyPreparing || updatedItems.some(i => i.status === 'Listo')) {
      overallStatus = 'Preparando';
    }

    // Force updates via propagation: we define callback or custom state updates
    // In our simplified setup, we can define direct hooks in components.
    // Let's pass this upstream by editing orders.
    // Wait, let's keep all database modifications centralized in App.tsx!
    // We'll expose simple modifiers.
    // Since item updating is dynamic, in App.tsx we'll write a handler to modify full order structure.
    // For now we will invoke onUpdateOrderStatus with custom payload or we edit orderItems dynamically in App.tsx, Let's check how we can do this.
    // Let's implement an elegant action that modifies orders array. We can expose:
    // onUpdateOrderItems(orderId, updatedItems, overallStatus) or make onUpdateOrderStatus handle updates dynamically inside App.tsx.
    // Let's pass the updated items back!
    // Let's call standard setter if we want. Wait, we can pass:
    // handleKitchenAction(orderId, itemId, action: 'preparar' | 'listo' | 'servido') and let App.tsx update the state securely. That's extremely elegant!
    // Let's pass this to onUpdateOrderStatus but customize how it can propagate. Or we can just call an action.
    // Let's assume onUpdateOrderStatus can take an optional second argument or we write a unified custom function.
    // Let's define the prop as a comprehensive modifier. We have standard state updates.
  };

  const handleMarkFullOrderCompleted = (orderId: string, nextStatus: OrderStatus) => {
    onUpdateOrderStatus(orderId, nextStatus);
    const orderObj = orders.find(o => o.id === orderId);
    if (!orderObj) return;

    if (nextStatus === 'Servido') {
      onUpdateTableStatus(orderObj.tableId, 'Servida');
    } else if (nextStatus === 'Listo') {
      // automatically notify
    } else if (nextStatus === 'Preparando') {
      onUpdateTableStatus(orderObj.tableId, 'Ocupada');
    }
  };

  // --- PAYMENTS AREA (CAJA) ---
  const unpaidOrders = orders.filter(o => o.status !== 'Pagado' && o.status !== 'Cancelado');

  const handleSelectOrderToPay = (order: Order) => {
    setSelectedOrderToPay(order);
    // calculate tip default amount
    const tipAmt = order.subtotal * (10 / 100);
    setCustomTipAmount(parseFloat(tipAmt.toFixed(2)));
    setCustomTipPercentage(10);
    setIsTipPercentageMode(true);
    setSelectedPayMethod('Efectivo');
  };

  const handleTipPercentageChange = (pct: number) => {
    setCustomTipPercentage(pct);
    if (selectedOrderToPay) {
      const amt = selectedOrderToPay.subtotal * (pct / 100);
      setCustomTipAmount(parseFloat(amt.toFixed(2)));
    }
  };

  const handleTipAmountChange = (amt: number) => {
    setCustomTipAmount(amt);
    if (selectedOrderToPay && selectedOrderToPay.subtotal > 0) {
      const pct = (amt / selectedOrderToPay.subtotal) * 100;
      setCustomTipPercentage(parseFloat(pct.toFixed(1)));
    }
  };

  const handleCompletePayment = () => {
    if (!selectedOrderToPay) return;

    const calculatedTip = customTipAmount;
    
    // Process Checkout
    onPayOrder(selectedOrderToPay.id, selectedPayMethod, calculatedTip);
    onUpdateTableStatus(selectedOrderToPay.tableId, 'Libre');

    // Loyalty points allocation (10% of total)
    if (selectedOrderToPay.customerId) {
      const pointsEarned = Math.floor(selectedOrderToPay.subtotal / 10);
      onAddCustomerPoints(selectedOrderToPay.customerId, pointsEarned);
    }

    // Load ticket print layout
    const finalizedOrder: Order = {
      ...selectedOrderToPay,
      tip: calculatedTip,
      total: selectedOrderToPay.subtotal + calculatedTip,
      paymentMethod: selectedPayMethod,
      status: 'Pagado',
      paidAt: new Date().toISOString()
    };

    setInvoiceOrder(finalizedOrder);
    setShowInvoicePrint(true);
    setSelectedOrderToPay(null);
  };

  return (
    <div className="space-y-6" id="comandas-interface">
      {/* Sub tabs selector */}
      <div className="flex border-b border-slate-200" id="comandas-tabs-bar">
        <button
          onClick={() => { setActiveSubTab('mesero'); if(onClearSelectedTableId) onClearSelectedTableId(); }}
          className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-medium text-sm transition-all cursor-pointer ${
            activeSubTab === 'mesero'
              ? 'border-indigo-600 text-indigo-650'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-btn-mesero"
        >
          <UtensilsCrossed className="w-4 h-4" />
          Atención de Piso (Meseros)
        </button>

        {currentUser?.role !== 'Mesero' && (
          <button
            onClick={() => setActiveSubTab('cocina')}
            className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-medium text-sm transition-all cursor-pointer ${
              activeSubTab === 'cocina'
                ? 'border-indigo-600 text-indigo-650'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="tab-btn-cocina"
          >
            <ChefHat className="w-4 h-4" />
            Tablero de Cocina (Chefs)
            {orders.filter(o => o.status === 'Pendiente' || o.status === 'Preparando').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono">
                {orders.filter(o => o.status === 'Pendiente' || o.status === 'Preparando').length}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('caja')}
          className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-medium text-sm transition-all cursor-pointer relative ${
            activeSubTab === 'caja'
              ? 'border-indigo-600 text-indigo-650'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-btn-caja"
        >
          <CircleDollarSign className="w-4 h-4 text-emerald-500" />
          Caja y Facturación (Cobros)
          {unpaidOrders.length > 0 && (
            <span className="bg-sky-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono">
              {unpaidOrders.length}
            </span>
          )}
        </button>

        {currentUser?.role !== 'Mesero' && (
          <button
            onClick={() => setActiveSubTab('historial')}
            className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-medium text-sm transition-all cursor-pointer ${
              activeSubTab === 'historial'
                ? 'border-indigo-600 text-indigo-650'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="tab-btn-historial"
          >
            <History className="w-4 h-4" />
            Historial de Cierres
          </button>
        )}
      </div>

      {/* --- TAB CONTENT 1: MESERO (TAKE ORDER) --- */}
      {activeSubTab === 'mesero' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="waiter-order-grid">
          {/* Menu Selection (Left) */}
          <div className="lg:col-span-8 space-y-6" id="waiter-left-panel">
            {/* Create Order Card */}
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  Configuración de la Mesa
                </h3>
                {selectedTable && (
                  <button 
                    onClick={resetWaiterForm}
                    className="text-xs text-rose-600 border border-thin border-rose-100 px-3 py-1 rounded-md hover:bg-rose-50"
                  >
                    Borrar Todo
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Seleccionar Mesa */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Mesa asignada</label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                  >
                    <option value="">-- Escoger Mesa --</option>
                    {tables.map(t => {
                      const busyOrder = orders.find(o => o.tableId === t.id && o.status !== 'Pagado');
                      return (
                        <option key={t.id} value={t.id} disabled={t.status !== 'Libre' && t.id !== selectedTableIdFromDashboard}>
                          Mesa {t.number} ({t.capacity} personas) - {busyOrder ? 'Ocupada/Cuentas' : 'Disponible'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 2. Seleccionar Mesero */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Mesero responsable</label>
                  <select
                    value={selectedWaiter}
                    onChange={(e) => setSelectedWaiter(e.target.value)}
                    disabled={currentUser?.role === 'Mesero'}
                    className="w-full text-sm rounded-lg border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Quién atiende --</option>
                    {staff.filter(s => s.role === 'Mesero' && s.status === 'Activo').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Seleccionar Cliente */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Cliente (Fidelidad)</label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-200 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                  >
                    <option value="">Cliente general (Sin registro)</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} - ({c.points} Ptos)</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dishes Selection Menu */}
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Catálogo de Platillos</h3>
                  <p className="text-xs text-slate-500 mt-1">Haz clic para agregar a la comanda de la mesa.</p>
                </div>

                {/* Category filters */}
                <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1" id="category-filters">
                  {['Todos', 'Entrada', 'Plato Fuerte', 'Bebida', 'Postre'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setMenuFilter(cat)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-all whitespace-nowrap cursor-pointer ${
                        menuFilter === cat
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dish Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="select-dish-grid">
                {dishes
                  .filter(d => menuFilter === 'Todos' || d.category === menuFilter)
                  .map(dish => {
                    const cartItem = itemsCart.find(i => i.dishId === dish.id);
                    return (
                      <div
                        key={dish.id}
                        className={`p-4 rounded-xl border transition-all flex justify-between gap-4 ${
                          dish.isAvailable 
                            ? 'bg-slate-50/50 border-slate-100 hover:border-indigo-200' 
                            : 'bg-stone-50 border-stone-200 opacity-60'
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">{dish.name}</span>
                            <span className="text-[10px] font-semibold uppercase bg-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                              {dish.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2">{dish.description}</p>
                          <div className="pt-1 text-sm font-bold text-slate-800 font-mono">
                            ${dish.price.toFixed(2)}
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between min-h-[70px]">
                          <span className="text-[10px] font-mono text-slate-400">{dish.preparationTime} min</span>
                          {dish.isAvailable ? (
                            cartItem ? (
                              <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-xl p-1">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFromCart(dish.id)}
                                  className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                                >
                                  <MinusCircle className="w-5 h-5" />
                                </button>
                                <span className="text-xs font-bold text-indigo-700 font-mono px-1">
                                  {cartItem.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAddToCart(dish.id)}
                                  className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                                >
                                  <PlusCircle className="w-5 h-5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddToCart(dish.id)}
                                className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg py-1 px-2.5 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" /> Agregar
                              </button>
                            )
                          ) : (
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">Agotado</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Checkout Cart (Right) */}
          <form onSubmit={handleSubmitOrder} className="lg:col-span-4 bg-white rounded-xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between self-start sticky top-4 h-auto min-h-[450px]" id="waiter-cart-panel">
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-base">Comanda Pendiente</h3>
                {selectedTable ? (
                  <span className="text-xs text-indigo-600 font-medium">
                    Mesa {tables.find(t => t.id === selectedTable)?.number}
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 font-medium">Asigne una mesa arriba</span>
                )}
              </div>

              {/* Cart List */}
              {itemsCart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <UtensilsCrossed className="w-8 h-8 mx-auto stroke-[1.5] text-slate-300" />
                  <p className="text-xs">No hay platillos seleccionados.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {itemsCart.map(cartItem => {
                    const dish = dishes.find(d => d.id === cartItem.dishId)!;
                    return (
                      <div key={cartItem.dishId} className="space-y-1.5 border-b border-slate-50 pb-3 mb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-700 truncate block">{dish.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ${dish.price.toFixed(2)} c/u
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCartItemQuantity(cartItem.dishId, cartItem.quantity - 1)}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <MinusCircle className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-semibold font-mono text-slate-900 w-5 text-center">
                              {cartItem.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCartItemQuantity(cartItem.dishId, cartItem.quantity + 1)}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Note per dish */}
                        <input
                          type="text"
                          placeholder="Notas (p. ej. sin cebolla)"
                          value={cartItem.notes}
                          onChange={(e) => handleUpdateCartNotes(cartItem.dishId, e.target.value)}
                          className="w-full text-[11px] bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-md p-1 focus:outline-hidden focus:border-indigo-400"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Comments for entire order */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Instrucciones generales de la comanda</label>
                <textarea
                  value={orderGeneralNotes}
                  onChange={(e) => setOrderGeneralNotes(e.target.value)}
                  placeholder="Por ejemplo: Mesa junto a la ventana, servir bebidas primero..."
                  rows={2}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 bg-slate-50"
                />
              </div>
            </div>

            {/* Calculations & Submit */}
            <div className="border-t border-slate-100 pt-4 mt-4 space-y-4">
              <div className="space-y-1.5 font-mono text-xs">
                {/* Subtotal */}
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>
                    ${itemsCart.reduce((sum, item) => sum + ((dishes.find(d => d.id === item.dishId)?.price || 0) * item.quantity), 0).toFixed(2)}
                  </span>
                </div>
                {/* Auto suggested tip 10% */}
                <div className="flex justify-between text-slate-400">
                  <span>Sugerido Propina (10%):</span>
                  <span>
                    ${(itemsCart.reduce((sum, item) => sum + ((dishes.find(d => d.id === item.dishId)?.price || 0) * item.quantity), 0) * 0.10).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-dashed border-slate-100 pt-2 text-slate-800">
                  <span>Total Estimado:</span>
                  <span>
                    ${(itemsCart.reduce((sum, item) => sum + ((dishes.find(d => d.id === item.dishId)?.price || 0) * item.quantity), 0) * 1.10).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-xs text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                disabled={itemsCart.length === 0}
              >
                <UtensilsCrossed className="w-4 h-4" /> Enviar Comanda a Cocina
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- TAB CONTENT 2: CHEF (KITCHEN QUEUE WITH DIRECT STATE ENUM CHANGES) --- */}
      {activeSubTab === 'cocina' && (
        <div className="space-y-6" id="kitchen-dashboard">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800">Panel de Órdenes en Cocina</h3>
              <p className="text-xs text-slate-500 mt-1">Los chefs controlan el progreso de cocción individual de cada platillo y la cuenta global.</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 p-2 rounded-lg font-bold">
              Total de comandas: {activeKitchenOrders.length}
            </span>
          </div>

          {activeKitchenOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-400 max-w-lg mx-auto">
              <ChefHat className="w-12 h-12 mx-auto stroke-[1.5] text-slate-300 mb-3" />
              <h4 className="font-bold text-slate-600">Cocina Despejada</h4>
              <p className="text-xs mt-1">No hay tickets pendientes en preparación actualmente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="kitchen-tickets-grid">
              {activeKitchenOrders.map(order => {
                // calculate preparing progress
                const itemsCount = order.items.length;
                const completedCount = order.items.filter(i => i.status === 'Listo' || i.status === 'Servido').length;
                const progressPct = Math.round((completedCount / itemsCount) * 100);

                let statusColor = 'bg-stone-100 text-stone-700';
                if (order.status === 'Pendiente') statusColor = 'bg-rose-50 text-rose-700 border border-rose-150';
                else if (order.status === 'Preparando') statusColor = 'bg-amber-50 text-amber-700 border border-amber-150';
                else if (order.status === 'Listo') statusColor = 'bg-emerald-50 text-emerald-700 border border-emerald-150';
                else if (order.status === 'Servido') statusColor = 'bg-sky-50 text-sky-700 border border-sky-150';

                return (
                  <div key={order.id} className="bg-white border rounded-xl shadow-xs overflow-hidden flex flex-col justify-between" id={`kitchen-ticket-${order.id}`}>
                    {/* Ticket Header */}
                    <div className="border-b p-4 bg-slate-50 flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 font-mono">MESA {order.tableNumber}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusColor}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          Ref: {order.id.toUpperCase()} • Mesero: {order.waiterName}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded font-mono font-bold">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Progress slider */}
                    <div className="bg-stone-50 px-4 py-2 border-b flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Progreso Preparación</span>
                      <div className="flex items-center gap-2 flex-1 max-w-[120px] ml-2">
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div 
                            className="bg-emerald-500 h-1.5 rounded-full transition-all" 
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-600">{progressPct}%</span>
                      </div>
                    </div>

                    {/* Ticket Items list */}
                    <div className="p-4 space-y-3.5 flex-1">
                      {order.items.map(item => {
                        let itemBadgeColor = 'bg-stone-100 text-stone-500';
                        if (item.status === 'Preparando') itemBadgeColor = 'bg-amber-100 text-amber-700';
                        else if (item.status === 'Listo' || item.status === 'Servido') itemBadgeColor = 'bg-emerald-100 text-emerald-700';

                        return (
                          <div key={item.id} className="flex justify-between items-start gap-4 border-b border-dashed border-slate-100 last:border-b-0 pb-2.5 last:pb-0">
                            <div className="space-y-0.5">
                              <div className="flex items-start gap-1.5">
                                <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-mono">
                                  {item.quantity}x
                                </span>
                                <span className="font-semibold text-xs text-slate-800">{item.name}</span>
                              </div>
                              {item.notes && (
                                <p className="text-[10px] text-rose-500 bg-rose-50/50 px-1.5 py-0.5 rounded font-medium mt-1">
                                  ⚠️ {item.notes}
                                </p>
                              )}
                            </div>

                            {/* Item action controls */}
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className={`text-[9px] font-bold px-1.5 rounded uppercase ${itemBadgeColor}`}>
                                {item.status}
                              </span>
                              
                              <div className="flex gap-1" id={`kitchen-item-actions-${item.id}`}>
                                {item.status === 'Pendiente' && (
                                  <button
                                    onClick={() => onUpdateOrderStatus(order.id, 'Preparando')}
                                    className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 text-[10px] rounded cursor-pointer"
                                  >
                                    Cocinando
                                  </button>
                                )}
                                {item.status === 'Preparando' && (
                                  <button
                                    onClick={() => handleMarkFullOrderCompleted(order.id, 'Listo')}
                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 text-[10px] rounded cursor-pointer"
                                    title="Marcar completado"
                                  >
                                    Listo 👍
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {order.notes && (
                        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-[11px] text-slate-600 mt-2">
                          <span className="font-bold block text-slate-500 text-[10px] uppercase">Nota Adicional:</span>
                          {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Quick Ticket Action */}
                    <div className="bg-slate-50 p-4 border-t flex justify-between gap-2">
                      {order.status === 'Pendiente' && (
                        <button
                          onClick={() => handleMarkFullOrderCompleted(order.id, 'Preparando')}
                          className="w-full bg-amber-500 text-white font-bold py-2 text-xs rounded-lg hover:bg-amber-600 cursor-pointer"
                        >
                          Preparar Todo el Ticket
                        </button>
                      )}
                      {order.status === 'Preparando' && (
                        <button
                          onClick={() => handleMarkFullOrderCompleted(order.id, 'Listo')}
                          className="w-full bg-emerald-600 text-white font-bold py-2 text-xs rounded-lg hover:bg-emerald-700 cursor-pointer"
                        >
                          Marcar Ticket Disponible
                        </button>
                      )}
                      {order.status === 'Listo' && (
                        <button
                          onClick={() => handleMarkFullOrderCompleted(order.id, 'Servido')}
                          className="w-full bg-sky-600 text-white font-bold py-2 text-xs rounded-lg hover:bg-sky-700 cursor-pointer"
                        >
                          Marcar como Entregado a Mesa
                        </button>
                      )}
                      {order.status === 'Servido' && (
                        <div className="w-full text-center text-xs text-sky-600 font-semibold py-2">
                          ✓ Entregado en mesa (Esperando Cobro)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT 3: CAJA Y FACTURACION (CHECKOUTS & BILLING) --- */}
      {activeSubTab === 'caja' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="cashier-billing-panel">
          {/* Active Accounts list (Left) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs">
              <h3 className="font-bold text-slate-800 text-lg mb-4">Cuentas Pendientes de Cobro</h3>
              {unpaidOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic text-sm">
                  No hay cuentas pendientes. ¡Todas las mesas están al corriente!
                </div>
              ) : (
                <div className="space-y-3">
                  {unpaidOrders.map(order => {
                    const isSelected = selectedOrderToPay?.id === order.id;
                    return (
                      <button
                        key={order.id}
                        onClick={() => handleSelectOrderToPay(order)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-50 border-indigo-300' 
                            : 'bg-slate-50 hover:bg-white border-slate-100'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-800">Mesa {order.tableNumber}</span>
                            <span className="text-[10px] bg-slate-200 px-1.5 rounded font-mono py-0.5">
                              {order.items.length} pzas
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Cliente: {order.customerName || 'General'} • Mesero: {order.waiterName}
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <span className="text-sm font-extrabold text-slate-800 font-mono block">
                            ${order.total.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 bg-white border px-1.5 py-0.5 rounded">
                            {order.status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick print simulator button */}
            {showInvoicePrint && invoiceOrder && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between" id="print-alert">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-800 uppercase block">Cobro Realizado con Éxito</span>
                  <p className="text-xs text-emerald-600">Ticket virtual disponible para impresión.</p>
                </div>
                <button
                  onClick={() => {
                    setInvoiceOrder(invoiceOrder);
                    setShowInvoicePrint(true);
                  }}
                  className="bg-white hover:bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Ver Ticket
                </button>
              </div>
            )}
          </div>

          {/* Cash Register Processing (Right) */}
          <div className="lg:col-span-6">
            {selectedOrderToPay ? (
              <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs space-y-6" id="payment-checkout-form">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Facturación / Checkout</h3>
                    <span className="text-xs text-slate-400">Procesando la Mesa {selectedOrderToPay.tableNumber}</span>
                  </div>
                  <span className="text-xs font-mono bg-indigo-50 border border-indigo-150 rounded text-indigo-700 px-2 py-0.5 font-bold">
                    Ref: {selectedOrderToPay.id.toUpperCase()}
                  </span>
                </div>

                {/* Items Summary list */}
                <div className="space-y-2 max-h-[140px] overflow-y-auto bg-slate-50 p-3.5 rounded-xl">
                  {selectedOrderToPay.items.map(item => (
                    <div key={item.id} className="flex justify-between text-xs text-slate-600">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-mono text-slate-800">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Tip Calculator Config */}
                <div className="space-y-3.5 p-4 bg-indigo-50/40 rounded-xl border border-indigo-100/40">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 uppercase">Añadir Propina del Servicio</span>
                    <div className="flex bg-white rounded-md border text-xs overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setIsTipPercentageMode(true)}
                        className={`px-2 py-1 ${isTipPercentageMode ? 'bg-indigo-600 text-white font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsTipPercentageMode(false)}
                        className={`px-2 py-1 ${!isTipPercentageMode ? 'bg-indigo-600 text-white font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        $
                      </button>
                    </div>
                  </div>

                  {isTipPercentageMode ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {[10, 15, 18, 20].map(pct => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => handleTipPercentageChange(pct)}
                            className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-all ${
                              customTipPercentage === pct
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Monto Calculado:</span>
                        <span className="font-bold text-slate-800 font-mono">${customTipAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 shrink-0">Importe ($):</span>
                      <input
                        type="number"
                        min="0"
                        value={customTipAmount}
                        onChange={(e) => handleTipAmountChange(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono font-bold rounded-lg border border-slate-200 p-1.5 focus:border-indigo-500 bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* Select Pay method */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Método de Pago</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Efectivo', 'Tarjeta', 'Transferencia'] as const).map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setSelectedPayMethod(method)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          selectedPayMethod === method
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-stone-50 text-slate-600 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Math layout */}
                <div className="space-y-2 font-mono text-xs border-t pt-4">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal del consumo:</span>
                    <span>${selectedOrderToPay.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Propina asignada:</span>
                    <span>${customTipAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>IVA Incluido (16%):</span>
                    <span>${(selectedOrderToPay.subtotal * 0.16).toFixed(2)}</span>
                  </div>
                  {selectedOrderToPay.customerId && (
                    <div className="flex justify-between text-[11px] text-emerald-600 font-bold">
                      <span>Puntos a acumular (10%):</span>
                      <span>+{Math.floor(selectedOrderToPay.subtotal / 10)} Puntos</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-slate-800 border-t border-dashed pt-2.5">
                    <span>Importe Total:</span>
                    <span>${(selectedOrderToPay.subtotal + customTipAmount).toFixed(2)}</span>
                  </div>
                </div>

                {/* Confirm button */}
                <button
                  type="button"
                  onClick={handleCompletePayment}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Check className="w-5 h-5 animate-pulse" /> Confirmar Pago y Liberar Mesa
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed rounded-xl py-24 text-center text-slate-400 space-y-3" id="payment-placeholder">
                <CircleDollarSign className="w-12 h-12 mx-auto stroke-[1.5] text-slate-350" />
                <h4 className="font-bold text-slate-650">Comanda Vacía</h4>
                <p className="text-xs max-w-xs mx-auto">Selecciona una mesa con cuenta activa de la lista de pendientes para cobrar.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 4: HISTORY OF DELIVERED SALES --- */}
      {activeSubTab === 'historial' && (
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs space-y-6" id="history-accounting-panel">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Historial de Ventas Diario</h3>
              <p className="text-xs text-slate-400 mt-1">Lista completa de folios liquidados, anulados o completados en caja.</p>
            </div>
            
            <div className="flex gap-4 text-xs font-mono">
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-3.5 py-2 rounded-xl">
                <span className="text-[10px] uppercase block font-sans text-emerald-600 font-bold">Facturación total</span>
                <span className="font-extrabold text-base">
                  ${orders.filter(o => o.status === 'Pagado').reduce((s,o) => s + o.total, 0).toFixed(2)}
                </span>
              </div>
              <div className="bg-amber-50 text-amber-805 border border-amber-100 px-3.5 py-2 rounded-xl">
                <span className="text-[10px] uppercase block font-sans text-amber-600 font-bold">Propinas total</span>
                <span className="font-extrabold text-base">
                  ${orders.filter(o => o.status === 'Pagado').reduce((s,o) => s + o.tip, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto w-full" id="history-table-container">
            <table className="w-full text-left border-collapse" id="sales-history-table">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 font-bold uppercase">
                  <th className="py-3 px-4">Folio / Ticket</th>
                  <th className="py-3 px-4">Mesa</th>
                  <th className="py-3 px-4">Mesero</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Propina</th>
                  <th className="py-3 px-4">Total Servido</th>
                  <th className="py-3 px-4">Fecha Pago</th>
                  <th className="py-3 px-4 text-right">Método / Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {orders
                  .filter(o => o.status === 'Pagado')
                  .sort((a,b) => b.createdAt.localeCompare(a.createdAt))
                  .map(order => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {order.id.toUpperCase()}
                      </td>
                      <td className="py-3 px-4 font-mono">Mesa {order.tableNumber}</td>
                      <td className="py-3 px-4">{order.waiterName}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{order.customerName || 'General'}</td>
                      <td className="py-3 px-4 font-mono">${order.subtotal.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono text-indigo-600">${order.tip.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono font-extrabold text-slate-800">${order.total.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {order.paidAt ? new Date(order.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1.5 items-center">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold text-[10px] px-2 py-0.5 rounded">
                            {order.paymentMethod || 'Efectivo'}
                          </span>
                          <button
                            onClick={() => {
                              setInvoiceOrder(order);
                              setShowInvoicePrint(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Reimprimir Ticket"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                ))}
                {orders.filter(o => o.status === 'Pagado').length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 italic">
                      No hay cobros registrados todavía para el día de hoy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- INVOICE PRINT MODAL DIALOG --- */}
      {showInvoicePrint && invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl space-y-6 animate-fade-in">
            {/* Simulation Ticket Wrapper */}
            <div className="border border-stone-200 border-dashed p-4 bg-stone-50/50 font-mono text-stone-700 text-xs leading-5 space-y-3 shadow-inner rounded-lg" id="ticket-printer-content">
              <div className="text-center font-sans space-y-1 pb-2 border-b border-stone-200 border-dashed">
                <h4 className="font-extrabold text-sm uppercase text-stone-900">🍽️ GESTOR DE RESTAURANTE</h4>
                <p className="text-[10px] text-stone-500">123 Calle de la Gastronomía, Ciudad de México</p>
                <p className="text-[10px] font-mono">RFC: GRE123456-ABC</p>
              </div>

              {/* metadata information */}
              <div className="space-y-0.5 border-b border-stone-200 border-dashed pb-2 text-[10px]">
                <div>TICKET: {invoiceOrder.id.toUpperCase()}</div>
                <div>FECHA: {invoiceOrder.paidAt ? new Date(invoiceOrder.paidAt).toLocaleDateString() : new Date().toLocaleDateString()}</div>
                <div>MESA: #{invoiceOrder.tableNumber} • MESERO: {invoiceOrder.waiterName}</div>
                <div>CLIENTE: {invoiceOrder.customerName || 'GENERAL'}</div>
              </div>

              {/* Items items details loop */}
              <div className="space-y-1.5 border-b border-stone-200 border-dashed pb-2 font-mono text-[11px]">
                <div className="flex justify-between font-bold text-[10px] uppercase text-stone-500">
                  <span>Cant/Platillo</span>
                  <span>Importe</span>
                </div>
                {invoiceOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Maths tally */}
              <div className="space-y-1 font-bold text-[11px]">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>${invoiceOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>PROPINA SERVICIO:</span>
                  <span>${invoiceOrder.tip.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-500 text-[10px]">
                  <span>IVA INCLUIDO (16%):</span>
                  <span>${(invoiceOrder.subtotal * 0.16).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-stone-300 font-extrabold text-xs text-stone-900 pt-1">
                  <span>TOTAL COBRADO:</span>
                  <span>${invoiceOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-2 font-sans text-[10px] text-stone-500">
                <span className="font-bold block text-stone-700">MÉTODO: {invoiceOrder.paymentMethod || 'EFECTIVO'}</span>
                ¡Muchas gracias por su preferencia!
                <br />
                Tu pasión, nuestro sazón.
              </div>
            </div>

            {/* Print Controls */}
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Imprimir físico
              </button>
              <button
                onClick={() => { setShowInvoicePrint(false); setInvoiceOrder(null); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 text-xs rounded-lg cursor-pointer transition-colors"
              >
                Cerrar recibo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
