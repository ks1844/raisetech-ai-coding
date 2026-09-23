export interface CardResponse {
  id: number;
  columnId: number;
  title: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  dueDate: string | null;
  position: number;
}

export interface ColumnResponse {
  id: number;
  boardId: number;
  title: string;
  position: number;
}

export interface ColumnWithCards extends ColumnResponse {
  cards: CardResponse[];
}

export interface BoardResponse {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardDetailResponse {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  columns: ColumnWithCards[];
}

export interface SearchCardsParams {
  columnId?: number;
  keyword?: string;
  priority?: 'high' | 'medium' | 'low';
  dueFrom?: string;
  dueTo?: string;
  sort?: 'position' | 'priority' | 'dueDate';
}
