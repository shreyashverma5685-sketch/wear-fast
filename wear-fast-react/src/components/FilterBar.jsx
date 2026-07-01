const CATEGORIES = ['all', 'top', 'bottom', 'dress', 'shoes', 'accessory'];

function FilterBar({ selected, onSelect }) {
  return (
    <div className="filter-bar">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          className={`filter-pill ${selected === cat ? 'filter-pill--active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;