// ===== State =====
let boards = [];
let currentBoardId = null;
let editingCardId = null;
let editingCardColumnId = null;
let dragState = null; // { cardId, fromColumnId, element, placeholder }
let confirmCallback = null;
const columnSortModes = {}; // { [columnId]: 'priority' | 'dueDate' | null }

const STORAGE_KEY = 'boards';

// ===== Storage =====
function load() {
  try {
    boards = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    boards = [];
  }
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
}

// ===== ID Generator =====
let _idSeq = Date.now();
function uid(prefix) { return `${prefix}-${++_idSeq}`; }

// ===== DOM helpers =====
const $ = id => document.getElementById(id);
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  $(id).classList.remove('hidden');
}

// ===== Board List Render =====
function renderBoardList() {
  const grid = $('board-grid');
  grid.innerHTML = '';

  if (boards.length === 0) {
    $('empty-boards').classList.remove('hidden');
    return;
  }
  $('empty-boards').classList.add('hidden');

  boards.forEach(board => {
    const cardCount = board.columns.reduce((sum, col) => sum + col.cards.length, 0);
    const card = document.createElement('div');
    card.className = 'board-card';
    card.dataset.boardId = board.id;
    card.innerHTML = `
      <div class="board-card-color"></div>
      <div class="board-card-body">
        <div class="board-card-title" data-title-id="${board.id}">${esc(board.title)}</div>
        <div class="board-card-meta">${board.columns.length} カラム · ${cardCount} カード</div>
      </div>
      <div class="board-card-actions">
        <button class="btn-icon btn-delete-board" data-board-id="${board.id}" title="削除">🗑 削除</button>
      </div>
    `;

    // ボード名クリック → インライン編集
    const titleEl = card.querySelector(`[data-title-id="${board.id}"]`);
    titleEl.addEventListener('click', e => {
      e.stopPropagation();
      startBoardTitleEdit(board.id, titleEl);
    });

    // カード全体クリック → 詳細画面
    card.addEventListener('click', e => {
      if (e.target.closest('.btn-delete-board') || e.target.closest('[data-title-id]')) return;
      openBoard(board.id);
    });

    // 削除ボタン
    card.querySelector('.btn-delete-board').addEventListener('click', e => {
      e.stopPropagation();
      confirmDelete(`「${board.title}」を削除しますか？`, () => {
        boards = boards.filter(b => b.id !== board.id);
        save();
        renderBoardList();
      });
    });

    grid.appendChild(card);
  });
}

function startBoardTitleEdit(boardId, el) {
  const board = boards.find(b => b.id === boardId);
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'input board-card-title-input';
  input.value = board.title;
  el.replaceWith(input);
  input.focus();
  input.select();

  function commit() {
    const val = input.value.trim();
    if (val) board.title = val;
    save();
    renderBoardList();
  }
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { input.blur(); }
    if (e.key === 'Escape') { renderBoardList(); }
  });
}

// ===== Open Board =====
function openBoard(boardId) {
  currentBoardId = boardId;
  renderBoardDetail();
  showView('board-detail-view');
}

// ===== Board Detail Render =====
function renderBoardDetail() {
  const board = boards.find(b => b.id === currentBoardId);
  if (!board) return;

  $('board-detail-title').textContent = board.title;

  const wrapper = $('columns-wrapper');
  // 既存カラムを削除（add-column-area は保持）
  wrapper.querySelectorAll('.column').forEach(el => el.remove());

  const addArea = wrapper.querySelector('.add-column-area');

  board.columns.forEach(col => {
    const colEl = createColumnElement(col);
    wrapper.insertBefore(colEl, addArea);
  });
}

function getSortedCards(cards, sortMode) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  if (sortMode === 'priority') {
    return [...cards].sort((a, b) =>
      (priorityOrder[a.priority || 'medium']) - (priorityOrder[b.priority || 'medium'])
    );
  }
  if (sortMode === 'dueDate') {
    return [...cards].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }
  return cards;
}

function createColumnElement(col) {
  const colEl = document.createElement('div');
  colEl.className = 'column';
  colEl.dataset.columnId = col.id;

  const sortMode = columnSortModes[col.id] || null;

  colEl.innerHTML = `
    <div class="column-header">
      <span class="column-title" title="クリックで編集">${esc(col.title)}</span>
      <div class="column-sort-btns">
        <button class="btn-sort ${sortMode === 'priority' ? 'active' : ''}" data-sort="priority" title="優先度順">↑ 優先度</button>
        <button class="btn-sort ${sortMode === 'dueDate' ? 'active' : ''}" data-sort="dueDate" title="期限順">📅 期限</button>
      </div>
      <button class="btn-icon btn-delete-col" title="削除">✕</button>
    </div>
    <div class="column-cards"></div>
    <div class="add-card-area">
      <button class="btn-add-card">＋ カードを追加</button>
      <div class="add-card-form hidden">
        <input type="text" class="input new-card-title" placeholder="カードタイトルを入力" maxlength="100" />
        <div class="form-actions">
          <button class="btn btn-primary btn-submit-card">追加</button>
          <button class="btn btn-ghost btn-cancel-card">キャンセル</button>
        </div>
      </div>
    </div>
  `;

  // カラム名インライン編集
  const titleSpan = colEl.querySelector('.column-title');
  titleSpan.addEventListener('click', () => startColumnTitleEdit(col.id, titleSpan));

  // カラム削除
  colEl.querySelector('.btn-delete-col').addEventListener('click', () => {
    confirmDelete(`カラム「${col.title}」を削除しますか？（カード${col.cards.length}件も削除されます）`, () => {
      const board = boards.find(b => b.id === currentBoardId);
      board.columns = board.columns.filter(c => c.id !== col.id);
      save();
      renderBoardDetail();
    });
  });

  // ソートボタン
  colEl.querySelectorAll('.btn-sort').forEach(btn => {
    btn.addEventListener('click', () => {
      const sort = btn.dataset.sort;
      columnSortModes[col.id] = columnSortModes[col.id] === sort ? null : sort;
      renderBoardDetail();
    });
  });

  // カード一覧
  const cardsEl = colEl.querySelector('.column-cards');
  getSortedCards(col.cards, sortMode).forEach(card => cardsEl.appendChild(createCardElement(card, col.id)));

  // D&D ターゲット
  setupColumnDropTarget(cardsEl, col.id);

  // カード追加
  const btnAddCard = colEl.querySelector('.btn-add-card');
  const addCardForm = colEl.querySelector('.add-card-form');
  const newCardInput = colEl.querySelector('.new-card-title');

  btnAddCard.addEventListener('click', () => {
    btnAddCard.classList.add('hidden');
    addCardForm.classList.remove('hidden');
    newCardInput.focus();
  });
  colEl.querySelector('.btn-cancel-card').addEventListener('click', () => {
    addCardForm.classList.add('hidden');
    btnAddCard.classList.remove('hidden');
    newCardInput.value = '';
  });
  colEl.querySelector('.btn-submit-card').addEventListener('click', () => {
    const val = newCardInput.value.trim();
    if (!val) return;
    addCard(col.id, val);
    newCardInput.value = '';
    addCardForm.classList.add('hidden');
    btnAddCard.classList.remove('hidden');
  });
  newCardInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') colEl.querySelector('.btn-submit-card').click();
    if (e.key === 'Escape') colEl.querySelector('.btn-cancel-card').click();
  });

  return colEl;
}

function createCardElement(card, columnId) {
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.cardId = card.id;
  el.dataset.columnId = columnId;
  el.draggable = true;

  let dueHtml = '';
  if (card.dueDate) {
    const overdue = new Date(card.dueDate) < new Date(new Date().toDateString());
    dueHtml = `<div class="card-due ${overdue ? 'overdue' : ''}">📅 ${card.dueDate}</div>`;
  }

  const priorityLabel = { high: '高', medium: '中', low: '低' };
  const p = card.priority || 'medium';
  const priorityHtml = `<span class="card-priority priority-${p}">${priorityLabel[p]}</span>`;

  el.innerHTML = `
    <div class="card-header-row">${priorityHtml}<div class="card-title">${esc(card.title)}</div></div>
    ${dueHtml}
    <button class="card-delete" title="削除">✕</button>
  `;

  el.querySelector('.card-delete').addEventListener('click', e => {
    e.stopPropagation();
    confirmDelete(`カード「${card.title}」を削除しますか？`, () => {
      deleteCard(columnId, card.id);
    });
  });

  el.addEventListener('click', e => {
    if (e.target.classList.contains('card-delete')) return;
    openCardModal(columnId, card.id);
  });

  // Drag
  el.addEventListener('dragstart', e => {
    dragState = { cardId: card.id, fromColumnId: columnId, element: el };
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    document.querySelectorAll('.drop-placeholder').forEach(p => p.remove());
    document.querySelectorAll('.column-cards').forEach(c => c.classList.remove('drag-over'));
    dragState = null;
  });

  return el;
}

function startColumnTitleEdit(columnId, el) {
  const board = boards.find(b => b.id === currentBoardId);
  const col = board.columns.find(c => c.id === columnId);
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'input column-title-input';
  input.value = col.title;
  el.replaceWith(input);
  input.focus();
  input.select();

  function commit() {
    const val = input.value.trim();
    if (val) { col.title = val; save(); }
    renderBoardDetail();
  }
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') renderBoardDetail();
  });
}

// ===== Drop Target =====
function setupColumnDropTarget(cardsEl, columnId) {
  cardsEl.addEventListener('dragover', e => {
    if (!dragState) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    cardsEl.classList.add('drag-over');

    // プレースホルダー位置計算
    const placeholder = document.querySelector('.drop-placeholder') || (() => {
      const p = document.createElement('div');
      p.className = 'drop-placeholder';
      return p;
    })();

    const afterEl = getDragAfterElement(cardsEl, e.clientY);
    if (afterEl) cardsEl.insertBefore(placeholder, afterEl);
    else cardsEl.appendChild(placeholder);
  });

  cardsEl.addEventListener('dragleave', e => {
    if (!cardsEl.contains(e.relatedTarget)) {
      cardsEl.classList.remove('drag-over');
    }
  });

  cardsEl.addEventListener('drop', e => {
    e.preventDefault();
    if (!dragState) return;

    const board = boards.find(b => b.id === currentBoardId);
    const fromCol = board.columns.find(c => c.id === dragState.fromColumnId);
    const toCol = board.columns.find(c => c.id === columnId);

    const cardIndex = fromCol.cards.findIndex(c => c.id === dragState.cardId);
    const [card] = fromCol.cards.splice(cardIndex, 1);

    const placeholder = cardsEl.querySelector('.drop-placeholder');
    const afterEl = getDragAfterElement(cardsEl, e.clientY);
    let insertIndex;
    if (afterEl) {
      const afterCardId = afterEl.dataset.cardId;
      insertIndex = toCol.cards.findIndex(c => c.id === afterCardId);
    } else {
      insertIndex = toCol.cards.length;
    }
    toCol.cards.splice(insertIndex, 0, card);

    save();
    renderBoardDetail();
  });
}

function getDragAfterElement(container, y) {
  const draggableEls = [...container.querySelectorAll('.card:not(.dragging)')];
  return draggableEls.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > (closest.offset || -Infinity)) {
      return { offset, element: child };
    }
    return closest;
  }, {}).element;
}

// ===== Card CRUD =====
function addCard(columnId, title) {
  const board = boards.find(b => b.id === currentBoardId);
  const col = board.columns.find(c => c.id === columnId);
  col.cards.push({ id: uid('card'), title, description: '', dueDate: null });
  save();
  renderBoardDetail();
}

function deleteCard(columnId, cardId) {
  const board = boards.find(b => b.id === currentBoardId);
  const col = board.columns.find(c => c.id === columnId);
  col.cards = col.cards.filter(c => c.id !== cardId);
  save();
  renderBoardDetail();
}

// ===== Card Modal =====
function openCardModal(columnId, cardId) {
  const board = boards.find(b => b.id === currentBoardId);
  const col = board.columns.find(c => c.id === columnId);
  const card = col.cards.find(c => c.id === cardId);

  editingCardId = cardId;
  editingCardColumnId = columnId;

  $('card-title-input').value = card.title;
  $('card-priority-input').value = card.priority || 'medium';
  $('card-desc-input').value = card.description || '';
  $('card-due-input').value = card.dueDate || '';
  $('card-title-error').classList.add('hidden');

  $('card-modal').classList.remove('hidden');
  $('card-title-input').focus();
}

function closeCardModal() {
  $('card-modal').classList.add('hidden');
  editingCardId = null;
  editingCardColumnId = null;
}

function saveCard() {
  const title = $('card-title-input').value.trim();
  if (!title) {
    $('card-title-error').classList.remove('hidden');
    $('card-title-input').focus();
    return;
  }
  $('card-title-error').classList.add('hidden');

  const board = boards.find(b => b.id === currentBoardId);
  const col = board.columns.find(c => c.id === editingCardColumnId);
  const card = col.cards.find(c => c.id === editingCardId);

  card.title = title;
  card.priority = $('card-priority-input').value;
  card.description = $('card-desc-input').value.trim();
  card.dueDate = $('card-due-input').value || null;

  save();
  renderBoardDetail();
  closeCardModal();
}

// ===== Confirm Dialog =====
function confirmDelete(message, cb) {
  $('confirm-message').textContent = message;
  confirmCallback = cb;
  $('confirm-dialog').classList.remove('hidden');
}

// ===== Escape helper =====
function esc(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== Event Wiring =====

// ボード作成
$('btn-create-board').addEventListener('click', () => {
  $('create-board-form').classList.remove('hidden');
  $('new-board-title').focus();
});
$('btn-cancel-board').addEventListener('click', () => {
  $('create-board-form').classList.add('hidden');
  $('new-board-title').value = '';
});
$('btn-submit-board').addEventListener('click', () => {
  const val = $('new-board-title').value.trim();
  if (!val) return;
  boards.push({ id: uid('board'), title: val, columns: [] });
  save();
  $('new-board-title').value = '';
  $('create-board-form').classList.add('hidden');
  renderBoardList();
});
$('new-board-title').addEventListener('keydown', e => {
  if (e.key === 'Enter') $('btn-submit-board').click();
  if (e.key === 'Escape') $('btn-cancel-board').click();
});

// 一覧へ戻る
$('btn-back').addEventListener('click', () => {
  currentBoardId = null;
  renderBoardList();
  showView('board-list-view');
});

// ボード名インライン編集
$('board-detail-title').addEventListener('click', () => {
  const titleEl = $('board-detail-title');
  const input = $('board-title-input');
  const board = boards.find(b => b.id === currentBoardId);
  input.value = board.title;
  titleEl.classList.add('hidden');
  input.classList.remove('hidden');
  input.focus();
  input.select();
});
$('board-title-input').addEventListener('blur', () => {
  const val = $('board-title-input').value.trim();
  const board = boards.find(b => b.id === currentBoardId);
  if (val) { board.title = val; save(); }
  $('board-detail-title').textContent = board.title;
  $('board-detail-title').classList.remove('hidden');
  $('board-title-input').classList.add('hidden');
});
$('board-title-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') $('board-title-input').blur();
  if (e.key === 'Escape') {
    $('board-detail-title').classList.remove('hidden');
    $('board-title-input').classList.add('hidden');
  }
});

// カラム追加
$('btn-add-column').addEventListener('click', () => {
  $('btn-add-column').classList.add('hidden');
  $('add-column-form').classList.remove('hidden');
  $('new-column-title').focus();
});
$('btn-cancel-column').addEventListener('click', () => {
  $('add-column-form').classList.add('hidden');
  $('btn-add-column').classList.remove('hidden');
  $('new-column-title').value = '';
});
$('btn-submit-column').addEventListener('click', () => {
  const val = $('new-column-title').value.trim();
  if (!val) return;
  const board = boards.find(b => b.id === currentBoardId);
  board.columns.push({ id: uid('column'), title: val, cards: [] });
  save();
  $('new-column-title').value = '';
  $('add-column-form').classList.add('hidden');
  $('btn-add-column').classList.remove('hidden');
  renderBoardDetail();
});
$('new-column-title').addEventListener('keydown', e => {
  if (e.key === 'Enter') $('btn-submit-column').click();
  if (e.key === 'Escape') $('btn-cancel-column').click();
});

// カードモーダル
$('btn-close-modal').addEventListener('click', closeCardModal);
$('btn-cancel-modal').addEventListener('click', closeCardModal);
$('btn-save-modal').addEventListener('click', saveCard);
$('card-modal').addEventListener('click', e => {
  if (e.target === $('card-modal')) closeCardModal();
});
$('card-title-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.isComposing) saveCard();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!$('card-modal').classList.contains('hidden')) closeCardModal();
    if (!$('confirm-dialog').classList.contains('hidden')) $('confirm-dialog').classList.add('hidden');
  }
});

// 確認ダイアログ
$('btn-confirm-ok').addEventListener('click', () => {
  $('confirm-dialog').classList.add('hidden');
  if (confirmCallback) { confirmCallback(); confirmCallback = null; }
});
$('btn-confirm-cancel').addEventListener('click', () => {
  $('confirm-dialog').classList.add('hidden');
  confirmCallback = null;
});

// ===== Init =====
load();

// デモデータ（初回起動時のみ）
if (boards.length === 0) {
  boards = [
    {
      id: 'board-demo',
      title: '学習タスク',
      columns: [
        {
          id: 'col-1',
          title: 'ToDo',
          cards: [
            { id: 'card-1', title: 'Next.js の勉強', description: 'App Router の基礎から始める', dueDate: '2026-06-30', priority: 'high' },
            { id: 'card-2', title: 'TypeScript 型定義の復習', description: '', dueDate: null, priority: 'medium' },
          ]
        },
        {
          id: 'col-2',
          title: '進行中',
          cards: [
            { id: 'card-3', title: 'プロトタイプ作成', description: 'HTML/CSS/JS でモックを作る', dueDate: '2026-06-07' },
          ]
        },
        {
          id: 'col-3',
          title: '完了',
          cards: [
            { id: 'card-4', title: '要件定義書の作成', description: '', dueDate: null },
          ]
        },
      ]
    }
  ];
  save();
}

renderBoardList();
