function WardrobeCard({ item, onEdit, onDelete }) {
  const { id, name, category, color, occasion, image } = item;

  return (
    <div className="wardrobe-card">
      <img src={image} alt={name} className="wardrobe-card__image" />

      <div className="wardrobe-card__body">
        <h3 className="wardrobe-card__name">{name}</h3>

        <div className="wardrobe-card__badges">
          <span className="badge badge--category">{category}</span>
          <span className="badge badge--color">{color}</span>
          <span className="badge badge--occasion">{occasion}</span>
        </div>
      </div>

      <div className="wardrobe-card__actions">
        <button
          className="icon-btn"
          onClick={() => onEdit(id)}
          aria-label="Edit item"
        >
          {/* pencil icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>

        <button
          className="icon-btn icon-btn--danger"
          onClick={() => onDelete(id)}
          aria-label="Delete item"
        >
          {/* trash icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default WardrobeCard;