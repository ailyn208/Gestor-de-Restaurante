import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  ChefHat, 
  Contact, 
  X, 
  Phone, 
  Mail, 
  ShieldAlert,
  UserSquare2
} from 'lucide-react';
import { Staff, StaffRole, StaffStatus } from '../types';

interface StaffManagementViewProps {
  staffList: Staff[];
  onAddStaff: (staff: Staff) => void;
  onUpdateStaff: (staff: Staff) => void;
  onDeleteStaff: (staffId: string) => void;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  staffList,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
}) => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form states
  const [formName, setFormName] = useState<string>('');
  const [formRole, setFormRole] = useState<StaffRole>('Mesero');
  const [formStatus, setFormStatus] = useState<StaffStatus>('Activo');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');

  const openAddForm = () => {
    setEditingStaff(null);
    setFormName('');
    setFormRole('Mesero');
    setFormStatus('Activo');
    setFormPhone('');
    setFormEmail('');
    setFormPassword('');
    setIsFormOpen(true);
  };

  const openEditForm = (item: Staff) => {
    setEditingStaff(item);
    setFormName(item.name);
    setFormRole(item.role);
    setFormStatus(item.status);
    setFormPhone(item.phone);
    setFormEmail(item.email);
    setFormPassword(item.password || '');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Por favor ingresa un nombre válido.');
      return;
    }

    const payload: Staff = {
      id: editingStaff ? editingStaff.id : 's_' + Math.floor(Math.random() * 1000000),
      name: formName,
      role: formRole,
      status: formStatus,
      phone: formPhone,
      email: formEmail,
      activeOrdersCount: editingStaff ? editingStaff.activeOrdersCount : 0,
      password: formPassword || '1234'
    };

    if (editingStaff) {
      onUpdateStaff(payload);
      alert('¡Personal actualizado con éxito!');
    } else {
      onAddStaff(payload);
      alert('¡Miembro del personal registrado con éxito!');
    }

    setIsFormOpen(false);
    setEditingStaff(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro que deseas eliminar de la plantilla a "${name}"?`)) {
      onDeleteStaff(id);
    }
  };

  return (
    <div className="space-y-6" id="staff-management-container">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Plantilla del Personal
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Control de meseros de piso, chefs de cocina y cajeros. Asigna turnos, edita datos de contacto y revisa roles de guardia.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          id="btn-register-staff"
        >
          <Plus className="w-4 h-4" /> Registrar Personal
        </button>
      </div>

      {/* Staff Editor Form (Modal) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-5 animate-fade-in"
            id="staff-editing-form"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base font-sans">
                {editingStaff ? 'Actualizar Ficha de Personal' : 'Registrar Nuevo Empleado'}
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
              {/* 1. Nombre */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="p. ej. Sofía Vargas"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 p-2.5 bg-slate-50 focus:border-indigo-500"
                />
              </div>

              {/* 2. Puesto / Role */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Puesto / Rol del restaurante</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as StaffRole)}
                  className="w-full text-sm rounded-lg border border-slate-200 p-2.5 bg-slate-50 focus:border-indigo-500"
                >
                  <option value="Mesero">Mesero (Atención de Piso)</option>
                  <option value="Chef">Chef (Cocina y Sazón)</option>
                  <option value="Cajero">Cajero / Cajera (Facturación)</option>
                  <option value="Administrador">Administrador (Gerencia)</option>
                </select>
              </div>

              {/* 3. Status de Guardia */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Estado de Guardia</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as StaffStatus)}
                  className="w-full text-sm rounded-lg border border-slate-200 p-2.5 bg-slate-50 focus:border-indigo-500"
                >
                  <option value="Activo">Activo (De Guardia)</option>
                  <option value="Descanso">En Descanso</option>
                  <option value="Inactivo">Inactivo / Vacaciones</option>
                </select>
              </div>

              {/* 4. Contactos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Teléfono de contacto</label>
                  <input
                    type="tel"
                    placeholder="55xxxxxxxx"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-200 p-2.5 bg-slate-50 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">E-mail corporativo</label>
                  <input
                    type="email"
                    placeholder="nombre@restaurante.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-200 p-2.5 bg-slate-50 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 5. Contraseña / PIN para acceso */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Contraseña o PIN de Acceso *</label>
                <input
                  type="text"
                  required
                  placeholder="Mínimo 4 caracteres (p. ej. 1234)"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 p-2.5 bg-slate-50 focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-450">Código asignado para que el personal ingrese con su sesión al sistema.</p>
              </div>
            </div>

            {/* Form actions CTAs */}
            <div className="border-t border-slate-100 pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 text-xs font-bold rounded-lg cursor-pointer animate-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold rounded-lg cursor-pointer"
              >
                {editingStaff ? 'Actualizar Ficha' : 'Registrar Empleado'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of employees cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="staff-roster-grid">
        {staffList.map(item => {
          // badges and icons styles
          let badgeColor = 'bg-slate-150 text-slate-700';
          if (item.status === 'Activo') badgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
          else if (item.status === 'Descanso') badgeColor = 'bg-amber-50 text-amber-700 border border-amber-100';
          else if (item.status === 'Inactivo') badgeColor = 'bg-rose-50 text-rose-700 border border-rose-100';

          return (
            <div 
              key={item.id} 
              id={`staff-card-${item.id}`}
              className="bg-white rounded-xl border border-slate-100 p-5 shadow-2xs flex flex-col justify-between hover:border-indigo-100 transition-all"
            >
              <div className="space-y-4">
                {/* Header card info */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                      {item.role === 'Chef' ? <ChefHat className="w-5 h-5" /> : <UserSquare2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{item.name}</h4>
                      <p className="text-xs text-slate-400 font-semibold">{item.role}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                    {item.status}
                  </span>
                </div>

                {/* Body Details list */}
                <div className="space-y-2 border-t border-slate-50 pt-3 text-xs text-slate-650">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{item.phone || 'Sin registrar'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{item.email || 'Sin registrar'}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1.5 border-t border-slate-150/10 mt-1.5 border-dashed">
                    <span className="font-bold text-[10px] uppercase text-amber-500">Contraseña/NIP:</span>
                    <span className="font-mono bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-400 font-semibold">{item.password || '1234'}</span>
                  </div>
                </div>
              </div>

              {/* Actions footer rows */}
              <div className="border-t border-slate-50 pt-4 mt-4 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Código Id: {item.id.toUpperCase()}</span>
                
                <div className="flex gap-2">
                  {/* Edit */}
                  <button
                    onClick={() => openEditForm(item)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:text-indigo-600 hover:border-indigo-250 transition-all bg-white cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-1.5 rounded-lg border border-slate-250 hover:text-rose-600 hover:border-rose-250 transition-all bg-white cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {staffList.length === 0 && (
          <div className="col-span-full bg-white border border-dashed text-slate-400 text-center py-16 space-y-3 rounded-xl max-w-sm mx-auto">
            <Contact className="w-10 h-10 mx-auto stroke-[1.5] text-slate-300" />
            <h4 className="font-bold text-slate-650">Roster Vacío</h4>
            <p className="text-xs">Aún no se han registrado trabajadores en la plantilla.</p>
          </div>
        )}
      </div>
    </div>
  );
};
