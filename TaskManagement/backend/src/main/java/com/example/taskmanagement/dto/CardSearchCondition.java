package com.example.taskmanagement.dto;

import java.time.LocalDate;

public record CardSearchCondition(
		Long columnId,
		String keyword,
		String priority,
		LocalDate dueFrom,
		LocalDate dueTo,
		String sort
) {
}
