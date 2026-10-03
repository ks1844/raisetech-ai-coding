import type { CardResponse } from '../types';
import { Draggable } from '@hello-pangea/dnd';

interface CardItemProps {
  card: CardResponse;
  index: number;
  onEdit?: (card: CardResponse) => void;
  onDelete?: (cardId: number) => void;
}

export const CardItem = ({ card, index, onEdit, onDelete }: CardItemProps) => {
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
    <Draggable draggableId={`card-${card.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit?.(card)}
          className={`p-3 rounded bg-white border border-gray-200 shadow-sm cursor-grab hover:shadow-md transition ${
            snapshot.isDragging ? 'shadow-lg opacity-80 bg-gray-50' : ''
          }`}
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
      )}
    </Draggable>
  );
};
