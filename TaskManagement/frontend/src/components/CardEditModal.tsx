import type { CardResponse, CardUpdateRequest } from '../types';

interface CardEditModalProps {
  card: CardResponse;
  isOpen: boolean;
  formData: CardUpdateRequest;
  onFormChange: (data: CardUpdateRequest) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const CardEditModal = ({
  card,
  isOpen,
  formData,
  onFormChange,
  onSave,
  onCancel,
}: CardEditModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">カードを編集</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
            <input
              type="text"
              value={formData.title ?? card.title}
              onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="タスク名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
            <select
              value={formData.priority ?? card.priority}
              onChange={(e) => onFormChange({ ...formData, priority: e.target.value as any })}
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
              value={formData.description ?? card.description ?? ''}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="詳細..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">期限日</label>
            <input
              type="date"
              value={formData.dueDate ?? card.dueDate ?? ''}
              onChange={(e) => onFormChange({ ...formData, dueDate: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded font-medium transition"
          >
            キャンセル
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
