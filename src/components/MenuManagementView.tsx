import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Utensils, 
  DollarSign, 
  Clock, 
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';
import { Dish, DishCategory } from '../types';

interface MenuManagementViewProps {
  dishes: Dish[];
  onAddDish: (dish: Dish) => void;
  onUpdateDish: (dish: Dish) => void;
  onDeleteDish: (dishId: string) => void;
}

export const MenuManagementView: React.FC<MenuManagementViewProps> = ({
  dishes,
  onAddDish,
  onUpdateDish,
  onDeleteDish,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('Todos');

  // Add/Edit Form State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  // Form Fields
  const [formName, setFormName] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formCategory, setFormCategory] = useState<DishCategory>('Plato Fuerte');
  const [formPrepTime, setFormPrepTime] = useState<number>(10);
  const [formIsAvailable, setFormIsAvailable] = useState<boolean>(true);

  const openAddForm = () => {
    setEditingDish(null);
    setFormName('');
    setFormDescription('');
    setFormPrice(0);
    setFormCategory('Plato Fuerte');
    setFormPrepTime(10);
    setFormIsAvailable(true);
    setIsFormOpen(true);
  };

  const openEditForm = (dish: Dish) => {
    setEditingDish(dish);
    setFormName(dish.name);
    setFormDescription(dish.description);
    setFormPrice(dish.price);
    setFormCategory(dish.category);
    setFormPrepTime(dish.preparationTime);
    setFormIsAvailable(dish.isAvailable);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Por favor ingresa un nombre válido para el platillo.');
      return;
    }
    if (formPrice <= 0) {
      alert('Por favor ingresa un precio mayor a 0 pesos.');
      return;
    }

    const dishPayload: Dish = {
      id: editingDish ? editingDish.id : 'd_' + Math.floor(Math.random() * 1000000),
      name: formName,
      description: formDescription,
      price: parseFloat(formPrice.toString()),
      category: formCategory,
      preparationTime: parseInt(formPrepTime.toString()) || 5,
      isAvailable: formIsAvailable
    };

    if (editingDish) {
      onUpdateDish(dishPayload);
      alert('¡Platillo actualizado exitosamente!');
    } else {
      onAddDish(dishPayload);
      alert('¡Nuevo platillo agregado al menú del restaurante!');
    }

    setIsFormOpen(false);
    setEditingDish(null);
  };

  const handleToggleState = (dish: Dish) => {
    onUpdateDish({
      ...dish,
      isAvailable: !dish.isAvailable
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro que deseas remover "${name}" permanentemente del menú?`)) {
      onDeleteDish(id);
    }
  };

  // Filter logic
  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          dish.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategoryFilter === 'Todos' || dish.category === activeCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="menu-management-container">
      {/* Header controls layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" /> Carta & Menú del Restaurante
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Administra los platillos que tus meseros pueden ofrecer en las mesas, ajusta precios y disponibilidad.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          id="btn-add-new-dish"
        >
          <Plus className="w-4 h-4" /> Agregar Platillo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORM MODAL PANEL (If Open) */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <form 
              onSubmit={handleSubmit} 
              className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-5 animate-fade-in"
              id="dish-editor-form"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-base">
                  {editingDish ? 'Editar Platillo' : 'Nuevo Platillo de Menú'}
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
                  <label className="text-xs font-bold text-slate-500 uppercase">Nombre del platillo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Milanesa de Pollo, Pasta Alfredo, etc."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-200 p-2.5 bg-slate-50 focus:border-indigo-500"
                  />
                </div>

                {/* 2. Categoría */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Categoría</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as DishCategory)}
                    className="w-full text-sm rounded-lg border border-slate-200 p-2.5 bg-slate-50 focus:border-indigo-500"
                  >
                    <option value="Entrada">Entrada</option>
                    <option value="Plato Fuerte">Plato Fuerte</option>
                    <option value="Bebida">Bebida</option>
                    <option value="Postre">Postre</option>
                  </select>
                </div>

                {/* 3. Precio y tiempo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Precio ($ MXN) *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        step="0.50"
                        required
                        placeholder="180.00"
                        value={formPrice || ''}
                        onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                        className="w-full text-sm rounded-lg border border-slate-200 p-2.5 pl-8 bg-slate-50 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Prep (Minutos)</label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        placeholder="15"
                        min="1"
                        value={formPrepTime || ''}
                        onChange={(e) => setFormPrepTime(parseInt(e.target.value) || 5)}
                        className="w-full text-sm rounded-lg border border-slate-200 p-2.5 pl-8 bg-slate-50 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Descripción */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Ingredientes y Descripción</label>
                  <textarea
                    placeholder="Describir los ingredientes, guarniciones y alérgenos..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                    className="w-full text-sm rounded-lg border border-slate-200 p-2.5 bg-slate-50 focus:border-indigo-500"
                  />
                </div>

                {/* 5. Disponible */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is-available-check"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="is-available-check" className="text-xs font-bold text-slate-600 uppercase cursor-pointer select-none">
                    Disponible inmediatamente para venta
                  </label>
                </div>
              </div>

              {/* Toggles and CTA submit */}
              <div className="border-t border-slate-100 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold rounded-lg cursor-pointer"
                >
                  {editingDish ? 'Guardar Cambios' : 'Registrar Platillo'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Catalog Main Panel (Always visible) */}
        <div className="lg:col-span-12 space-y-6" id="menu-catalog-main">
          {/* SEARCH & FILTER LAYOUT */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between" id="menu-search-bar">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-450" />
              <input
                type="text"
                placeholder="Buscar platillo, ingrediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-250 py-2.5 pl-10 pr-4 bg-white focus:outline-hidden focus:border-indigo-500 shadow-2xs"
              />
            </div>

            {/* Visual categories strip bar */}
            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1" id="category-catalog-pills">
              {['Todos', 'Entrada', 'Plato Fuerte', 'Bebida', 'Postre'].map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategoryFilter(category)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeCategoryFilter === category
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white border text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN MENU DISH LISTING GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="menu-dishes-listing">
            {filteredDishes.map(dish => (
              <div
                key={dish.id}
                id={`dish-card-${dish.id}`}
                className={`bg-white border rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between ${
                  dish.isAvailable ? 'border-slate-100 hover:border-indigo-100' : 'border-stone-200 bg-stone-50/50 opacity-80'
                }`}
              >
                {/* Upper Body info */}
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                        {dish.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 mt-1">{dish.name}</h4>
                    </div>
                    <span className="text-sm font-extrabold text-slate-850 font-mono">
                      ${dish.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-normal min-h-[40px] line-clamp-3">
                    {dish.description || 'Sin descripción detallada por el momento.'}
                  </p>
                </div>

                {/* Footer specs / status & controls */}
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dish.preparationTime} min tiempo prep</span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2">
                    {/* Toggle availability */}
                    <button
                      onClick={() => handleToggleState(dish)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        dish.isAvailable
                          ? 'bg-green-50 border-green-100 text-green-700 hover:bg-green-100'
                          : 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100'
                      }`}
                      title={dish.isAvailable ? 'Poner como agotado' : 'Habilitar platillo'}
                    >
                      {dish.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEditForm(dish)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-350 transition-all cursor-pointer"
                      title="Editar características"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(dish.id, dish.name)}
                      className="p-1.5 rounded-lg border border-slate-250 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-350 transition-all cursor-pointer"
                      title="Quitar de la carta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredDishes.length === 0 && (
              <div className="col-span-full bg-white border rounded-xl py-16 text-center text-slate-400 space-y-3">
                <Utensils className="w-10 h-10 mx-auto stroke-[1.5] text-slate-300" />
                <h4 className="font-bold text-slate-650">No hay platos que coincidan</h4>
                <p className="text-xs">Usa otros filtros o agrega una nueva comida arriba.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
