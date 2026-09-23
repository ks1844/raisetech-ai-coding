import { useEffect, useState } from 'react';
import type { BoardDetailResponse, CardResponse, ColumnWithCards, SearchCardsParams } from '../types';
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
      } catch (err) {
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
    } catch (err) {
      setError('検索に失敗しました');
    }
  };

  const handleReset = async () => {
    if (!board) return;
    try {
      const data = await fetchBoardDetail(boardId);
      setDisplayColumns(data.columns);
    } catch (err) {
      setError('リセットに失敗しました');
    }
  };

  if (loading) return <div className="p-4">読み込み中...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!board) return <div className="p-4">ボードが見つかりません</div>;

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="mb-4 px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded text-sm"
      >
        一覧へ戻る
      </button>
      <h1 className="text-2xl font-bold mb-4">{board.title}</h1>

      <SearchBar onSearch={handleSearch} />
      <button
        onClick={handleReset}
        className="mb-4 px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
      >
        検索をリセット
      </button>

      <div className="flex overflow-x-auto gap-4">
        {displayColumns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80 bg-gray-50 p-3 rounded border border-gray-300">
            <h2 className="font-bold text-lg mb-3">{column.title}</h2>
            <div className="space-y-2">
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
  );
};
