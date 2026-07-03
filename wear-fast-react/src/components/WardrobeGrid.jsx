import { useState, useEffect } from "react";
import WardrobeCard from "./WardrobeCard";
import WardrobeForm from "./WardrobeForm";
import FilterBar from "./FilterBar";
import { useNavigate } from "react-router-dom";

function WardrobeGrid() {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const navigate = useNavigate();

  const token = localStorage.getItem("wf_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
   fetch("http://localhost:5000/items", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => setItems(data))
    .catch(() => console.log("Failed to fetch items"));
    }, [token, navigate] );

  const handleSubmit = async (item) => {
    try {
      if (editingItem) {
        const response = await fetch(`http://localhost:5000/items/${editingItem._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(item),
        });
        const updated = await response.json();
        setItems(items.map((i) => (i._id === updated._id ? updated : i)));
      } else {
        const response = await fetch("http://localhost:5000/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(item),
        });
        const created = await response.json();
        setItems([...items, created]);
      }
    } catch {
      console.log("Failed to save item");
    }
    setEditingItem(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(items.filter((i) => i._id !== id));
    } catch {
      console.log("Failed to delete item");
    }
  };

  const handleEdit = (id) => {
    const item = items.find((i) => i._id === id);
    setEditingItem(item);
    setShowForm(true);
  };

  const filtered = categoryFilter === "all"
    ? items
    : items.filter((i) => i.category === categoryFilter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem" }}>
        <h2>My Wardrobe</h2>
        <button onClick={() => { setEditingItem(null); setShowForm(true); }}>+ Add Item</button>
      </div>
      {showForm && (
        <WardrobeForm
          key={editingItem?._id || "new"}
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => { setEditingItem(null); setShowForm(false); }}
        />
      )}

      <FilterBar selected={categoryFilter} onSelect={setCategoryFilter} />

      <div className="wardrobe-grid">
        {filtered.map((item) => (
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