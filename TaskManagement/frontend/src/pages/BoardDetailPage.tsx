import { useEffect, useState } from 'react';
import type { BoardDetailResponse, ColumnWithCards, SearchCardsParams, CardCreateRequest, CardResponse, CardUpdateRequest } from '../types';
import { fetchBoardDetail, searchCards, createCard, updateCard } from '../api/client';
import { SearchBar } from '../components/SearchBar';
import { CardItem } from '../components/CardItem';
import { CardEditModal } from '../components/CardEditModal';

interface BoardDetailPageProps {
  boardId: number;
  onBack: () => void;
}

export const BoardDetailPage = ({ boardId, onBack }: BoardDetailPageProps) => {
  const [board, setBoard] = useState<BoardDetailResponse | null>(null);
  const [displayColumns, setDisplayColumns] = useState<ColumnWithCards[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CardCreateRequest>({
    columnId: 0,
    title: '',
    priority: 'medium',
    description: '',
    dueDate: null,
  });
  const [editingCard, setEditingCard] = useState<CardResponse | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<CardUpdateRequest>({
    title: undefined,
    priority: undefined,
    description: undefined,
    dueDate: undefined,
  });

  useEffect(() => {
    const loadBoard = async () => {
      try {
        const data = await fetchBoardDetail(boardId);
        setBoard(data);
        setDisplayColumns(data.columns);
      } catch {
        setError('ボード詳細の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [boardId]);

  const handleSearch = async (params: SearchCardsParams) => {
    if (!board) return;

    try {
      const searchResults = await searchCards(params);

      // カラムごとにカードをグループ化
      const updatedColumns = board.columns.map((column) => ({
        ...column,
        cards: searchResults.filter((card) => card.columnId === column.id),
      }));

      setDisplayColumns(updatedColumns);
    } catch {
      setError('検索に失敗しました');
    }
  };

  const handleReset = async () => {
    if (!board) return;
    try {
      const data = await fetchBoardDetail(boardId);
      setDisplayColumns(data.columns);
    } catch {
      setError('リセットに失敗しました');
    }
  };

  const handleOpenCreateModal = (columnId: number) => {
    setSelectedColumnId(columnId);
    setFormData({ columnId, title: '', priority: 'medium', description: '', dueDate: null });
    setShowCreateModal(true);
  };

  const handleCreateCard = async () => {
    if (!formData.title.trim()) {
      setError('タイトルは必須です');
      return;
    }

    try {
      await createCard(formData);
      setShowCreateModal(false);
      // ボード詳細を再取得して画面を更新
      const data = await fetchBoardDetail(boardId);
      setBoard(data);
      setDisplayColumns(data.columns);
    } catch {
      setError('カード作成に失敗しました');
    }
  };

  const handleOpenEditModal = (card: CardResponse) => {
    setEditingCard(card);
    setEditFormData({
      title: undefined,
      priority: undefined,
      description: undefined,
      dueDate: undefined,
    });
    setShowEditModal(true);
  };

  const handleUpdateCard = async () => {
    if (!editingCard) return;

    try {
      await updateCard(editingCard.id, editFormData);
      setShowEditModal(false);
      // ボード詳細を再取得して画面を更新
      const data = await fetchBoardDetail(boardId);
      setBoard(data);
      setDisplayColumns(data.columns);
    } catch {
      setError('カード更新に失敗しました');
    }
  };

  if (loading) return <div className="p-4">読み込み中...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!board) return <div className="p-4">ボードが見つかりません</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-slate-700 text-white px-6 py-4 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{board.title}</h1>
          <button
            onClick={onBack}
            className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm transition"
          >
            一覧へ戻る
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 bg-white rounded p-4 shadow-sm">
          <SearchBar onSearch={handleSearch} />
          <button
            onClick={handleReset}
            className="mt-3 px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
          >
            検索をリセット
          </button>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4">
          {displayColumns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80 bg-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-gray-800">{column.title}</h2>
                <span className="bg-gray-400 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-semibold">
                  {column.cards.length}
                </span>
              </div>
              <div className="space-y-3">
                {column.cards.length === 0 ? (
                  <p className="text-gray-500 text-sm">カードはありません</p>
                ) : (
                  column.cards.map((card) => (
                    <CardItem key={card.id} card={card} onEdit={handleOpenEditModal} />
                  ))
                )}
              </div>
              <button
                onClick={() => handleOpenCreateModal(column.id)}
                className="w-full mt-4 px-3 py-2 bg-gray-300 hover:bg-gray-400 rounded text-gray-700 text-sm font-medium transition"
              >
                + カードを追加
              </button>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4">カードを追加</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="タスク名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="詳細..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">期限日</label>
                <input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded font-medium transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateCard}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCard && (
        <CardEditModal
          card={editingCard}
          isOpen={showEditModal}
          formData={editFormData}
          onFormChange={setEditFormData}
          onSave={handleUpdateCard}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};
