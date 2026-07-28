import { useState } from 'react';

const CATEGORIES = ['top', 'bottom', 'dress', 'shoes', 'accessory'];
const OCCASIONS = ['casual', 'formal', 'party', 'work', 'sport'];
const COLORS = ['black', 'white', 'grey', 'navy', 'beige', 'brown', 'red', 'blue', 'green', 'yellow', 'pink', 'orange', 'purple'];
const PATTERNS = ['solid', 'striped', 'checked', 'printed'];
const FITS = ['slim', 'regular', 'loose', 'oversized'];
const FABRIC_WEIGHTS = ['light', 'medium', 'heavy'];
const FORMALITIES = ['casual', 'smart-casual', 'formal'];

const MAX_IMAGE_WIDTH = 800;
const IMAGE_QUALITY = 0.8; // JPEG quality, 0-1

function WardrobeForm({ onSubmit, onClose, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);
  const [color, setColor] = useState(initialData?.color || COLORS[0]);
  const [pattern, setPattern] = useState(initialData?.pattern || PATTERNS[0]);
  const [occasion, setOccasion] = useState(initialData?.occasion || OCCASIONS[0]);
  const [fit, setFit] = useState(initialData?.fit || FITS[1]);
  const [fabricWeight, setFabricWeight] = useState(initialData?.fabricWeight || FABRIC_WEIGHTS[1]);
  const [formality, setFormality] = useState(initialData?.formality || FORMALITIES[0]);
  const [image, setImage] = useState(initialData?.image || '');
  const [compressing, setCompressing] = useState(false);

  // Reads the picked file, draws it onto a canvas scaled down to
  // MAX_IMAGE_WIDTH, and resolves with a compressed base64 JPEG —
  // keeps large phone photos from bloating MongoDB storage.
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, MAX_IMAGE_WIDTH / img.width);
          const targetWidth = Math.round(img.width * scale);
          const targetHeight = Math.round(img.height * scale);

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setImage(compressed);
    } catch (err) {
      console.error('Image compression failed:', err);
      alert('Could not process that image — please try a different file.');
    } finally {
      setCompressing(false);
    }
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

  const selectClass = "font-display text-sm border border-linen-border rounded-tag px-2 py-1.5 bg-linen text-ink";
  const labelClass = "flex flex-col gap-1";
  const labelTextClass = "font-mono-tag text-[10px] text-muted uppercase";

  return (
    <form
      onSubmit={handleSubmit}
      className="relative bg-linen-card border border-linen-border rounded-card p-5 max-w-md mx-auto"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close form"
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-tag text-muted hover:text-brick hover:bg-linen transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18" />
          <path d="M6 6l12 12" />
        </svg>
      </button>

      <h3 className="font-display text-lg font-semibold text-ink mb-4">
        {initialData ? 'Edit Item' : 'Add New Item'}
      </h3>

      <div className="flex flex-col gap-3">
        <label className={labelClass}>
          <span className={labelTextClass}>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={selectClass}
          />
        </label>

        <label className={labelClass}>
          <span className={labelTextClass}>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          <span className={labelTextClass}>Color</span>
          <select value={color} onChange={(e) => setColor(e.target.value)} className={selectClass}>
            {COLORS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          <span className={labelTextClass}>Pattern</span>
          <select value={pattern} onChange={(e) => setPattern(e.target.value)} className={selectClass}>
            {PATTERNS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          <span className={labelTextClass}>Occasion</span>
          <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className={selectClass}>
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          <span className={labelTextClass}>Fit</span>
          <select value={fit} onChange={(e) => setFit(e.target.value)} className={selectClass}>
            {FITS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          <span className={labelTextClass}>Fabric weight</span>
          <select value={fabricWeight} onChange={(e) => setFabricWeight(e.target.value)} className={selectClass}>
            {FABRIC_WEIGHTS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          <span className={labelTextClass}>Formality</span>
          <select value={formality} onChange={(e) => setFormality(e.target.value)} className={selectClass}>
            {FORMALITIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          <span className={labelTextClass}>Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="font-display text-sm text-ink file:mr-3 file:py-1.5 file:px-3 file:rounded-tag file:border-0 file:bg-denim file:text-linen-card file:text-xs file:uppercase file:tracking-wide file:cursor-pointer"
          />
          {compressing && (
            <span className="font-mono-tag text-[10px] text-muted uppercase">Processing image...</span>
          )}
        </label>

        {image && !compressing && (
          <img src={image} alt="preview" className="w-32 h-32 object-cover rounded-tag mx-auto" />
        )}

        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 font-display text-sm uppercase tracking-wide px-4 py-2 rounded-tag border border-linen-border text-muted hover:border-denim hover:text-denim transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={compressing}
            className="flex-1 bg-denim hover:bg-denim-light text-linen-card font-display text-sm uppercase tracking-wide px-4 py-2 rounded-tag transition-colors duration-200 disabled:opacity-60"
          >
            {initialData ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default WardrobeForm;