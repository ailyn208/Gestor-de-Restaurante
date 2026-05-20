import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  X, 
  Sparkles, 
  Gift, 
  Phone, 
  Mail, 
  TicketCheck 
} from 'lucide-react';
import { Customer } from '../types';

interface CustomerManagementViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
}

export const CustomerManagementView: React.FC<CustomerManagementViewProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modal controllers
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form parameters
  const [formName, setFormName] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPoints, setFormPoints] = useState<number>(0);

  // Redeem simulation states
  const [selectedCustomerForReward, setSelectedCustomerForReward] = useState<Customer | null>(null);

  const openAddForm = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormPoints(0);
    setIsFormOpen(true);
  };

  const openEditForm = (c: Customer) => {
    setEditingCustomer(c);
    setFormName(c.name);
    setFormPhone(c.phone);
    setFormEmail(c.email);
    setFormPoints(c.points);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Por favor instaura un nombre de cliente válido.');
      return;
    }

    const payload: Customer = {
      id: editingCustomer ? editingCustomer.id : 'c_' + Math.floor(Math.random() * 1000000),
      name: formName,
      phone: formPhone,
      email: formEmail,
      visits: editingCustomer ? editingCustomer.visits : 1,
      points: Math.max(0, parseInt(formPoints.toString()) || 0)
    };

    if (editingCustomer) {
      onUpdateCustomer(payload);
      alert('¡Ficha del cliente actualizada!');
    } else {
      onAddCustomer(payload);
      alert('¡Cliente registrado exitosamente en el club de lealtad!');
    }

    setIsFormOpen(false);
    setEditingCustomer(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de continuar bajando de la lista a "${name}"?`)) {
      onDeleteCustomer(id);
    }
  };

  const handleRedeemReward = (rewardCost: number, rewardName: string) => {
    if (!selectedCustomerForReward) return;

    if (selectedCustomerForReward.points < rewardCost) {
      alert(`Puntos insuficientes. Se requieren ${rewardCost} puntos para: ${rewardName}.`);
      return;
    }

    const updatedCustomer: Customer = {
      ...selectedCustomerForReward,
      points: selectedCustomerForReward.points - rewardCost
    };

    onUpdateCustomer(updatedCustomer);
    setSelectedCustomerForReward(updatedCustomer); // Update active state
    alert(`¡Puntos canjeados con éxito por: ${rewardName}! Se restaron ${rewardCost} de su saldo.`);
  };

  // Searching logic
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" id="customers-panel-container">
      {/* Header controls layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Club de Fidelización & Clientes
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Asocia consumos en comandas, premia visitas frecuentes con puntos de reembolso e intercambia premios físicos interactivos.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          id="btn-add-customer"
        >
          <Plus className="w-4 h-4" /> Registrar Cliente
        </button>
      </div>

      {/* SEARCH AND GRID */}
      <div className="space-y-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 bg-white focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="customers-cards-grid">
          {filteredCustomers.map(customer => (
            <div 
              key={customer.id} 
              id={`customer-card-${customer.id}`}
              className="bg-white border hover:border-indigo-150 rounded-xl p-5 shadow-2xs flex flex-col justify-between transition-all"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{customer.name}</h4>
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                      {customer.visits} visitas acumuladas
                    </span>
                  </div>

                  {/* Points tally bubble */}
                  <div className="bg-amber-50 text-amber-800 border border-amber-100 px-3 py-1.5 rounded-xl text-center shadow-3xs">
                    <span className="text-[9px] uppercase font-bold text-amber-600 block leading-tight">Puntos</span>
                    <span className="text-sm font-black font-mono leading-none">{customer.points}</span>
                  </div>
                </div>

                {/* Info listings Contacts */}
                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{customer.phone || 'Sin registrar teléfono'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{customer.email || 'Sin registrar correo'}</span>
                  </div>
                </div>
              </div>

              {/* Action layout rows */}
              <div className="border-t border-slate-50 pt-4 mt-4 flex justify-between items-center text-xs">
                {/* Rewards buttons activator */}
                <button
                  onClick={() => setSelectedCustomerForReward(customer)}
                  className="text-xs text-amber-600 hover:text-amber-700 bg-amber-50/50 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5" /> Canjear Puntos
                </button>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEditForm(customer)}
                    className="p-1.5 border hover:text-indigo-600 bg-white hover:border-indigo-250 rounded-lg text-slate-400 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id, customer.name)}
                    className="p-1.5 border hover:text-rose-600 bg-white hover:border-rose-250 rounded-lg text-slate-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="col-span-full bg-white border border-dashed rounded-xl p-16 text-center text-slate-400 max-w-sm mx-auto">
              <Users className="w-10 h-10 stroke-[1.5] mx-auto text-slate-300" />
              <h4 className="font-bold text-slate-650 mt-2">¿Sin clientes?</h4>
              <p className="text-xs">Usa otros términos de búsqueda o registra un nuevo miembro.</p>
            </div>
          )}
        </div>
      </div>

      {/* CUSTOMER GUEST EDITOR FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-5 animate-fade-in"
            id="customer-entry-form"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base font-sans">
                {editingCustomer ? 'Editar Ficha Loyalty' : 'Inscribir Club de Clientes'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="p. ej. María Rodríguez"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 p-2.5 bg-slate-50 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Móvil / Celular</label>
                  <input
                    type="tel"
                    placeholder="55xxxxxxxx"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-200 p-2.5 bg-slate-50 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-200 p-2.5 bg-slate-50 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Saldo de puntos iniciales</label>
                <input
                  type="number"
                  placeholder="Por ejemplo: 100"
                  value={formPoints || ''}
                  onChange={(e) => setFormPoints(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-sm rounded-lg border border-slate-200 p-2.5 bg-slate-50 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 text-xs font-bold rounded-lg cursor-pointer animate-none"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold rounded-lg cursor-pointer"
              >
                {editingCustomer ? 'Actualizar' : 'Inscribir Cliente'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INTERACTIVE LOYALTY EXCHANGE BOARD MODAL */}
      {selectedCustomerForReward && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl space-y-5 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-bold text-slate-800 text-sm uppercase">Catálogo de Premios</h3>
                <p className="text-[11px] text-slate-450 font-bold">{selectedCustomerForReward.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerForReward(null)}
                className="text-slate-400 hover:text-slate-705 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile points overview */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">Saldo Actual</span>
                <span className="text-xs text-slate-600 font-semibold">Usa tus puntos acumulados hoy</span>
              </div>
              <span className="text-xl font-black font-mono text-amber-900">{selectedCustomerForReward.points} pts</span>
            </div>

            {/* Redeem options list block */}
            <div className="space-y-3" id="redeem-rewards-catalog">
              {[
                { name: 'Café de cortesía', cost: 50, icon: '☕' },
                { name: 'Postre gratis', cost: 100, icon: '🍰' },
                { name: 'Entrada gratis (Guacamole)', cost: 150, icon: '🥑' },
                { name: 'Bebida premium gratis', cost: 80, icon: '🍹' },
                { name: 'Descuento del 15% en cuenta', cost: 200, icon: '🏷️' }
              ].map((reward, i) => {
                const canAfford = selectedCustomerForReward.points >= reward.cost;
                return (
                  <div 
                    key={i} 
                    className={`p-3 rounded-lg border flex justify-between items-center ${
                      canAfford 
                        ? 'bg-slate-50 border-slate-205'
                        : 'bg-stone-50 border-stone-105 opacity-55'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{reward.icon}</span>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">{reward.name}</span>
                        <span className="text-[10px] text-amber-600 font-mono font-black">{reward.cost} Puntos</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleRedeemReward(reward.cost, reward.name)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                        canAfford 
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <TicketCheck className="w-3 h-3" /> Canjear
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setSelectedCustomerForReward(null)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
