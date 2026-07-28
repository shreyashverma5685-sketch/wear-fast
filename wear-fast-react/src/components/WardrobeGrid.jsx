import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WardrobeCard from "./WardrobeCard";
import WardrobeForm from "./WardrobeForm";
import FilterBar from "./FilterBar";

const API_URL = "http://localhost:5000/items";

function WardrobeGrid() {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("wf_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    async function fetchItems() {
      try {
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.status === 401) {
          navigate("/login");
          return;
        }
        const data = await res.json();
        setItems(data);
      } catch (e) {
        console.error("Failed to fetch wardrobe items:", e);
      } finally {
        setLoading(false);
      }
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
    if (!window.confirm("Are you sure you want to delete this wardrobe item?")) return;
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems((prev) => prev.filter((i) => i._id !== id));
  }

  async function handleFormSubmit(item) {
    const isEditing = Boolean(item._id);
    const url = isEditing ? `${API_URL}/${item._id}` : API_URL;
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
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

  const visibleItems = categoryFilter === "all"
    ? items
    : items.filter((item) => item.category === categoryFilter);

  return (
    <div className="w-full space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-linen-border pb-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">My Wardrobe</h1>
          <p className="font-sans text-xs text-muted">Manage your clothes, tops, bottoms, shoes & accessories</p>
        </div>

        <button
          onClick={handleAddClick}
          className="bg-denim hover:bg-denim-light text-linen-card font-display text-sm font-semibold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add New Item</span>
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <WardrobeForm
            key={editingItem?._id || "new"}
            initialData={editingItem}
            onSubmit={handleFormSubmit}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      <FilterBar selected={categoryFilter} onSelect={setCategoryFilter} />

      {loading ? (
        <p className="font-sans text-sm text-muted">Loading your clothing catalog...</p>
      ) : visibleItems.length === 0 ? (
        <div className="bg-linen-card border border-linen-border rounded-xl p-12 text-center space-y-3 card-shadow my-6">
          <div className="w-12 h-12 rounded-full bg-denim/10 text-denim flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
            </svg>
          </div>
          <h3 className="font-display text-xl font-bold text-ink">No Clothing Items Found</h3>
          <p className="font-sans text-xs text-muted max-w-sm mx-auto">
            {categoryFilter !== "all"
              ? `No items found in category "${categoryFilter}".`
              : "Your wardrobe is empty right now. Add your first item to start creating outfits!"}
          </p>
          <button
            onClick={handleAddClick}
            className="bg-denim text-linen-card font-display text-xs uppercase tracking-wider px-4 py-2 rounded-lg font-semibold inline-block"
          >
            + Add First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
          {visibleItems.map((item) => (
            <WardrobeCard
              key={item._id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default WardrobeGrid;