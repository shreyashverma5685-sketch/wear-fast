import { useState } from 'react';

const CATEGORIES = ['top', 'bottom', 'dress', 'shoes', 'accessory'];
const OCCASIONS = ['casual', 'formal', 'party', 'work', 'sport'];

function WardrobeForm({ onSubmit, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);
  const [color, setColor] = useState(initialData?.color || '');
  const [occasion, setOccasion] = useState(initialData?.occasion || OCCASIONS[0]);
  const [image, setImage] = useState(initialData?.image || '');

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result); // base64 string
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const item = {
      id: initialData?.id || String(Date.now()),
      name,
      category,
      color,
      occasion,
      image,
    };

    onSubmit(item);
  }

  return (
    <form className="wardrobe-form" onSubmit={handleSubmit}>
      <label>
        Name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <label>
        Color
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          required
        />
      </label>

      <label>
        Occasion
        <select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
          {OCCASIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </label>

      <label>
        Image
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </label>

      {image && (
        <img src={image} alt="preview" className="wardrobe-form__preview" />
      )}

      <button type="submit">
        {initialData ? 'Save Changes' : 'Add Item'}
      </button>
    </form>
  );
}

export default WardrobeForm;