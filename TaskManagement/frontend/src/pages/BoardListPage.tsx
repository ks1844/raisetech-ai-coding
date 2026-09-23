import { useEffect, useState } from 'react';
import type { BoardResponse } from '../types';
import { fetchBoards } from '../api/client';

interface BoardListPageProps {
  onSelectBoard: (boardId: number) => void;
}

export const BoardListPage = ({ onSelectBoard }: BoardListPageProps) => {
  const [boards, setBoards] = useState<BoardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBoards = async () => {
      try {
        const data = await fetchBoards();
        setBoards(data);
      } catch (err) {
        setError('ボード一覧の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadBoards();
  }, []);

  if (loading) return <div className="p-4">読み込み中...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ボード一覧</h1>
      {boards.length === 0 ? (
        <p className="text-gray-600">ボードがありません。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <div
              key={board.id}
              onClick={() => onSelectBoard(board.id)}
              className="p-4 border border-gray-300 rounded cursor-pointer hover:shadow-lg hover:bg-gray-50 transition"
            >
              <h2 className="text-lg font-semibold">{board.title}</h2>
              <p className="text-xs text-gray-500 mt-2">
                作成: {new Date(board.createdAt).toLocaleDateString('ja-JP')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
