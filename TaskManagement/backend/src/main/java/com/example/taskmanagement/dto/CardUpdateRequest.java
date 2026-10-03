package com.example.taskmanagement.dto;

import java.time.LocalDate;

public record CardUpdateRequest(
	String title,
	String priority,
	String description,
	LocalDate dueDate
) {
	public CardUpdateRequest {
		if (title != null && title.isBlank()) {
			throw new IllegalArgumentException("タイトルは空白不可です");
		}
	}
}
