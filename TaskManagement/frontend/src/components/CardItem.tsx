import type { CardResponse } from '../types';

interface CardItemProps {
  card: CardResponse;
}

export const CardItem = ({ card }: CardItemProps) => {
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
    <div className="p-3 rounded bg-white border border-gray-200 shadow-sm">
      <h4 className="font-semibold text-sm mb-2">{card.title}</h4>
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
