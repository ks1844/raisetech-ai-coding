import { useEffect, useState } from 'react';
import type { BoardDetailResponse, ColumnWithCards, SearchCardsParams } from '../types';
import { fetchBoardDetail, searchCards } from '../api/client';
import { SearchBar } from '../components/SearchBar';
import { CardItem } from '../components/CardItem';

interface BoardDetailPageProps {
  boardId: number;
  onBack: () => void;
}

export const BoardDetailPage = ({ boardId, onBack }: BoardDetailPageProps) => {
  const [board, setBoard] = useState<BoardDetailResponse | null>(null);
  const [displayColumns, setDisplayColumns] = useState<ColumnWithCards[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                    <CardItem key={card.id} card={card} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
