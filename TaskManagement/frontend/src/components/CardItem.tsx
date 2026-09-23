import { CardResponse } from '../types';

interface CardItemProps {
  card: CardResponse;
}

export const CardItem = ({ card }: CardItemProps) => {
  const priorityColor = {
    high: 'bg-red-100',
    medium: 'bg-yellow-100',
    low: 'bg-green-100',
  };

  return (
    <div className={`p-3 rounded border border-gray-300 ${priorityColor[card.priority]}`}>
      <h4 className="font-semibold text-sm mb-2">{card.title}</h4>
      <div className="flex justify-between items-center text-xs text-gray-600">
        <span className="capitalize">{card.priority}</span>
        {card.dueDate && <span>{new Date(card.dueDate).toLocaleDateString('ja-JP')}</span>}
      </div>
    </div>
  );
};
