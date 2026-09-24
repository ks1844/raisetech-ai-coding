package com.example.taskmanagement.dto;

import java.time.LocalDate;

public record CardCreateRequest(
		Long columnId,
		String title,
		String priority,
		String description,
		LocalDate dueDate
) {
	public CardCreateRequest {
		if (columnId == null) {
			throw new IllegalArgumentException("columnId は必須です");
		}
		if (title == null || title.isBlank()) {
			throw new IllegalArgumentException("title は必須です");
		}
		if (title.length() > 100) {
			throw new IllegalArgumentException("title は100文字以下である必要があります");
		}
	}

	public String resolvePriority() {
		return priority != null ? priority : "medium";
	}

	public String resolveDescription() {
		return description != null ? description : "";
	}
}
