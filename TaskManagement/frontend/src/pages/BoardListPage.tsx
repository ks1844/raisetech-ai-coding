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
      } catch {
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
    <div className="min-h-screen bg-gray-100">
      <div className="bg-slate-700 text-white px-6 py-4 shadow">
        <h1 className="text-2xl font-bold">ボード一覧</h1>
      </div>

      <div className="p-6">
        {boards.length === 0 ? (
          <p className="text-gray-600">ボードがありません。</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => onSelectBoard(board.id)}
                className="p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
              >
                <h2 className="text-lg font-semibold text-gray-800">{board.title}</h2>
                <p className="text-xs text-gray-500 mt-2">
                  作成: {new Date(board.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
