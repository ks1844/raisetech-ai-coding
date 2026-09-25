import type { CardResponse } from '../types';

interface CardItemProps {
  card: CardResponse;
  onEdit?: (card: CardResponse) => void;
  onDelete?: (cardId: number) => void;
}

export const CardItem = ({ card, onEdit, onDelete }: CardItemProps) => {
  const priorityBadgeColor = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
  };

  const priorityLabel = {
    high: '高',
    medium: '中',
    low: '低',
  };

  const formatDueDate = (date: string | null) => {
    if (!date) return null;
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}/${day}`;
  };

  return (
    <div
      onClick={() => onEdit?.(card)}
      className="p-3 rounded bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm flex-1">{card.title}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('このカードを削除してもよろしいですか？')) {
              onDelete?.(card.id);
            }
          }}
          className="text-red-500 hover:text-red-700 text-xs font-bold transition"
        >
          ×
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className={`${priorityBadgeColor[card.priority]} text-white px-2 py-1 rounded font-medium`}>
          {priorityLabel[card.priority]}
        </span>
        {card.dueDate && (
          <span className="text-gray-600">期限: {formatDueDate(card.dueDate)}</span>
        )}
      </div>
    </div>
  );
};
