import { useState, useEffect } from 'react';
import type { SearchCardsParams } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (params: SearchCardsParams) => void;
  onReset: () => void;
}

export const SearchModal = ({ isOpen, onClose, onSearch, onReset }: SearchModalProps) => {
  const [keyword, setKeyword] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | ''>('');
  const [dueFrom, setDueFrom] = useState('');
  const [dueTo, setDueTo] = useState('');
  const [sort, setSort] = useState<'position' | 'priority' | 'dueDate'>('position');

  const handleSearch = () => {
    const params: SearchCardsParams = {};
    if (keyword) params.keyword = keyword;
    if (priority) params.priority = priority as 'high' | 'medium' | 'low';
    if (dueFrom) params.dueFrom = dueFrom;
    if (dueTo) params.dueTo = dueTo;
    params.sort = sort;

    onSearch(params);
    onClose();
  };

  const handleReset = () => {
    setKeyword('');
    setPriority('');
    setDueFrom('');
    setDueTo('');
    setSort('position');
    onReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">カード検索</h2>

        <div className="space-y-3 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">キーワード</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="カード名で検索"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">優先度</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low' | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">すべて</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">期限日（開始）</label>
            <input
              type="date"
              value={dueFrom}
              onChange={(e) => setDueFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">期限日（終了）</label>
            <input
              type="date"
              value={dueTo}
              onChange={(e) => setDueTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">並び順</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'position' | 'priority' | 'dueDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="position">位置順</option>
              <option value="priority">優先度順</option>
              <option value="dueDate">期限日順</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded font-medium transition"
          >
            リセット
          </button>
          <button
            onClick={() => onClose()}
            className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded font-medium transition"
          >
            キャンセル
          </button>
          <button
            onClick={handleSearch}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition"
          >
            検索
          </button>
        </div>
      </div>
    </div>
  );
};
