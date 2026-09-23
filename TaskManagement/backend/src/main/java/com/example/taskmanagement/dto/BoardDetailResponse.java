package com.example.taskmanagement.dto;

import java.util.List;

public record BoardDetailResponse(
		Long id,
		String title,
		List<ColumnWithCards> columns
) {
	public record ColumnWithCards(
			Long id,
			String title,
			Integer position,
			List<CardResponse> cards
	) {
	}
}
