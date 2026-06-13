const store = {
  getItems: () => JSON.parse(localStorage.getItem('wf_items') || '[]'),
  saveItems: (items) => localStorage.setItem('wf_items', JSON.stringify(items)),
  addItem: (item) => {
    const items = store.getItems();
    items.push(item);
    store.saveItems(items);
  },
  deleteItem: (id) => {
    store.saveItems(store.getItems().filter(i => i.id !== id));
  }
};

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('page-' + btn.dataset.page).classList.add('active');
  });
});

const overlay = document.getElementById('modal-overlay');
document.getElementById('open-modal').addEventListener('click', () => overlay.classList.remove('hidden'));
document.getElementById('close-modal').addEventListener('click', () => closeModal());
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

function closeModal() {
  overlay.classList.add('hidden');
  document.getElementById('item-name').value = '';
  document.getElementById('item-color').value = '';
  document.getElementById('photo-preview').classList.add('hidden');
  document.getElementById('preview-placeholder').classList.remove('hidden');
  document.getElementById('item-photo').value = '';
}

document.getElementById('item-photo').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('photo-preview');
    preview.src = e.target.result;
    preview.classList.remove('hidden');
    document.getElementById('preview-placeholder').classList.add('hidden');
  };
  reader.readAsDataURL(file);
});

document.getElementById('save-item').addEventListener('click', () => {
  const name = document.getElementById('item-name').value.trim();
  const category = document.getElementById('item-category').value;
  const color = document.getElementById('item-color').value.trim();
  const occasion = document.getElementById('item-occasion').value;

  if (!name) { alert('Please enter a name for the item.'); return; }

  const item = {
    id: Date.now().toString(),
    name,
    category,
    color,
    occasion,
    photo: document.getElementById('photo-preview').classList.contains('hidden') ? null : document.getElementById('photo-preview').src,
    addedAt: new Date().toISOString()
  };

  store.addItem(item);
  closeModal();
  renderGrid(currentFilter);
});

let currentFilter = 'all';

function renderGrid(filter = 'all') {
  currentFilter = filter;
  const items = store.getItems();
  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);
  const grid = document.getElementById('wardrobe-grid');
  const empty = document.getElementById('empty-msg');

  grid.innerHTML = '';

  if (filtered.length === 0) {
    empty.classList.add('visible');
    return;
  }
  empty.classList.remove('visible');

  const emoji = { top:'👕', bottom:'👖', shoes:'👟', jacket:'🧥', accessories:'👜' };

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      ${item.photo
        ? `<img class="card-img" src="${item.photo}" alt="${item.name}" />`
        : `<div class="card-img-placeholder">${emoji[item.category] || '👗'}</div>`}
      <div class="card-body">
        <div class="card-name">${item.name}</div>
        <div class="card-meta">
          <span class="badge badge-cat">${item.category}</span>
          <span class="badge badge-occ">${item.occasion}</span>
          ${item.color ? `<span class="badge badge-col">${item.color}</span>` : ''}
        </div>
        <button class="card-del" data-id="${item.id}">Remove</button>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.card-del').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Remove this item?')) {
        store.deleteItem(btn.dataset.id);
        renderGrid(currentFilter);
      }
    });
  });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGrid(btn.dataset.filter);
  });
});

renderGrid();