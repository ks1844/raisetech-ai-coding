import { useState } from 'react';
import { SearchCardsParams } from '../types';

interface SearchBarProps {
  onSearch: (params: SearchCardsParams) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [keyword, setKeyword] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | ''>('');
  const [dueFrom, setDueFrom] = useState('');
  const [dueTo, setDueTo] = useState('');
  const [sort, setSort] = useState<'position' | 'priority' | 'dueDate' | ''>('');

  const handleSearch = () => {
    const params: SearchCardsParams = {};
    if (keyword) params.keyword = keyword;
    if (priority) params.priority = priority as 'high' | 'medium' | 'low';
    if (dueFrom) params.dueFrom = dueFrom;
    if (dueTo) params.dueTo = dueTo;
    if (sort) params.sort = sort as 'position' | 'priority' | 'dueDate';

    onSearch(params);
  };

  return (
    <div className="p-4 bg-gray-100 rounded mb-4">
      <h3 className="font-bold mb-3">カード検索</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-sm font-medium mb-1">キーワード</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="カード名で検索"
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">優先度</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
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
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">期限日（終了）</label>
          <input
            type="date"
            value={dueTo}
            onChange={(e) => setDueTo(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">並び順</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="">デフォルト</option>
            <option value="position">位置順</option>
            <option value="priority">優先度順</option>
            <option value="dueDate">期限日順</option>
          </select>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
      >
        検索
      </button>
    </div>
  );
};
