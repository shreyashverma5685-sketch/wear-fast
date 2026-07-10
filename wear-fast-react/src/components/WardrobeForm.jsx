import { useState } from 'react';

const CATEGORIES = ['top', 'bottom', 'dress', 'shoes', 'accessory'];
const OCCASIONS = ['casual', 'formal', 'party', 'work', 'sport'];
const COLORS = ['black', 'white', 'grey', 'navy', 'beige', 'brown', 'red', 'blue', 'green', 'yellow', 'pink', 'orange', 'purple'];
const PATTERNS = ['solid', 'striped', 'checked', 'printed'];
const FITS = ['slim', 'regular', 'loose', 'oversized'];
const FABRIC_WEIGHTS = ['light', 'medium', 'heavy'];
const FORMALITIES = ['casual', 'smart-casual', 'formal'];

function WardrobeForm({ onSubmit, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);
  const [color, setColor] = useState(initialData?.color || COLORS[0]);
  const [pattern, setPattern] = useState(initialData?.pattern || PATTERNS[0]);
  const [occasion, setOccasion] = useState(initialData?.occasion || OCCASIONS[0]);
  const [fit, setFit] = useState(initialData?.fit || FITS[1]);
  const [fabricWeight, setFabricWeight] = useState(initialData?.fabricWeight || FABRIC_WEIGHTS[1]);
  const [formality, setFormality] = useState(initialData?.formality || FORMALITIES[0]);
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
    ...(initialData?._id && { _id: initialData._id }),
    name,
    category,
    color,
    pattern,
    occasion,
    fit,
    fabricWeight,
    formality,
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
        <select value={color} onChange={(e) => setColor(e.target.value)}>
          {COLORS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <label>
        Pattern
        <select value={pattern} onChange={(e) => setPattern(e.target.value)}>
          {PATTERNS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
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
        Fit
        <select value={fit} onChange={(e) => setFit(e.target.value)}>
          {FITS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </label>

      <label>
        Fabric weight
        <select value={fabricWeight} onChange={(e) => setFabricWeight(e.target.value)}>
          {FABRIC_WEIGHTS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </label>

      <label>
        Formality
        <select value={formality} onChange={(e) => setFormality(e.target.value)}>
          {FORMALITIES.map((f) => (
            <option key={f} value={f}>{f}</option>
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