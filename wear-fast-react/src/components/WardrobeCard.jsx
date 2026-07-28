function WardrobeCard({ item, onEdit, onDelete }) {
  const { _id, name, category, color, pattern, occasion, fit, fabricWeight, formality, image } = item;

  return (
    <div className="bg-linen-card border border-linen-border rounded-xl overflow-hidden group card-shadow card-hover flex flex-col justify-between">
      <div>
        <div className="relative w-full aspect-square bg-linen flex items-center justify-center overflow-hidden border-b border-linen-border/60">
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="text-muted flex flex-col items-center justify-center p-3 text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
              </svg>
              <span className="font-mono-tag text-[9px] uppercase mt-1">{category}</span>
            </div>
          )}
          {formality && (
            <span className="absolute bottom-2 left-2 font-mono-tag text-[9px] tracking-wider uppercase bg-ink/85 text-linen-card px-2 py-0.5 rounded shadow-sm">
              {formality}
            </span>
          )}
        </div>

        <div className="p-3.5 space-y-2">
          <h3 className="font-display text-base font-bold text-ink truncate leading-snug">{name}</h3>

          <div className="flex flex-wrap gap-1">
            <span className="font-mono-tag text-[9px] text-muted uppercase bg-linen px-2 py-0.5 rounded border border-linen-border/60">
              {category}
            </span>
            <span className="font-mono-tag text-[9px] text-muted uppercase bg-linen px-2 py-0.5 rounded border border-linen-border/60">
              {color}
            </span>
            {pattern && pattern !== "solid" && (
              <span className="font-mono-tag text-[9px] text-brick uppercase bg-brick/10 px-2 py-0.5 rounded">
                {pattern}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1 text-muted">
            <span className="font-mono-tag text-[9px] uppercase">{occasion}</span>
            <span className="font-mono-tag text-[9px] uppercase">· {fit}</span>
            <span className="font-mono-tag text-[9px] uppercase">· {fabricWeight}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-1.5 px-3.5 pb-3 pt-1 border-t border-linen-border/40 bg-linen/30">
        <button
          className="p-1.5 rounded-md text-muted hover:text-denim hover:bg-denim/10 transition-colors"
          onClick={() => onEdit(_id)}
          aria-label="Edit item"
          title="Edit Item"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>

        <button
          className="p-1.5 rounded-md text-muted hover:text-brick hover:bg-brick/10 transition-colors"
          onClick={() => onDelete(_id)}
          aria-label="Delete item"
          title="Delete Item"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default WardrobeCard;