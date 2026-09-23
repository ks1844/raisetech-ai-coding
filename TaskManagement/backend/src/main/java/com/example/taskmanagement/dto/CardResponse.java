package com.example.taskmanagement.dto;

import com.example.taskmanagement.entity.Card;

import java.time.LocalDate;

public record CardResponse(
		Long id,
		Long columnId,
		String title,
		String priority,
		String description,
		LocalDate dueDate,
		Integer position
) {
	public static CardResponse from(Card card) {
		return new CardResponse(
				card.getId(),
				card.getColumnId(),
				card.getTitle(),
				card.getPriority(),
				card.getDescription(),
				card.getDueDate(),
				card.getPosition()
		);
	}
}
