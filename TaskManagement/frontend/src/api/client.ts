import type { BoardDetailResponse, BoardResponse, CardResponse, CardCreateRequest, CardUpdateRequest, SearchCardsParams } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

export const fetchBoards = async (): Promise<BoardResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/boards`);
  if (!response.ok) throw new Error('Failed to fetch boards');
  return response.json();
};

export const fetchBoardDetail = async (id: number): Promise<BoardDetailResponse> => {
  const response = await fetch(`${API_BASE_URL}/boards/${id}`);
  if (!response.ok) throw new Error('Failed to fetch board detail');
  return response.json();
};

export const searchCards = async (params: SearchCardsParams): Promise<CardResponse[]> => {
  const queryParams = new URLSearchParams();

  if (params.columnId !== undefined) queryParams.append('columnId', params.columnId.toString());
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.priority) queryParams.append('priority', params.priority);
  if (params.dueFrom) queryParams.append('dueFrom', params.dueFrom);
  if (params.dueTo) queryParams.append('dueTo', params.dueTo);
  if (params.sort) queryParams.append('sort', params.sort);

  const url = `${API_BASE_URL}/cards?${queryParams.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to search cards');
  return response.json();
};

export const createCard = async (data: CardCreateRequest): Promise<CardResponse> => {
  const response = await fetch(`${API_BASE_URL}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create card');
  return response.json();
};

export const updateCard = async (id: number, data: CardUpdateRequest): Promise<CardResponse> => {
  const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update card');
  return response.json();
};
