import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WardrobeCard from './WardrobeCard';
import WardrobeForm from './WardrobeForm';
import FilterBar from './FilterBar';

const API_URL = 'http://localhost:5000/items';

function WardrobeGrid() {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();

  const token = localStorage.getItem('wf_token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    async function fetchItems() {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.status === 401) {
        navigate('/login');
        return;
      }
      const data = await res.json();
      setItems(data);
    }

    fetchItems();
  }, [token, navigate]);

  function handleAddClick() {
    setEditingItem(null);
    setShowForm(true);
  }

  function handleEdit(id) {
    const item = items.find((i) => i._id === id);
    setEditingItem(item);
    setShowForm(true);
  }

  async function handleDelete(id) {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems((prev) => prev.filter((i) => i._id !== id));
  }

  async function handleFormSubmit(item) {
    const isEditing = Boolean(item._id);
    const url = isEditing ? `${API_URL}/${item._id}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(item),
    });
    const saved = await res.json();

    setItems((prev) => {
      const exists = prev.some((i) => i._id === saved._id);
      if (exists) return prev.map((i) => (i._id === saved._id ? saved : i));
      return [...prev, saved];
    });

    setShowForm(false);
    setEditingItem(null);
  }

  const visibleItems = categoryFilter === 'all'
    ? items
    : items.filter((item) => item.category === categoryFilter);

  return (
    <div className="wardrobe-grid-container">
      <button onClick={handleAddClick} className="wardrobe-grid__add-btn">
        + Add Item
      </button>

      {showForm && (
        <WardrobeForm
          key={editingItem?._id || 'new'}
          initialData={editingItem}
          onSubmit={handleFormSubmit}
        />
      )}

      <FilterBar selected={categoryFilter} onSelect={setCategoryFilter} />

      <div className="wardrobe-grid">
        {visibleItems.map((item) => (
          <WardrobeCard
            key={item._id}
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