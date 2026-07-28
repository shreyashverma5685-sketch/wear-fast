const CATEGORIES = ['all', 'top', 'bottom', 'dress', 'shoes', 'accessory'];

function FilterBar({ selected, onSelect }) {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <span className="font-mono-tag text-xs text-muted uppercase font-bold mr-1">Filter:</span>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`font-display text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all duration-200 ${
            selected === cat
              ? 'bg-ink text-linen-card shadow-sm'
              : 'bg-linen-card border border-linen-border text-muted hover:border-denim hover:text-denim'
          }`}
        >
          {cat === 'all' ? 'All Items' : cat}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;