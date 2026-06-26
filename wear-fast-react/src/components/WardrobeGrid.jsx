import { useState, useEffect } from 'react';
import WardrobeCard from './WardrobeCard';
import WardrobeForm from './WardrobeForm';

const STORAGE_KEY = 'wf_items';

function loadItems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  const parsed = JSON.parse(raw);

  // map Phase 2's "photo" field to "image" for consistency
  return parsed.map((item) => ({
    ...item,
    image: item.photo,
  }));
}

function saveItems(items) {
  // map back to "photo" so Phase 2's prototype still reads it correctly
  const toSave = items.map(({ image, ...rest }) => ({
    ...rest,
    photo: image,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

function WardrobeGrid() {
  const [items, setItems] = useState(() => loadItems());
  const [editingItem, setEditingItem] = useState(null); // null = add mode
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (items.length > 0) saveItems(items);
  }, [items]);

  function handleAddClick() {
    setEditingItem(null);
    setShowForm(true);
  }

  function handleEdit(id) {
    const item = items.find((i) => i.id === id);
    setEditingItem(item);
    setShowForm(true);
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleFormSubmit(item) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => (i.id === item.id ? item : i));
      }
      return [...prev, item];
    });
    setShowForm(false);
    setEditingItem(null);
  }

  return (
    <div className="wardrobe-grid-container">
      <button onClick={handleAddClick} className="wardrobe-grid__add-btn">
        + Add Item
      </button>

      {showForm && (
        <WardrobeForm
          key={editingItem?.id || 'new'}
          initialData={editingItem}
          onSubmit={handleFormSubmit}
        />
      )}

      <div className="wardrobe-grid">
        {items.map((item) => (
          <WardrobeCard
            key={item.id}
            item={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default WardrobeGrid;