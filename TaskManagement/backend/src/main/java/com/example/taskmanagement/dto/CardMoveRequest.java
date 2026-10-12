package com.example.taskmanagement.dto;

public record CardMoveRequest(Long columnId, Integer position) {
	public CardMoveRequest {
		if (columnId == null) {
			throw new IllegalArgumentException("columnId は必須です");
		}
		if (position == null || position < 1) {
			throw new IllegalArgumentException("position は1以上の数値を指定してください");
		}
	}
}
